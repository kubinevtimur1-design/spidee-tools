import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const FIXTURE_AUTHOR = "Фикстура автора";
const FIXTURE_COVER_ALT = "Фикстура обложки, не материал";

function loadPreview(register: boolean) {
  const sandbox = vm.createContext({
    window: register
      ? {
          CMS: {
            styles: [] as string[],
            templates: [] as string[],
            registerPreviewStyle(url: string) {
              this.styles.push(url);
            },
            component: null as null | { render: () => React.ReactElement },
            registerPreviewTemplate(name: string, component: { render: () => React.ReactElement }) {
              this.templates.push(name);
              this.component = component;
            },
          },
          createClass<T>(spec: T) {
            return spec;
          },
          h: React.createElement,
        }
      : {},
    URL,
    console,
  });
  const previewWindow = (sandbox as { window: Record<string, unknown> }).window;
  previewWindow.window = previewWindow;
  vm.runInContext(
    fs.readFileSync(path.join(process.cwd(), "public/admin/preview.js"), "utf8"),
    sandbox,
  );
  return previewWindow as {
    renderSpidyPreview: (data: unknown, h: typeof React.createElement) => React.ReactElement;
    CMS?: {
      styles: string[];
      templates: string[];
      component: null | { render: (this: { props: Record<string, unknown> }) => React.ReactElement };
    };
  };
}

const fixture = {
  title: "Фикстура предпросмотра",
  description: "Подпись фикстуры, не текст черновика.",
  section: "Фикстура",
  draft: false,
  author: FIXTURE_AUTHOR,
  date: "2026-01-15",
  updated: "",
  cover: "/blog/media/fixture-cover.webp",
  coverAlt: FIXTURE_COVER_ALT,
  blocks: [
    {
      type: "markdown",
      text: [
        "## Код и ссылка",
        "",
        "Смотрите [генератор](https://spidytools.ru/utm-generator/) и `метку`.",
        "",
        "```",
        "utm_medium=posev",
        "```",
        "",
        "| Поле | Пример |",
        "| --- | --- |",
        "| source | kanal |",
        "",
        "[плохо](javascript:alert(1))",
      ].join("\n"),
    },
    {
      type: "note",
      tone: "info",
      text: "Заметка фикстуры с `кодом`.",
    },
    {
      type: "comparison",
      caption: "Таблица фикстуры",
      columns: ["Канал", "Цена"],
      rows: [["@fixture", "1000"]],
    },
    {
      type: "tool",
      tool: "utm-generator",
      caption: "Карточка инструмента фикстуры.",
    },
    {
      type: "cta",
      lead: "Кнопка фикстуры:",
      label: "Открыть генератор",
      href: "/utm-generator/",
    },
  ],
};

test("registered Decap preview renders site blocks from a labeled fixture", () => {
  const preview = loadPreview(false);
  const html = renderToStaticMarkup(preview.renderSpidyPreview(fixture, React.createElement));
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(html, new RegExp(FIXTURE_AUTHOR));
  assert.match(html, /<time[^>]*dateTime="2026-01-15"/);
  assert.match(html, /15 января 2026/);
  assert.match(html, /src="\/blog\/media\/fixture-cover\.webp"/);
  assert.match(html, new RegExp(`alt="${FIXTURE_COVER_ALT}"`));
  assert.equal(html.includes("data:image"), false);
  assert.match(html, /data-block="note"/);
  assert.match(html, /data-block="comparison"/);
  assert.match(html, /@fixture/);
  assert.match(html, /data-block="tool"/);
  assert.match(html, /href="\/utm-generator\/"/);
  assert.match(html, /data-block="cta"/);
  assert.match(html, /class="spidy-button"/);
  assert.match(html, /<pre><code>utm_medium=posev/);
  assert.match(html, /<th[^>]*>Поле<\/th>/);
  assert.equal(/javascript:/i.test(html), false);
  assert.equal(html.includes("<script"), false);
});

test("Decap registration uses the same preview and the real draft stays unlabeled", () => {
  const preview = loadPreview(true);
  assert.deepEqual(preview.CMS?.templates, ["posts"]);
  assert.deepEqual(preview.CMS?.styles, ["/admin/preview.css"]);

  const source = fs.readFileSync(
    path.join(process.cwd(), "content/blog/utm-dlya-posevov-v-telegram.md"),
    "utf8",
  );
  assert.equal(source.includes(FIXTURE_AUTHOR), false);
  assert.equal(source.includes(FIXTURE_COVER_ALT), false);
  assert.match(source, /author: ""/);
  assert.match(source, /date: ""/);
  assert.match(source, /cover: ""/);
  assert.match(source, /публичном Git/);

  const empty = renderToStaticMarkup(
    preview.renderSpidyPreview(
      {
        title: "Пустая фикстура",
        draft: true,
        author: "",
        date: "",
        cover: "",
        blocks: [],
      },
      React.createElement,
    ),
  );
  assert.equal(empty.includes(FIXTURE_AUTHOR), false);
  assert.equal(/<time[\s>]/.test(empty), false);
  assert.equal(/<img[\s>]/.test(empty), false);
});

test("preview cover matches the site media policy and trusted blob uploads", () => {
  const preview = loadPreview(true);
  const render = preview.CMS?.component?.render;
  if (!render) throw new Error("registered preview is missing");
  const draw: (this: { props: Record<string, unknown> }) => React.ReactElement = render;

  function htmlFor(
    cover: unknown,
    getAsset?: (value: unknown) => string,
  ) {
    const entry = {
      getIn(path: string[]) {
        const data: Record<string, unknown> = {
          title: "Проверка обложки",
          draft: false,
          cover,
          cover_alt: "alt",
          blocks: [],
        };
        let current: unknown = { data };
        for (const key of path) {
          if (current == null || typeof current !== "object") return undefined;
          current = (current as Record<string, unknown>)[key];
        }
        return current;
      },
    };
    const view = draw.call({
      props: {
        entry,
        getAsset: getAsset ?? ((value: unknown) => value),
      },
    });
    return renderToStaticMarkup(view);
  }

  assert.match(htmlFor("/blog/media/cover.webp"), /src="\/blog\/media\/cover\.webp"/);
  assert.match(
    htmlFor("https://spidytools.ru/blog/media/cover.webp"),
    /src="\/blog\/media\/cover\.webp"/,
  );
  assert.equal(/<img[\s>]/.test(htmlFor("https://evil.example/a.png")), false);
  assert.equal(/<img[\s>]/.test(htmlFor("data:image/png;base64,aaaa")), false);
  assert.equal(/<img[\s>]/.test(htmlFor("/blog/media/../secret.txt")), false);
  assert.equal(/<img[\s>]/.test(htmlFor("/blog/media/%2e%2e/secret.txt")), false);

  assert.match(
    htmlFor("/blog/media/new.webp", () => "blob:http://localhost/pending"),
    /src="blob:http:\/\/localhost\/pending"/,
  );
  assert.match(
    htmlFor({ path: "/blog/media/new.webp" }, () => "blob:http://localhost/object"),
    /src="blob:http:\/\/localhost\/object"/,
  );
  assert.match(
    htmlFor("/blog/media/new.webp", () => "https://cdn.example/new.webp"),
    /src="\/blog\/media\/new\.webp"/,
  );
  assert.equal(
    /<img[\s>]/.test(
      htmlFor("data:image/png;base64,aaaa", () => "blob:http://localhost/laundered"),
    ),
    false,
  );
  assert.equal(
    /<img[\s>]/.test(htmlFor("https://evil.example/a.png", () => "blob:http://localhost/laundered")),
    false,
  );
});
