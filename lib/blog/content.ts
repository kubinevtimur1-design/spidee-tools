import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import type { MetadataRoute } from "next";

import { SITE_URL } from "@/app/seo";

import { sanitizeHref, sanitizeMediaSrc } from "./href";
import { articlePagePath } from "./paths";
import { blogToolById } from "./tools";
import type {
  Article,
  ArticleBlock,
  ComparisonBlock,
  CtaBlock,
  MarkdownBlock,
  NoteBlock,
  NoteTone,
  ResolvedArticle,
  ToolBlock,
} from "./types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/;

export function blogDirectory(): string {
  return path.join(process.cwd(), "content", "blog");
}

export function includeDraftRoutes(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.BLOG_DRAFT_PREVIEW === "1"
  );
}

function fail(fileName: string, message: string): never {
  throw new Error(`${fileName}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown, fileName: string, field: string): string {
  if (value == null) return "";
  if (typeof value !== "string") fail(fileName, `${field} must be a string`);
  return value.trim();
}

function requiredString(value: unknown, fileName: string, field: string): string {
  const text = optionalString(value, fileName, field);
  if (!text) fail(fileName, `${field} is required`);
  return text;
}

function plainCell(value: unknown, fileName: string, label: string): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  fail(fileName, `${label} must be plain text`);
}

function normalizeDate(value: unknown, fileName: string, field: string): string {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) fail(fileName, `${field} is not a date`);
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string" || !DATE_PATTERN.test(value.trim())) {
    fail(fileName, `${field} must be YYYY-MM-DD`);
  }
  return value.trim().slice(0, 10);
}

function stringList(value: unknown, fileName: string, field: string): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) fail(fileName, `${field} must be a list`);
  return value.map((item, index) =>
    requiredString(item, fileName, `${field}[${index}]`),
  );
}

function parseMarkdown(value: Record<string, unknown>, fileName: string): MarkdownBlock {
  return {
    type: "markdown",
    text: optionalString(value.text, fileName, "markdown text"),
  };
}

function parseNote(value: Record<string, unknown>, fileName: string): NoteBlock {
  const tone = optionalString(value.tone, fileName, "note tone") || "info";
  if (tone !== "info" && tone !== "warning") {
    fail(fileName, "note tone must be info or warning");
  }
  return {
    type: "note",
    tone: tone as NoteTone,
    text: requiredString(value.text, fileName, "note text"),
  };
}

function parseCta(value: Record<string, unknown>, fileName: string): CtaBlock {
  const href = sanitizeHref(requiredString(value.href, fileName, "cta href"));
  if (!href) fail(fileName, "cta href is not an allowed http(s) or site path");
  return {
    type: "cta",
    lead: optionalString(value.lead, fileName, "cta lead"),
    label: requiredString(value.label, fileName, "cta label"),
    href,
  };
}

function parseTool(value: Record<string, unknown>, fileName: string): ToolBlock {
  const tool = requiredString(value.tool, fileName, "tool");
  if (!blogToolById(tool)) fail(fileName, `unknown tool "${tool}"`);
  return {
    type: "tool",
    tool,
    caption: optionalString(value.caption, fileName, "tool caption"),
  };
}

function parseComparison(
  value: Record<string, unknown>,
  fileName: string,
): ComparisonBlock {
  const columns = stringList(value.columns, fileName, "columns");
  if (columns.length < 2) fail(fileName, "comparison needs at least two columns");
  if (!Array.isArray(value.rows) || value.rows.length === 0) {
    fail(fileName, "comparison needs at least one row");
  }
  const rows = value.rows.map((row, index) => {
    const cells = Array.isArray(row)
      ? row
      : isRecord(row) && Array.isArray(row.cells)
        ? row.cells
        : fail(fileName, `comparison row ${index + 1} must be a list of cells`);
    const text = cells.map((cell, cellIndex) =>
      plainCell(cell, fileName, `comparison row ${index + 1} cell ${cellIndex + 1}`),
    );
    if (text.length !== columns.length) {
      fail(
        fileName,
        `comparison row ${index + 1} has ${text.length} cells, expected ${columns.length}`,
      );
    }
    return text;
  });
  return {
    type: "comparison",
    caption: optionalString(value.caption, fileName, "comparison caption"),
    columns,
    rows,
  };
}

function parseBlock(value: unknown, fileName: string, index: number): ArticleBlock {
  if (!isRecord(value)) fail(fileName, `block ${index + 1} must be an object`);
  const type = requiredString(value.type, fileName, `block ${index + 1} type`);
  if (type === "markdown") return parseMarkdown(value, fileName);
  if (type === "note") return parseNote(value, fileName);
  if (type === "cta") return parseCta(value, fileName);
  if (type === "tool") return parseTool(value, fileName);
  if (type === "comparison") return parseComparison(value, fileName);
  fail(fileName, `block ${index + 1} has unknown type "${type}"`);
}

export function parseArticleFile(source: string, fileName: string): Article {
  const parsed = matter(source);
  const data = parsed.data;
  if (!isRecord(data)) fail(fileName, "front matter must be a map");

  const slug = requiredString(data.slug, fileName, "slug");
  if (!SLUG_PATTERN.test(slug)) {
    fail(fileName, "slug may contain only lowercase latin letters, digits and hyphens");
  }
  const expectedFile = `${slug}.md`;
  if (fileName !== expectedFile) {
    fail(fileName, `file name must be ${expectedFile}`);
  }

  const draftValue = data.draft;
  const draft =
    draftValue == null
      ? true
      : typeof draftValue === "boolean"
        ? draftValue
        : fail(fileName, "draft must be true or false");

  const cover = optionalString(data.cover, fileName, "cover");
  const coverAlt = optionalString(data.cover_alt, fileName, "cover_alt");
  if (cover) {
    const media = sanitizeMediaSrc(cover);
    if (!media) fail(fileName, "cover must be a file under /blog/media/");
    if (!coverAlt) fail(fileName, "cover_alt is required when cover is set");
  } else if (coverAlt) {
    fail(fileName, "cover_alt is set without a cover");
  }

  const aliases = stringList(data.aliases, fileName, "aliases");
  for (const alias of aliases) {
    if (!SLUG_PATTERN.test(alias)) fail(fileName, `alias "${alias}" is not a slug`);
    if (alias === slug) fail(fileName, "alias must differ from slug");
  }

  const blocksValue = data.blocks;
  if (blocksValue != null && !Array.isArray(blocksValue)) {
    fail(fileName, "blocks must be a list");
  }
  const blocks = (blocksValue ?? []).map((block, index) =>
    parseBlock(block, fileName, index),
  );

  const article: Article = {
    fileName,
    slug,
    title: requiredString(data.title, fileName, "title"),
    seoTitle: optionalString(data.seo_title, fileName, "seo_title"),
    description: optionalString(data.description, fileName, "description"),
    section: optionalString(data.section, fileName, "section"),
    draft,
    author: optionalString(data.author, fileName, "author"),
    date: normalizeDate(data.date, fileName, "date"),
    updated: normalizeDate(data.updated, fileName, "updated"),
    cover: cover ? sanitizeMediaSrc(cover)! : "",
    coverAlt,
    keywords: stringList(data.keywords, fileName, "keywords"),
    aliases,
    blocks,
  };

  if (!article.draft) {
    const missing = [
      !article.description ? "description" : "",
      !article.author ? "author" : "",
      !article.date ? "date" : "",
    ].filter(Boolean);
    if (missing.length > 0) {
      fail(
        fileName,
        `draft is false but ${missing.join(", ")} is empty, so the article cannot be published`,
      );
    }
  }

  return article;
}

export function loadArticles(directory = blogDirectory()): Article[] {
  if (!fs.existsSync(directory)) return [];
  const fileNames = fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".md"))
    .sort();
  const articles = fileNames.map((fileName) =>
    parseArticleFile(fs.readFileSync(path.join(directory, fileName), "utf8"), fileName),
  );

  const seen = new Set<string>();
  for (const article of articles) {
    const names = [article.slug, ...article.aliases];
    for (const name of names) {
      if (seen.has(name)) fail(article.fileName, `slug or alias "${name}" is duplicated`);
      seen.add(name);
    }
  }
  return articles;
}

export function publicArticles(articles: Article[]): Article[] {
  return articles.filter((article) => !article.draft);
}

export function resolveArticleSlug(
  articles: Article[],
  slug: string,
  options: { includeDrafts: boolean },
): ResolvedArticle | null {
  const direct = articles.find((article) => article.slug === slug);
  if (direct) {
    if (direct.draft && !options.includeDrafts) return null;
    return { kind: "article", article: direct };
  }
  const aliased = articles.find(
    (article) => !article.draft && article.aliases.includes(slug),
  );
  if (!aliased) return null;
  return { kind: "alias", article: aliased };
}

export function articleStaticParams(
  articles: Article[],
  includeDrafts: boolean,
): { slug: string }[] {
  const params: { slug: string }[] = [];
  for (const article of articles) {
    if (article.draft) {
      if (includeDrafts) params.push({ slug: article.slug });
      continue;
    }
    params.push({ slug: article.slug });
    for (const alias of article.aliases) params.push({ slug: alias });
  }
  return params;
}

export function blogSitemapEntries(articles: Article[]): MetadataRoute.Sitemap {
  const published = publicArticles(articles);
  if (published.length === 0) return [];

  const dates = published.map((article) => article.updated || article.date);
  const catalogDate = dates.reduce((latest, value) =>
    value > latest ? value : latest,
  );

  return [
    {
      url: `${SITE_URL}/blog/`,
      lastModified: catalogDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...published.map((article) => ({
      url: `${SITE_URL}${articlePagePath(article.slug)}`,
      lastModified: article.updated || article.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
