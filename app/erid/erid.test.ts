import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_UTM, buildUtmUrl } from "../utm-generator/utm";
import {
  appendErid,
  buildMarking,
  checkPost,
  formatAdvertiser,
  isShortenerUrl,
  isValidErid,
  isValidInnChecksum,
  SAMPLE_POST,
} from "./erid";

test("accepts known valid INNs and rejects a bad check digit", () => {
  assert.equal(isValidInnChecksum("7707083893"), true);
  assert.equal(isValidInnChecksum("7707083894"), false);
  assert.equal(isValidInnChecksum("500100732259"), true);
  assert.equal(isValidInnChecksum("500100732258"), false);
  assert.equal(isValidInnChecksum("770708389"), false);
  assert.equal(isValidInnChecksum("77070838930"), false);
});

test("formats the advertiser per type and builds the marking", () => {
  assert.equal(
    buildMarking({
      kind: "ooo",
      name: "Ромашка",
      inn: "7707083893",
      erid: "2VtzqvXXXXX",
    }),
    "Реклама. ООО «Ромашка», ИНН 7707083893. erid: 2VtzqvXXXXX",
  );
  assert.equal(
    formatAdvertiser("ooo", "ООО «Ромашка»"),
    "ООО «Ромашка»",
  );
  assert.equal(
    formatAdvertiser("ip", "Иванов Иван Иванович"),
    "ИП Иванов И. И.",
  );
  assert.equal(
    formatAdvertiser("self", "самозанятая Петрова Анна Сергеевна"),
    "Самозанятый Петрова А. С.",
  );
  assert.equal(
    formatAdvertiser("person", "Иванов Иван Иванович"),
    "Иванов Иван Иванович",
  );
});

test("checks only the erid alphabet, not the length", () => {
  assert.equal(isValidErid("2VtzqvXXXXX"), true);
  assert.equal(isValidErid("Ab"), true);
  assert.equal(isValidErid("2Vtzqv-XXXX"), false);
  assert.equal(isValidErid("токен"), false);
  assert.equal(isValidErid(""), false);
});

test("appends erid before the hash and keeps the token case", () => {
  assert.equal(
    appendErid("https://example.ru/sale", "2VtzQv"),
    "https://example.ru/sale?erid=2VtzQv",
  );
  assert.equal(
    appendErid("https://example.ru/sale?utm_source=vk", "aBcD12"),
    "https://example.ru/sale?utm_source=vk&erid=aBcD12",
  );
  assert.equal(
    appendErid("https://example.ru/sale?q=1#reviews", "AbC"),
    "https://example.ru/sale?q=1&erid=AbC#reviews",
  );
  assert.equal(
    appendErid("https://example.ru/sale#reviews", "AbC"),
    "https://example.ru/sale?erid=AbC#reviews",
  );
  assert.equal(
    appendErid(
      "https://Example.ru/Path?foo=1&ERID=old&bar=2#x",
      "2VtzQv",
    ),
    "https://Example.ru/Path?foo=1&erid=2VtzQv&bar=2#x",
  );
  assert.equal(
    appendErid("https://example.ru/a?q=%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82", "AbC"),
    "https://example.ru/a?q=%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82&erid=AbC",
  );
  assert.equal(appendErid("https://example.ru", ""), "https://example.ru");
});

test("erid survives a UTM link without changing earlier params", () => {
  const utm = buildUtmUrl(
    "https://example.ru/sale?q=1#reviews",
    { ...EMPTY_UTM, utm_source: "vk" },
    [],
  );

  assert.equal(
    appendErid(utm, "2VtzQv"),
    "https://example.ru/sale?q=1&utm_source=vk&erid=2VtzQv#reviews",
  );
});

test("recognises shortener hosts and leaves ordinary links alone", () => {
  assert.equal(isShortenerUrl("https://bit.ly/abc"), true);
  assert.equal(isShortenerUrl("https://clck.ru/abc"), true);
  assert.equal(isShortenerUrl("https://www.tinyurl.com/x"), true);
  assert.equal(isShortenerUrl("https://example.ru/sale?erid=AbC"), false);
  assert.equal(isShortenerUrl("https://notbit.ly/abc"), false);
});

test("checks a post for the marker, advertiser, erid case and shorteners", () => {
  const good = checkPost(SAMPLE_POST.text, SAMPLE_POST.link);
  assert.equal(good.hasAdMarker, true);
  assert.equal(good.hasAdvertiser, true);
  assert.equal(good.hasErid, true);
  assert.equal(good.caseState, "match");
  assert.equal(good.hasShortener, false);

  const noMarker = checkPost(
    "ООО «Ромашка», ИНН 7707083893. erid: AbC",
    "",
  );
  assert.equal(noMarker.hasAdMarker, false);
  assert.equal(noMarker.hasAdvertiser, true);
  assert.equal(
    checkPost("рекламодатель без пометки", "").hasAdMarker,
    false,
  );

  const mismatch = checkPost(
    "Реклама. ИП Иванов И. И. erid: AbC",
    "https://example.ru?erid=aBc",
  );
  assert.equal(mismatch.caseState, "mismatch");

  const short = checkPost(
    "Реклама. ООО «Ромашка». erid: AbC",
    "https://bit.ly/sale",
  );
  assert.equal(short.hasShortener, true);
});
