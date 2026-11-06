import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ArticleCatalog } from "@/app/blog/catalog";
import { ArticleDocument } from "@/app/blog/article-document";
import { catalogMetadata } from "@/app/blog/catalog";
import sitemap from "@/app/sitemap";
import { sanitizeHref, sanitizeMediaSrc } from "@/lib/blog/href";
import {
  articleJsonLd,
  serializeJsonLd,
  shouldEmitArticleJsonLd,
} from "@/lib/blog/jsonld";
import { stripMatchingH1 } from "@/lib/blog/markdown";
import {
  articleStaticParams,
  includeDraftRoutes,
  loadArticles,
  parseArticleFile,
  publicArticles,
  resolveArticleSlug,
} from "@/lib/blog/content";
import type { Article } from "@/lib/blog/types";

const DRAFT_SLUG = "utm-dlya-posevov-v-telegram";
const DRAFT_TITLE =
  "UTM для посевов в Telegram: схема меток, которая не разваливается на 20 каналах";

function draftArticle(): Article {
  const articles = loadArticles();
  const article = articles.find((item) => item.slug === DRAFT_SLUG);
  assert.ok(article);
  return article;
}

test("committed article stays a draft without invented metadata", () => {
  const article = draftArticle();
  assert.equal(article.draft, true);
  assert.equal(article.author, "");
  assert.equal(article.date, "");
  assert.equal(article.updated, "");
  assert.equal(article.cover, "");
  assert.equal(article.coverAlt, "");
  assert.equal(publicArticles(loadArticles()).length, 0);
  assert.equal(
    articleStaticParams(loadArticles(), false).some((item) => item.slug === DRAFT_SLUG),
    false,
  );
  assert.equal(shouldEmitArticleJsonLd(article), false);
  assert.equal(
    resolveArticleSlug(loadArticles(), DRAFT_SLUG, { includeDrafts: false }),
    null,
  );
});

test("production preview flag cannot publish the draft route", () => {
  const env = process.env as Record<string, string | undefined>;
  const previousNodeEnv = env.NODE_ENV;
  const previousFlag = env.BLOG_DRAFT_PREVIEW;
  env.NODE_ENV = "production";
  env.BLOG_DRAFT_PREVIEW = "1";
  try {
    assert.equal(includeDraftRoutes(), false);
  } finally {
    env.NODE_ENV = previousNodeEnv;
    if (previousFlag === undefined) delete env.BLOG_DRAFT_PREVIEW;
    else env.BLOG_DRAFT_PREVIEW = previousFlag;
  }
});

test("sitemap and catalog omit the draft", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.some((url) => url.includes(DRAFT_SLUG)), false);
  assert.equal(urls.some((url) => url.endsWith("/blog/")), false);

  const html = renderToStaticMarkup(
    <ArticleCatalog articles={publicArticles(loadArticles())} />,
  );
  assert.equal(html.includes(DRAFT_TITLE), false);
  assert.match(html, /Опубликованных материалов пока нет/);
  assert.deepEqual(catalogMetadata(0).robots, { index: false, follow: false });
});

test("draft template keeps the supplied wording and one h1", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "content/blog", `${DRAFT_SLUG}.md`),
    "utf8",
  );
  assert.match(source, /Платформа уже видна из `utm_medium`/);
  assert.match(source, /оседают в «Прямых заходах»/);
  assert.match(source, /по закону о рекламе считается рекламой/);

  const html = renderToStaticMarkup(<ArticleDocument article={draftArticle()} />);
  const h1 = html.match(/<h1[\s>]/g) ?? [];
  assert.equal(h1.length, 1);
  assert.match(html, /utm_source/);
  assert.match(html, /erid=XXXX/);
  assert.match(html, /href="\/erid\/"/);
  assert.match(html, /href="\/qr\/"/);
  assert.match(html, /data-block="comparison"/);
  assert.match(html, /@marketing_tips/);
  assert.match(html, /data-block="note"/);
  assert.match(html, /Главное правило/);
  assert.match(html, /data-block="tool"/);
  assert.match(html, /data-block="cta"/);
  assert.match(html, /href="\/utm-generator\/?"/);
  assert.match(html, /Платформа уже видна/);
  assert.equal(/<time[\s>]/.test(html), false);
  assert.equal(/<img[\s>]/.test(html), false);
  assert.equal(html.includes('type="application/ld+json"'), false);
});

test("markdown does not execute raw html or javascript urls", () => {
  const article = draftArticle();
  const hostile: Article = {
    ...article,
    blocks: [
      {
        type: "markdown",
        text: [
          `<script>alert(1)</script>`,
          `<img src=x onerror=alert(1)>`,
          `[плохая](javascript:alert(1))`,
          `[нормальная](https://spidytools.ru/counter)`,
        ].join("\n\n"),
      },
    ],
  };
  const html = renderToStaticMarkup(<ArticleDocument article={hostile} />);
  assert.equal(/<script[\s>]/i.test(html), false);
  assert.equal(/<img[\s>]/i.test(html), false);
  assert.equal(/javascript:/i.test(html), false);
  assert.match(html, /href="\/counter\/"/);
});

