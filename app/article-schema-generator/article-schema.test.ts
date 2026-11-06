import assert from "node:assert/strict";
import test from "node:test";
import {
  ARTICLE_TYPES,
  COPY_FAIL,
  COPY_OK,
  HEADLINE_SOFT_LIMIT,
  IMAGE_HINT,
  NEWS_NOTE,
  VALIDATORS,
  buildArticleSchema,
  copyOutcome,
  emptyAuthor,
  emptyDraft,
  headlineWarning,
  type ArticleDraft,
  type ArticleType,
} from "./article-schema";

function draft(patch: Partial<ArticleDraft> = {}): ArticleDraft {
  return { ...emptyDraft(), authors: [emptyAuthor()], ...patch };
}

function parseScript(script: string): unknown {
  const prefix = `<script type="application/ld+json">\n`;
  const suffix = `\n</script>`;
  assert.equal(script.startsWith(prefix), true);
  assert.equal(script.endsWith(suffix), true);
  const body = script.slice(prefix.length, -suffix.length);
  assert.equal(body.includes("<"), false);
  assert.equal(body.includes(">"), false);
  assert.equal(body.includes("&"), false);
  assert.equal(body.toLowerCase().includes("</script"), false);
  return JSON.parse(body);
}

test("builds Article, BlogPosting and NewsArticle", () => {
  for (const type of ARTICLE_TYPES.map((item) => item.id)) {
    const result = buildArticleSchema(
      draft({
        type,
        headline: "Как собрать JSON-LD",
        authors: [
          {
            type: "Person",
            name: "Аня",
            url: "",
            jobTitle: "",
            sameAs: "",
          },
        ],
        datePublished: "2024-05-01",
        images: ["https://example.com/cover.jpg"],
        articleUrl: "https://example.com/post",
      }),
    );

    assert.equal(result.errors.length, 0);
    assert.equal(result.schema?.["@type"], type);
    assert.equal(result.schema?.["@context"], "https://schema.org");
    const parsed = parseScript(result.script ?? "") as { "@type": ArticleType };
    assert.equal(parsed["@type"], type);
  }
});

test("omits blank optional properties", () => {
  const result = buildArticleSchema(
    draft({
      headline: "  Только заголовок  ",
      description: "   ",
      inLanguage: "",
      articleSection: " ",
      keywords: " ",
      wordCount: " ",
      articleUrl: " ",
      images: [" ", "\n"],
      datePublished: " ",
      dateModified: "",
      publisherName: " ",
      publisherLogo: "",
      authors: [
        { type: "Person", name: " ", url: " ", jobTitle: " ", sameAs: " " },
      ],
      timezone: "+03:00",
    }),
  );

  assert.deepEqual(result.schema, {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Только заголовок",
  });
  assert.equal(JSON.stringify(result.schema).includes("dateModified"), false);
  assert.equal(JSON.stringify(result.schema).includes("+03:00"), false);
});

test("does not invent dateModified from datePublished", () => {
  const result = buildArticleSchema(
    draft({ headline: "Дата", datePublished: "2024-01-05" }),
  );

  assert.equal(result.schema?.datePublished, "2024-01-05");
  assert.equal("dateModified" in (result.schema ?? {}), false);
});

test("keeps a date-only value even when a timezone is selected", () => {
  const result = buildArticleSchema(
    draft({
      headline: "Дата",
      datePublished: "2024-01-05",
      timezone: "+10:00",
    }),
  );

  assert.equal(result.schema?.datePublished, "2024-01-05");
});

