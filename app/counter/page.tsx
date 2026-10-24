import type { Metadata } from "next";
import Link from "next/link";
import CounterTool from "./counter-tool";
import { pageMetadata } from "../seo";

const CANONICAL = "https://www.spidytools.ru/counter/";
const PAGE_TITLE = "Подсчёт символов и превью Title/Description — Spidy Tools";
const PAGE_DESCRIPTION =
  "Считайте символы для Title и Description и сразу смотрите, как сниппет обрежется в Google и Яндексе. Без регистрации.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/counter/",
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
    "подсчет символов",
    "превью сниппета",
    "длина title",
    "длина meta description",
    "калькулятор символов онлайн",
    "лимит сниппета яндекс",
  ],
};

export default function CounterPage() {
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
            name: "Подсчёт символов и превью сниппета",
            item: CANONICAL,
          },
        ],
      },

      {
        "@type": "WebApplication",
        name: "Подсчёт символов и превью сниппета",
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
    <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <header className="mb-8 space-y-2">
        <nav
          aria-label="Хлебные крошки"
          className="flex items-center gap-2 text-xs text-gray-400"
        >
          <Link
            href="/"
            className="hover:text-black transition-colors"
          >
            Главная
          </Link>

          <span>/</span>

          <span className="text-gray-500">
            Инструменты
          </span>

          <span>/</span>

          <span className="text-gray-900 font-medium">
            Подсчёт символов
          </span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
          Подсчёт символов и превью сниппета
        </h1>

        <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
          Пиши title или description — сразу видно, влезет ли в Google и Яндекс.
        </p>
      </header>

      <CounterTool />
    </main>
  );
}