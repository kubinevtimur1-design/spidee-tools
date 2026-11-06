export type NoteTone = "info" | "warning";

export type MarkdownBlock = {
  type: "markdown";
  text: string;
};

export type NoteBlock = {
  type: "note";
  tone: NoteTone;
  text: string;
};

export type CtaBlock = {
  type: "cta";
  lead: string;
  label: string;
  href: string;
};

export type ToolBlock = {
  type: "tool";
  tool: string;
  caption: string;
};

export type ComparisonBlock = {
  type: "comparison";
  caption: string;
  columns: string[];
  rows: string[][];
};

export type ArticleBlock =
  | MarkdownBlock
  | NoteBlock
  | CtaBlock
  | ToolBlock
  | ComparisonBlock;

export type Article = {
  fileName: string;
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  section: string;
  draft: boolean;
  author: string;
  date: string;
  updated: string;
  cover: string;
  coverAlt: string;
  keywords: string[];
  aliases: string[];
  blocks: ArticleBlock[];
};

export type ResolvedArticle =
  | { kind: "article"; article: Article }
  | { kind: "alias"; article: Article };
