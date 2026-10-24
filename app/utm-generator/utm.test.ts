import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_UTM,
  buildUtmUrl,
  encodeUtmValue,
  shouldShowQr,
  type UtmValues,
} from "./utm";

function utm(partial: Partial<UtmValues> = {}): UtmValues {
  return { ...EMPTY_UTM, ...partial };
}

test("keeps braces in ad-platform macros", () => {
  assert.equal(encodeUtmValue("{campaign_id}"), "{campaign_id}");
  assert.equal(encodeUtmValue("sale {ad_id}"), "sale%20{ad_id}");
});

test("returns the address as-is when nothing is filled", () => {
  assert.equal(buildUtmUrl("", utm(), []), "");
  assert.equal(
    buildUtmUrl("  https://example.ru/catalog  ", utm(), []),
    "https://example.ru/catalog",
  );
});

test("appends utm params and keeps macros readable", () => {
  const result = buildUtmUrl(
    "https://example.ru/catalog",
    utm({
      utm_source: "yandex",
      utm_medium: "cpc",
      utm_campaign: "{campaign_id}",
      utm_content: "{ad_id}",
      utm_term: "купить товар",
    }),
    [],
  );

  assert.equal(
    result,
    "https://example.ru/catalog?utm_source=yandex&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term=%D0%BA%D1%83%D0%BF%D0%B8%D1%82%D1%8C%20%D1%82%D0%BE%D0%B2%D0%B0%D1%80",
  );
  assert.equal(shouldShowQr(result), true);
});

test("keeps the existing query and the hash", () => {
  const result = buildUtmUrl(
    "https://example.ru/sale?q=1#reviews",
    utm({ utm_source: "vk" }),
    [{ key: "partner id", value: "a&b" }],
  );

  assert.equal(
    result,
    "https://example.ru/sale?q=1&utm_source=vk&partner%20id=a%26b#reviews",
  );
});

test("does not add a second separator after ? or &", () => {
  assert.equal(
    buildUtmUrl("https://example.ru?", utm({ utm_source: "google" }), []),
    "https://example.ru?utm_source=google",
  );
  assert.equal(
    buildUtmUrl("https://example.ru?q=1&", utm({ utm_medium: "cpc" }), []),
    "https://example.ru?q=1&utm_medium=cpc",
  );
});

test("skips blank fields and blank custom params", () => {
  const result = buildUtmUrl(
    "https://example.ru",
    utm({ utm_source: "  telegram  ", utm_medium: "   " }),
    [
      { key: "", value: "x" },
      { key: "click_id", value: "  " },
      { key: " click_id ", value: "42" },
    ],
  );

  assert.equal(result, "https://example.ru?utm_source=telegram&click_id=42");
});

test("shows a QR only for a non-empty http(s) result", () => {
  assert.equal(shouldShowQr(""), false);
  assert.equal(shouldShowQr("   "), false);
  assert.equal(shouldShowQr("example.ru"), false);
  assert.equal(shouldShowQr("ftp://example.ru"), false);
  assert.equal(shouldShowQr("javascript:alert(1)"), false);
  assert.equal(shouldShowQr("https://"), false);
  assert.equal(shouldShowQr("https://example.ru/catalog"), true);
  assert.equal(shouldShowQr("HTTP://example.ru"), true);
  assert.equal(
    shouldShowQr(
      buildUtmUrl("not a url", utm({ utm_source: "yandex" }), []),
    ),
    false,
  );
});
