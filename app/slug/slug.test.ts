import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLE_HEADLINE, EXAMPLE_SLUG, toSlug } from "./slug";

test("turns the sample headline into a readable slug", () => {
  assert.equal(toSlug(EXAMPLE_HEADLINE), EXAMPLE_SLUG);
});

test("uses yo, zh, h and j", () => {
  assert.equal(toSlug("ёж"), "yozh");
  assert.equal(toSlug("хлеб"), "hleb");
  assert.equal(toSlug("сайт"), "sajt");
  assert.equal(toSlug("й"), "j");
  assert.equal(toSlug("ы"), "y");
});

test("drops hard and soft signs without a hyphen", () => {
  assert.equal(toSlug("подъезд"), "podezd");
  assert.equal(toSlug("съёмка"), "syomka");
  assert.equal(toSlug("жизнь"), "zhizn");
  assert.equal(toSlug("мальчик"), "malchik");
  assert.equal(toSlug("объект"), "obekt");
});

test("maps spaces to hyphens and collapses junk", () => {
  assert.equal(toSlug("  --Привет   мир!!  "), "privet-mir");
  assert.equal(toSlug("foo---bar"), "foo-bar");
  assert.equal(toSlug("-hello-"), "hello");
  assert.equal(toSlug("a - b"), "a-b");
  assert.equal(toSlug("привет\n\nмир"), "privet-mir");
});

test("keeps latin, digits and strips latin accents", () => {
  assert.equal(toSlug("SEO-аудит сайта 2026"), "seo-audit-sajta-2026");
  assert.equal(toSlug("café menu"), "cafe-menu");
  assert.equal(toSlug("O'Brien"), "obrien");
  assert.equal(toSlug("C++"), "c");
  assert.equal(toSlug("node.js"), "node-js");
});

test("lowercases by default and can keep case", () => {
  assert.equal(toSlug("Москва"), "moskva");
  assert.equal(toSlug("Москва", { preserveCase: true }), "Moskva");
  assert.equal(toSlug("Ёлка", { preserveCase: true }), "Yolka");
  assert.equal(toSlug("Щука", { preserveCase: true }), "Shchuka");
  assert.equal(toSlug("ЁЖ", { preserveCase: true }), "YoZh");
  assert.equal(toSlug("ЧПУ для SEO", { preserveCase: true }), "ChPU-dlya-SEO");
  assert.equal(toSlug("SEO-2026", { preserveCase: true }), "SEO-2026");
});

test("drops emoji and returns empty when nothing readable remains", () => {
  assert.equal(toSlug("привет 🕷️ мир"), "privet-mir");
  assert.equal(toSlug("ъь!!!"), "");
  assert.equal(toSlug("   "), "");
});

test("transliterates letters that show up beyond the Russian alphabet", () => {
  assert.equal(toSlug("їжа"), "yizha");
  assert.equal(toSlug("Євген"), "yevgen");
});
