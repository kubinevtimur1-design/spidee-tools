import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import ArticleTool from "./article-tool";

const CANONICAL = "https://spidytools.ru/article-schema-generator/";
const PAGE_TITLE =
  "Генератор микроразметки статьи (Article JSON-LD) онлайн | Spidy Tools";
const PAGE_DESCRIPTION =
  "Собери JSON-LD для статьи, записи блога или новости: заголовок, автор, даты, картинка и URL. Код собирается в браузере. Бесплатно, без регистрации.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/article-schema-generator/",
  ogTitle: "Генератор разметки статьи (Article JSON-LD) онлайн | Spidy Tools",
  ogDescription: PAGE_DESCRIPTION,
});

export const metadata: Metadata = {
  ...sharedMetadata,
  alternates: {
    canonical: CANONICAL,
  },
  openGraph: {
    ...sharedMetadata.openGraph,
    url: CANONICAL,
  },
  keywords: [
    "article schema",
    "json-ld генератор",
    "разметка статьи",
    "NewsArticle",
    "BlogPosting",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: "https://spidytools.ru/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Инструменты",
          item: "https://spidytools.ru/#tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Article Schema",
          item: CANONICAL,
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Генератор Article Schema",
      description: PAGE_DESCRIPTION,
      url: CANONICAL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "ru",
      isAccessibleForFree: true,
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
      },
    },
  ],
};

export default function ArticleSchemaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ArticleTool />
    </>
  );
}
