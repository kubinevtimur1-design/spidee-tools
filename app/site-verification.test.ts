import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const GOOGLE_CODE = "hs9bS0xf0dbU1gKLvGgd4XUPRo2J-I-21kq32Op9qtI";
const YANDEX_CODE = "c03d0fd9f317dd71";

// Next.js serializes void elements like every other meta tag in the export.
const GOOGLE_TAG =
  `<meta name="google-site-verification" content="${GOOGLE_CODE}"/>`;
const YANDEX_TAG =
  `<meta name="yandex-verification" content="${YANDEX_CODE}"/>`;

const HOMEPAGE_HTML = path.join(process.cwd(), "out", "index.html");

const PRESERVED_HEAD = [
  "<title>Полезные инструменты для маркетолога — Spidy Tools</title>",
  '<meta name="description" content="Простой и быстрый сервис для ежедневной рутины маркетолога: онлайн-подсчет длины сниппетов, генерация ссылок с UTM и парсер тегов."/>',
  '<meta name="author" content="Spidy Tools"/>',
  '<meta name="keywords" content="seo сервис,инструменты маркетолога,генератор utm,проверка title description"/>',
  '<meta name="robots" content="index, follow"/>',
  '<link rel="canonical" href="https://spidytools.ru/"/>',
  '<meta property="og:title" content="Spidy Tools — инструменты для SEO и маркетолога"/>',
  '<meta property="og:description" content="Подсчёт символов, транслит в ЧПУ и генератор UTM в один клик. Бесплатно, без регистрации."/>',
  '<meta property="og:url" content="https://spidytools.ru/"/>',
  '<meta property="og:site_name" content="Spidy Tools"/>',
  '<meta property="og:locale" content="ru_RU"/>',
  '<meta property="og:image" content="https://spidytools.ru/hero-glass.webp"/>',
  '<meta property="og:image:type" content="image/webp"/>',
  '<meta property="og:image:width" content="2048"/>',
  '<meta property="og:image:height" content="2048"/>',
  '<meta property="og:image:alt" content="Spidy Tools"/>',
  '<meta property="og:type" content="website"/>',
  '<meta name="twitter:card" content="summary"/>',
  '<meta name="twitter:title" content="Spidy Tools — инструменты для SEO и маркетолога"/>',
  '<meta name="twitter:description" content="Подсчёт символов, транслит в ЧПУ и генератор UTM в один клик. Бесплатно, без регистрации."/>',
  '<meta name="twitter:image" content="https://spidytools.ru/hero-glass.webp"/>',
  '<link rel="icon" href="/spidy-logo.PNG"/>',
  '"@type":"Organization"',
  '"@id":"https://spidytools.ru/#organization"',
];

function count(haystack: string, needle: string): number {
  let found = 0;
  let index = 0;
  while (index <= haystack.length) {
    const next = haystack.indexOf(needle, index);
    if (next === -1) break;
    found += 1;
    index = next + needle.length;
  }
  return found;
}

function headOf(html: string): string {
  const start = html.indexOf("<head>");
  const end = html.indexOf("</head>");
  assert.ok(start !== -1 && end > start, "homepage export has a head");
  return html.slice(start, end);
}

test("root metadata declares the Yandex and Google verification codes", () => {
  const layout = readFileSync(
    path.join(process.cwd(), "app", "layout.tsx"),
    "utf8",
  );

  assert.match(
    layout,
    /verification:\s*\{[^}]*google:\s*"hs9bS0xf0dbU1gKLvGgd4XUPRo2J-I-21kq32Op9qtI"[^}]*yandex:\s*"c03d0fd9f317dd71"[^}]*\}/,
  );
  assert.equal(count(layout, GOOGLE_CODE), 1);
  assert.equal(count(layout, YANDEX_CODE), 1);
  assert.equal(layout.includes("yahoo:"), false);
});

test(
  "built homepage head contains each verification meta tag once",
  { skip: existsSync(HOMEPAGE_HTML) ? false : "requires next build (out/index.html)" },
  () => {
    const html = readFileSync(HOMEPAGE_HTML, "utf8");
    const head = headOf(html);
    const afterHead = html.slice(html.indexOf("</head>"));

    assert.equal(count(head, GOOGLE_TAG), 1);
    assert.equal(count(head, YANDEX_TAG), 1);
    assert.equal(count(head, `name="google-site-verification"`), 1);
    assert.equal(count(head, `name="yandex-verification"`), 1);
    assert.equal(count(head, `content="${GOOGLE_CODE}"`), 1);
    assert.equal(count(head, `content="${YANDEX_CODE}"`), 1);
    assert.equal(count(afterHead, `<meta name="google-site-verification"`), 0);
    assert.equal(count(afterHead, `<meta name="yandex-verification"`), 0);

    for (const tag of PRESERVED_HEAD) {
      assert.equal(head.includes(tag), true, tag);
    }

    assert.equal(html.includes("mc.yandex.ru/metrika/tag.js?id=113957937"), true);
  },
);