test("writes an explicit offset and never assumes Moscow", () => {
  const missing = buildArticleSchema(
    draft({
      headline: "Время",
      datePublished: "2024-01-05",
      timePublished: "08:00",
      timezone: "",
    }),
  );
  assert.equal(missing.schema, null);
  assert.match(missing.errors.join(" "), /часовой пояс/i);
  assert.doesNotMatch(missing.errors.join(" "), /\+03:00/);

  const utc = buildArticleSchema(
    draft({
      headline: "Время",
      datePublished: "2024-01-05",
      timePublished: "08:00",
      timezone: "+00:00",
    }),
  );
  assert.equal(utc.schema?.datePublished, "2024-01-05T08:00:00+00:00");

  const half = buildArticleSchema(
    draft({
      headline: "Время",
      datePublished: "2024-01-05",
      timePublished: "08:05:09",
      timezone: "+05:45",
    }),
  );
  assert.equal(half.schema?.datePublished, "2024-01-05T08:05:09+05:45");
});

test("rejects a modified instant before publication and allows the same moment", () => {
  const earlier = buildArticleSchema(
    draft({
      headline: "Даты",
      datePublished: "2024-05-02",
      dateModified: "2024-05-01",
    }),
  );
  assert.equal(earlier.schema, null);
  assert.match(earlier.errors.join(" "), /раньше даты публикации/);

  const sameDay = buildArticleSchema(
    draft({
      headline: "Даты",
      datePublished: "2024-05-01",
      dateModified: "2024-05-01",
    }),
  );
  assert.equal(sameDay.schema?.datePublished, "2024-05-01");
  assert.equal(sameDay.schema?.dateModified, "2024-05-01");

  const earlierTime = buildArticleSchema(
    draft({
      headline: "Даты",
      datePublished: "2024-05-01",
      timePublished: "10:00",
      dateModified: "2024-05-01",
      timeModified: "09:00",
      timezone: "+03:00",
    }),
  );
  assert.equal(earlierTime.schema, null);

  const sameTime = buildArticleSchema(
    draft({
      headline: "Даты",
      datePublished: "2024-05-01",
      timePublished: "10:00",
      dateModified: "2024-05-01",
      timeModified: "10:00",
      timezone: "-05:00",
    }),
  );
  assert.equal(sameTime.schema?.dateModified, "2024-05-01T10:00:00-05:00");

  const mixed = buildArticleSchema(
    draft({
      headline: "Даты",
      datePublished: "2024-05-01",
      timePublished: "23:00",
      dateModified: "2024-05-01",
      timezone: "+03:00",
    }),
  );
  assert.equal(mixed.errors.length, 0);
  assert.equal(mixed.schema?.dateModified, "2024-05-01");
});

test("rejects impossible dates, time without a date, and a bad offset", () => {
  assert.match(
    buildArticleSchema(draft({ headline: "Д", datePublished: "2023-02-29" })).errors.join(" "),
    /такой даты нет/,
  );
  assert.equal(
    buildArticleSchema(draft({ headline: "Д", datePublished: "2024-02-29" })).errors.length,
    0,
  );
  assert.match(
    buildArticleSchema(draft({ headline: "Д", datePublished: "2024-02-31" })).errors.join(" "),
    /такой даты нет/,
  );
  assert.match(
    buildArticleSchema(
      draft({ headline: "Д", timePublished: "12:00", timezone: "+03:00" }),
    ).errors.join(" "),
    /укажи дату/,
  );
  assert.match(
    buildArticleSchema(
      draft({
        headline: "Д",
        datePublished: "2024-01-01",
        timePublished: "25:00",
        timezone: "+03:00",
      }),
    ).errors.join(" "),
    /ЧЧ:ММ/,
  );
  assert.equal(
    buildArticleSchema(
      draft({
        headline: "Д",
        datePublished: "2024-01-01",
        timePublished: "12:00",
        timezone: "+3",
      }),
    ).schema,
    null,
  );
});

