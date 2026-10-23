import type { Metadata } from "next";
import Link from "next/link";
import CounterTool from "./counter-tool";

export const metadata: Metadata = {
  title: "Подсчет символов онлайн — лимиты Title и Description | Spidee",
  description:
    "Бесплатный инструмент для SEO-специалистов: точный подсчет символов с пробелами и без, слов, строк и контроль лимита сниппетов Google и Яндекс.",
  keywords: [
    "подсчет символов",
    "длина title",
    "длина meta description",
    "калькулятор символов онлайн",
    "лимит сниппета яндекс",
  ],
  alternates: {
    canonical: "/counter",
  },
};

export default function CounterPage() {
  // Микроразметка BreadcrumbList + WebApplication
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Главная",
            "item": "https://spidee.ru",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Инструменты",
            "item": "https://spidee.ru/#tools",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Подсчет символов",
            "item": "https://spidee.ru/counter",
          },
        ],
      },
      {
        "@type": "WebApplication",
        "name": "Подсчет символов онлайн Spidee",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "RUB",
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

      {/* SEO-хедер страницы */}
      <header className="mb-8 space-y-2">
        <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">Главная</Link>
          <span>/</span>
          <span className="text-gray-500">Инструменты</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Подсчет символов</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
          Подсчет символов онлайн
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
          Проверяйте длину текста под лимиты сниппетов поисковых систем Google и Яндекс в реальном времени.
        </p>
      </header>

      {/* Инструмент с формой */}
      <CounterTool />
    </main>
  );
}