import type { Article } from "./types";

export function shouldEmitArticleJsonLd(article: Article): boolean {
  return (
    !article.draft &&
    article.title.trim() !== "" &&
    article.description.trim() !== "" &&
    article.author.trim() !== "" &&
    article.date.trim() !== ""
  );
}

export function articleJsonLd(
  article: Article,
  siteUrl: string,
): Record<string, unknown> {
  const pageUrl = `${siteUrl}/blog/${article.slug}/`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle || article.title,
    description: article.description,
    mainEntityOfPage: pageUrl,
    inLanguage: "ru-RU",
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  if (article.date) data.datePublished = article.date;
  if (article.updated || article.date) {
    data.dateModified = article.updated || article.date;
  }
  if (article.author) {
    data.author = { "@type": "Person", name: article.author };
  }
  if (article.cover) {
    data.image = `${siteUrl}${article.cover}`;
  }
  if (article.keywords.length > 0) {
    data.keywords = article.keywords.join(", ");
  }
  return data;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