test("validates urls without requiring https and blocks bad markup", () => {
  const http = buildArticleSchema(
    draft({
      headline: "Ссылка",
      articleUrl: "http://example.com/a",
      images: ["http://cdn.example.com/1.jpg"],
    }),
  );
  assert.equal(http.schema?.url, "http://example.com/a");
  assert.deepEqual(http.schema?.image, ["http://cdn.example.com/1.jpg"]);

  for (const articleUrl of [
    "javascript:alert(1)",
    "data:text/html,hi",
    "ftp://example.com/a",
    "/relative",
    "example.com/a",
    "https://",
  ]) {
    const result = buildArticleSchema(draft({ headline: "Плохой URL", articleUrl }));
    assert.equal(result.schema, null, articleUrl);
    assert.match(result.errors.join(" "), /http или https/);
  }
});

test("drops nothing silently when a filled value is invalid", () => {
  const result = buildArticleSchema(
    draft({
      headline: "Нормальный заголовок",
      articleUrl: "not a url",
    }),
  );
  assert.equal(result.schema, null);
  assert.equal(result.script, null);
});

test("supports several authors and image urls, publisher logo stays optional", () => {
  const result = buildArticleSchema(
    draft({
      type: "NewsArticle",
      headline: "Новость",
      authors: [
        {
          type: "Person",
          name: "Ира",
          url: "https://example.com/ira",
          jobTitle: "Редактор",
          sameAs: "https://example.com/ira-profile",
        },
        {
          type: "Organization",
          name: "Редакция",
          url: "https://example.com",
          jobTitle: "",
          sameAs: "",
        },
      ],
      images: [
        "https://example.com/1x1.jpg",
        "https://example.com/4x3.jpg",
        "https://example.com/16x9.jpg",
      ],
      publisherName: "Журнал",
      articleUrl: "https://example.com/news",
    }),
  );

  assert.equal(result.errors.length, 0);
  assert.equal(result.schema?.author?.length, 2);
  assert.equal(result.schema?.author?.[0]?.jobTitle, "Редактор");
  assert.equal(result.schema?.author?.[0]?.sameAs, "https://example.com/ira-profile");
  assert.equal(result.schema?.author?.[1]?.["@type"], "Organization");
  assert.equal("jobTitle" in (result.schema?.author?.[1] ?? {}), false);
  assert.deepEqual(result.schema?.image, [
    "https://example.com/1x1.jpg",
    "https://example.com/4x3.jpg",
    "https://example.com/16x9.jpg",
  ]);
  assert.deepEqual(result.schema?.mainEntityOfPage, {
    "@type": "WebPage",
    "@id": "https://example.com/news",
  });
  assert.equal(result.schema?.publisher?.name, "Журнал");
  assert.equal(result.schema?.publisher?.logo, undefined);
  assert.equal(JSON.stringify(result.schema).includes("Discover"), false);
});

test("blocks a nameless author, a job title on an organization, and a logo without a publisher", () => {
  const nameless = buildArticleSchema(
    draft({
      headline: "Автор",
      authors: [
        {
          type: "Person",
          name: "",
          url: "https://example.com/me",
          jobTitle: "",
          sameAs: "",
        },
      ],
    }),
  );
  assert.equal(nameless.schema, null);
  assert.match(nameless.errors.join(" "), /впиши имя/);

  const orgTitle = buildArticleSchema(
    draft({
      headline: "Автор",
      authors: [
        {
          type: "Organization",
          name: "Бюро",
          url: "",
          jobTitle: "Главред",
          sameAs: "",
        },
      ],
    }),
  );
  assert.equal(orgTitle.schema, null);
  assert.match(orgTitle.errors.join(" "), /должность только у Person/);

  const logo = buildArticleSchema(
    draft({
      headline: "Лого",
      publisherLogo: "https://example.com/logo.png",
    }),
  );
  assert.equal(logo.schema, null);
  assert.match(logo.errors.join(" "), /название издателя/);

  const withLogo = buildArticleSchema(
    draft({
      headline: "Лого",
      publisherName: "Журнал",
      publisherLogo: "https://example.com/logo.png",
    }),
  );
  assert.deepEqual(withLogo.schema?.publisher?.logo, {
    "@type": "ImageObject",
    url: "https://example.com/logo.png",
  });
});

