import type { Metadata } from "next";
import Link from "next/link";
import SlugTool from "./slug-tool";
import { pageMetadata } from "../seo";

const CANONICAL = "https://www.spidytools.ru/slug/";
const PAGE_TITLE = "Транслит в ЧПУ онлайн — генератор slug — Spidy Tools";
const PAGE_DESCRIPTION =
  "Превратите кириллический заголовок в чистый URL: транслит, дефисы, без лишних символов. Бесплатно, без регистрации.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/slug/",
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
  keywords: [
    "транслит в чпу",
    "генератор slug",
    "чпу из заголовка",
    "транслитерация url",
  ],
};

export default function SlugPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Главная",
            item: "https://spidytools.ru",
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
            name: "Транслит и ЧПУ",
            item: CANONICAL,
          },
        ],
      },
      {
        "@type": "WebApplication",
        name: "Транслит и ЧПУ из заголовка",
        description: PAGE_DESCRIPTION,
        url: CANONICAL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "RUB",
        },
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <header className="mb-8 space-y-2">
        <nav
          aria-label="Хлебные крошки"
          className="flex items-center gap-2 text-xs text-gray-400"
        >
          <Link href="/" className="transition-colors hover:text-black">
            Главная
          </Link>
          <span>/</span>
          <span className="text-gray-500">Инструменты</span>
          <span>/</span>
          <span className="font-medium text-gray-900">Транслит и ЧПУ</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-4xl">
          Транслит и ЧПУ из заголовка
        </h1>

        <p className="max-w-2xl text-sm text-gray-500 sm:text-base">
          Преврати заголовок в чистый URL — транслит, дефисы и ничего лишнего.
        </p>
      </header>

      <SlugTool />
    </main>
  );
}
