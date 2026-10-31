import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import { FAQ } from "./erid";
import EridTool from "./erid-tool";

const CANONICAL = "https://spidytools.ru/erid/";
const PAGE_TITLE =
  "Маркировка рекламы erid: пометка и проверка | Spidy Tools";
const PAGE_DESCRIPTION =
  "Собери пометку «Реклама» с ИНН и erid, вставь токен в ссылку и проверь пост перед публикацией. Бесплатно, в браузере, без регистрации.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/erid/",
  ogTitle: PAGE_TITLE,
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
          name: "Маркировка erid",
          item: CANONICAL,
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Маркировка рекламы с erid",
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
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ],
};

export default function EridPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <EridTool />
    </>
  );
}