test("emits description, language, section, keywords and word count only when set", () => {
  const result = buildArticleSchema(
    draft({
      headline: "Поля",
      description: " Коротко ",
      inLanguage: "ru-RU",
      articleSection: "Маркетинг",
      keywords: "json-ld, schema",
      wordCount: "007",
    }),
  );

  assert.equal(result.schema?.description, "Коротко");
  assert.equal(result.schema?.inLanguage, "ru-RU");
  assert.equal(result.schema?.articleSection, "Маркетинг");
  assert.equal(result.schema?.keywords, "json-ld, schema");
  assert.equal(result.schema?.wordCount, 7);

  const bad = buildArticleSchema(
    draft({ headline: "Поля", inLanguage: "русский", wordCount: "12.5" }),
  );
  assert.equal(bad.schema, null);
  assert.match(bad.errors.join(" "), /Язык/);
  assert.match(bad.errors.join(" "), /Число слов/);
});

test("escapes script breakout, quotes, ampersands and unicode", () => {
  const headline = '</ScRiPt><script>alert("x")</script> & Ёжик «тест» \u2028';
  const result = buildArticleSchema(
    draft({
      headline,
      articleUrl: "https://example.com/a?x=1&y=2",
    }),
  );

  const script = result.script ?? "";
  const json = result.json ?? "";
  assert.equal(json.includes("<"), false);
  assert.match(json, /\\u003c/);
  assert.match(json, /\\u0026/);
  assert.doesNotMatch(json, /\u2028/);
  assert.equal(script.toLowerCase().match(/<\/script/g)?.length, 1);

  const parsed = parseScript(script) as {
    headline: string;
    url: string;
  };
  assert.equal(parsed.headline, headline.trim());
  assert.equal(parsed.url, "https://example.com/a?x=1&y=2");
  assert.equal(parsed.headline.includes('"'), true);
  assert.equal(parsed.headline.includes("Ёжик"), true);
});

test("warns past 110 characters without blocking", () => {
  const short = "а".repeat(HEADLINE_SOFT_LIMIT);
  const long = "а".repeat(HEADLINE_SOFT_LIMIT + 1);

  assert.equal(headlineWarning(short), null);
  assert.match(headlineWarning(long) ?? "", /не ошибка/);

  const result = buildArticleSchema(draft({ headline: long }));
  assert.equal(result.errors.length, 0);
  assert.equal(result.schema?.headline, long);
  assert.match(result.warning ?? "", /не ошибка/);
});

test("copy feedback tracks only a successful write", () => {
  assert.deepEqual(copyOutcome(true), {
    copied: true,
    copyError: false,
    trackCopy: true,
  });
  assert.equal(COPY_OK.length > 0, true);
  assert.deepEqual(copyOutcome(false), {
    copied: false,
    copyError: true,
    trackCopy: false,
  });
  assert.match(COPY_FAIL, /Не вышло скопировать/);
});

test("notes and validator links do not promise rich results or news inclusion", () => {
  assert.equal(ARTICLE_TYPES[0]?.description, "Общая статья");
  assert.equal(ARTICLE_TYPES[1]?.description, "Запись в блоге");
  assert.equal(ARTICLE_TYPES[2]?.description, "Новостной материал");
  assert.match(NEWS_NOTE, /не включает/);
  assert.doesNotMatch(NEWS_NOTE, /гарант/i);
  assert.match(IMAGE_HINT, /1200/);
  assert.match(IMAGE_HINT, /не проверяем/);
  assert.deepEqual(
    VALIDATORS.map((item) => item.href),
    [
      "https://webmaster.yandex.ru/tools/microtest/",
      "https://search.google.com/test/rich-results",
      "https://validator.schema.org/",
    ],
  );
});

test("an empty form produces no markup", () => {
  const result = buildArticleSchema(emptyDraft());
  assert.deepEqual(result.errors, []);
  assert.equal(result.schema, null);
  assert.equal(result.script, null);
  assert.equal(result.json, null);
});
