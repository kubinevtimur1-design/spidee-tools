import assert from "node:assert/strict";
import test from "node:test";
import { CUSTOM_TITLE_STYLE_MAX, snippetRole } from "./serp-limits";
import {
  capPixelCutByChars,
  truncateByChars,
  truncateByPixels,
  yandexPieces,
} from "./serp-truncate";

const px = (sample: string) => sample.length * 10;

test("collapses whitespace before measuring", () => {
  const cut = truncateByChars("  привет\n\nмир  ", 100);
  assert.equal(cut.normalized, "привет мир");
  assert.equal(cut.truncated, false);
});

test("keeps a string that fits the character budget", () => {
  const cut = truncateByChars("привет мир", 10);
  assert.equal(cut.visible, "привет мир");
  assert.equal(cut.overflow, "");
});

test("cuts on the previous word instead of mid-word", () => {
  const cut = truncateByChars("привет мир!", 10);
  assert.equal(cut.visible, "привет");
  assert.equal(cut.overflow, "мир!");
  assert.equal(cut.truncated, true);
});

test("splits a single long word by characters", () => {
  const cut = truncateByChars("абвгдеёжзий", 5);
  assert.equal(cut.visible, "абвгд");
  assert.equal(cut.overflow, "еёжзий");
});

test("pixel cut keeps the last whole word that fits with ellipsis", () => {
  const cut = truncateByPixels("aa bb cc", 70, px);
  assert.equal(cut.visible, "aa bb");
  assert.equal(cut.overflow, "cc");
  assert.equal(cut.visibleWidth, 60);
  assert.equal(cut.fullWidth, 80);
  assert.equal(cut.truncated, true);
});

test("pixel cut does not add ellipsis when the full line fits", () => {
  const cut = truncateByPixels("abcde", 50, px);
  assert.equal(cut.truncated, false);
  assert.equal(cut.visible, "abcde");
  assert.equal(cut.visibleWidth, 50);
});

test("pixel cut falls back to characters when the first word is wider than the budget", () => {
  const cut = truncateByPixels("abcdef", 50, px);
  assert.equal(cut.visible, "abcd");
  assert.equal(cut.overflow, "ef");
  assert.equal(cut.visibleWidth, 50);
});

test("custom character cap wins when it is stricter than pixels", () => {
  const pixel = truncateByPixels("hello world", 500, px);
  const capped = capPixelCutByChars(pixel, 5, px);
  assert.equal(capped.visible, "hello");
  assert.equal(capped.overflow, "world");
  assert.equal(capped.cappedByCustom, true);
  assert.equal(pixel.truncated, false);
});

test("yandex description marks 160–200 as soft and cuts after 200", () => {
  const pieces = yandexPieces("я".repeat(210), 160, 200, null);
  assert.equal(pieces.keep.length, 160);
  assert.equal(pieces.soft.length, 40);
  assert.equal(pieces.cut.length, 10);
  assert.equal(pieces.cappedByCustom, false);
});

test("yandex title soft-warns by cutting after 60", () => {
  const pieces = yandexPieces("слово ".repeat(20).trim(), 60, 60, null);
  assert.ok(pieces.keep.length <= 60);
  assert.equal(pieces.soft, "");
  assert.ok(pieces.cut.length > 0);
});

test("custom limit at or below 80 is a title, above is a description", () => {
  assert.equal(snippetRole("title", 200), "title");
  assert.equal(snippetRole("description", 10), "description");
  assert.equal(snippetRole("custom", CUSTOM_TITLE_STYLE_MAX), "title");
  assert.equal(snippetRole("custom", CUSTOM_TITLE_STYLE_MAX + 1), "description");
});