test("duplicate h1 is removed and unsafe links are rejected", () => {
  assert.equal(
    stripMatchingH1(`# ${DRAFT_TITLE}\n\nДальше`, DRAFT_TITLE).trim(),
    "Дальше",
  );
  assert.equal(sanitizeHref("javascript:alert(1)"), null);
  assert.equal(sanitizeHref("data:text/html,hi"), null);
  assert.equal(sanitizeHref("http://spidytools.ru/utm-generator/"), null);
  assert.equal(sanitizeHref("https://spidytools.ru/utm-generator"), "/utm-generator/");
  assert.equal(sanitizeMediaSrc("/blog/media/../secret.txt"), null);
  assert.equal(sanitizeMediaSrc("/blog/media/cover.webp"), "/blog/media/cover.webp");
});

test("a publishable article emits Article JSON-LD and a draft cannot skip metadata", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "spidy-blog-"));
  const published = `---
title: Проверочный материал
description: Описание для поиска.
seo_title: ""
slug: proverochnyj-material
section: Разбор
draft: false
author: Редакция
date: "2026-11-01"
updated: "2026-11-02"
cover: /blog/media/cover.webp
cover_alt: Обложка проверки
keywords:
  - проверка
aliases:
  - staryj-adres
blocks:
  - type: markdown
    text: Текст
`;
  fs.writeFileSync(path.join(directory, "proverochnyj-material.md"), published);
  const articles = loadArticles(directory);
  assert.equal(articles.length, 1);
  assert.equal(shouldEmitArticleJsonLd(articles[0]), true);
  const jsonLd = articleJsonLd(articles[0], "https://spidytools.ru");
  assert.equal(jsonLd["@type"], "Article");
  assert.equal(jsonLd.headline, "Проверочный материал");
  assert.equal(jsonLd.datePublished, "2026-11-01");
  assert.equal(jsonLd.dateModified, "2026-11-02");
  assert.deepEqual(jsonLd.author, { "@type": "Person", name: "Редакция" });
  assert.equal(jsonLd.image, "https://spidytools.ru/blog/media/cover.webp");
  assert.equal(
    serializeJsonLd({ headline: "</script><script>alert(1)" }).includes("<"),
    false,
  );
  assert.deepEqual(
    articleStaticParams(articles, false).map((item) => item.slug),
    ["proverochnyj-material", "staryj-adres"],
  );
  assert.equal(
    resolveArticleSlug(articles, "staryj-adres", { includeDrafts: false })?.kind,
    "alias",
  );

  assert.throws(
    () =>
      parseArticleFile(
        published.replace("author: Редакция", 'author: ""'),
        "proverochnyj-material.md",
      ),
    /author/,
  );
});

test("admin config has no secret and does not enable login", () => {
  const yaml = fs.readFileSync(
    path.join(process.cwd(), "public/admin/config.yml"),
    "utf8",
  );
  assert.equal(/^\s*(?:client_secret|access_token|GITHUB_)\s*:/im.test(yaml), false);
  assert.match(yaml, /auth_scope: public_repo/);
  assert.match(yaml, /repo: kubinevtimur1-design\/spidee-tools/);
  assert.equal(/^\s*base_url:/m.test(yaml), false);

  const sandbox = vm.createContext({
    window: {
      __DECAP_GATE_TEST__: true,
    },
    URL,
    console,
  });
  (sandbox as { window: { window?: unknown } }).window.window = (
    sandbox as { window: unknown }
  ).window;
  vm.runInContext(
    fs.readFileSync(path.join(process.cwd(), "public/admin/gate.js"), "utf8"),
    sandbox,
  );
  const gateWindow = (
    sandbox as {
      window: {
        readDecapBaseUrl: (value: string) => string | null;
        bootDecapGate: (
          document: unknown,
          fetchImpl: (url: string) => Promise<{ ok: boolean; text: () => Promise<string> }>,
        ) => Promise<{ enabled: boolean }>;
      };
    }
  ).window;
  assert.equal(gateWindow.readDecapBaseUrl(yaml), null);
  assert.equal(
    gateWindow.readDecapBaseUrl("base_url: https://auth.example"),
    "https://auth.example",
  );
  assert.equal(
    gateWindow.readDecapBaseUrl("# base_url: https://auth.example\nbase_url: https://auth.example/callback"),
    null,
  );

  const scripts: string[] = [];
  const gate = {
    text: "",
    replaceChildren() {
      this.text = "";
    },
    appendChild(node: { text?: string }) {
      this.text += node.text || "";
    },
  };
  const document = {
    getElementById() {
      return gate;
    },
    createElement(tag: string) {
      const node = {
        tag,
        className: "",
        textContent: "",
        src: "",
        children: [] as unknown[],
        appendChild(child: { textContent?: string; src?: string }) {
          this.children.push(child);
          if (tag === "body") scripts.push(child.src || child.textContent || "");
        },
        get text() {
          return `${this.textContent}${this.children.map((child) => (child as { text?: string }).text || "").join("")}`;
        },
      };
      return node;
    },
    body: {
      appendChild(node: { src?: string; textContent?: string }) {
        scripts.push(node.src || node.textContent || "");
      },
    },
  };
  return gateWindow.bootDecapGate(document, async () => ({
    ok: true,
    text: async () => yaml,
  })).then((result: { enabled: boolean }) => {
    assert.equal(result.enabled, false);
    assert.equal(scripts.length, 0);
    assert.match(gate.text, /не подключён/);
    assert.equal(gate.text.includes("decap-cms"), false);
  });
});
