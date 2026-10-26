import type { Metadata } from "next";
import Link from "next/link";
import CounterTool from "./counter-tool";
import { pageMetadata } from "../seo";

const CANONICAL = "https://www.spidytools.ru/counter/";
const PAGE_TITLE = "Подсчёт символов онлайн — Spidy Tools";
const PAGE_DESCRIPTION =
  "Бесплатный подсчёт символов онлайн с лимитами для Google, Яндекса, VK Рекламы и Telegram Ads.";

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
    "подсчёт символов онлайн",
    "счетчик символов",
    "количество символов в тексте",
    "длина title",
    "длина description",
    "лимит символов",
    "лимит telegram ads",
    "лимит vk реклама",
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
            name: "Подсчёт символов онлайн",
            item: CANONICAL,
          },
        ],
      },
      {
        "@type": "WebApplication",
        name: "Подсчёт символов онлайн",
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
    <main className="min-h-screen bg-[#F7F5F2] text-[#3A3A3A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd),
        }}
      />

      <section>
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          <nav
            aria-label="Хлебные крошки"
            className="mb-8 flex items-center gap-2 text-xs font-medium text-[#999999]"
          >
            <Link
              href="/"
              className="transition-colors hover:text-[#0B0B0B]"
            >
              Главная
            </Link>

            <span>/</span>
            <span>Инструменты</span>
            <span>/</span>

            <span className="text-[#555555]">
              Подсчёт символов
            </span>
          </nav>

          <h1 className="max-w-5xl text-[44px] font-bold leading-[0.9] tracking-[-0.055em] text-[#3A3A3A] sm:text-6xl lg:text-[72px]">
            Подсчёт символов
            <br />
            онлайн
            <span className="text-[#FF3830]">.</span>
          </h1>

          <h2 className="mt-7 max-w-2xl text-base font-normal leading-6 text-[#777777] sm:text-lg">
            Проверяй длину текста под нужную площадку или задай собственный
            лимит символов.
          </h2>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <CounterTool />
      </section>
    </main>
  );
}