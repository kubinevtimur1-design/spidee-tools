import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SITE_URL } from "@/app/seo";
import {
  articleStaticParams,
  includeDraftRoutes,
  loadArticles,
  publicArticles,
  resolveArticleSlug,
} from "@/lib/blog/content";
import {
  articleJsonLd,
  serializeJsonLd,
  shouldEmitArticleJsonLd,
} from "@/lib/blog/jsonld";
import { articlePagePath } from "@/lib/blog/paths";

import { AliasNotice, ArticleDocument } from "../article-document";
import { ArticleCatalog, catalogMetadata } from "../catalog";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string[] }[] {
  return [
    { slug: [] },
    ...articleStaticParams(loadArticles(), includeDraftRoutes()).map((item) => ({
      slug: [item.slug],
    })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  if (slug.length === 0) {
    return catalogMetadata(publicArticles(loadArticles()).length);
  }
  if (slug.length !== 1) return { robots: { index: false, follow: false } };

  const resolved = resolveArticleSlug(loadArticles(), slug[0], {
    includeDrafts: includeDraftRoutes(),
  });
  if (!resolved) return { robots: { index: false, follow: false } };

  if (resolved.kind === "alias") {
    return {
      title: { absolute: "Материал переехал — Spidy Tools" },
      robots: { index: false, follow: false },
      alternates: {
        canonical: `${SITE_URL}${articlePagePath(resolved.article.slug)}`,
      },
    };
  }

  const article = resolved.article;
  const title = article.seoTitle || article.title;
  const canonical = `${SITE_URL}${articlePagePath(article.slug)}`;
  if (article.draft) {
    return {
      title: { absolute: `${title} — черновик` },
      description: article.description || undefined,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: { absolute: `${title} — Spidy Tools` },
    description: article.description,
    keywords: article.keywords,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "ru_RU",
      url: canonical,
      title: { absolute: title },
      description: article.description,
      ...(article.cover
        ? { images: [{ url: article.cover, alt: article.coverAlt }] }
        : {}),
    },
  };
}

export default async function BlogRoute({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  if (slug.length === 0) {
    return <ArticleCatalog articles={publicArticles(loadArticles())} />;
  }
  if (slug.length !== 1) notFound();

  const resolved = resolveArticleSlug(loadArticles(), slug[0], {
    includeDrafts: includeDraftRoutes(),
  });
  if (!resolved) notFound();
  if (resolved.kind === "alias") return <AliasNotice article={resolved.article} />;

  const article = resolved.article;
  const jsonLd = shouldEmitArticleJsonLd(article)
    ? serializeJsonLd(articleJsonLd(article, SITE_URL))
    : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}
      <ArticleDocument article={article} />
    </>
  );
}
