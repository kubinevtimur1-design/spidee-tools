import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./navbar";
import Footer from "./footer";
import GameBanner from "./game-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spidee.ru"),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕷️</text></svg>",
  },
  title: {
    default: "🕷️ Spidee — полезные инструменты для SEO-маркетолога",
    template: "%s | 🕷️ Spidee",
  },
  description:
    "Минималистичный набор онлайн-инструментов для специалистов по продвижению: подсчет символов, генератор UTM и парсер тегов без перегруженных дашбордов.",
  keywords: [
    "SEO инструменты",
    "подсчет символов онлайн",
    "генератор utm",
    "выгрузка мета тегов",
    "лимиты title description",
    "инструменты маркетолога",
  ],
  authors: [{ name: "Spidee Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "🕷️ Spidee",
    title: "🕷️ Spidee — полезные инструменты для SEO-маркетолога",
    description: "Быстрые инструменты для ежедневной SEO-рутины в один клик.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://spidee.ru/#organization",
        name: "🕷️ Spidee",
        url: "https://spidee.ru",
      },
      {
        "@type": "WebSite",
        "@id": "https://spidee.ru/#website",
        url: "https://spidee.ru",
        name: "🕷️ Spidee SEO Toolbox",
        publisher: {
          "@id": "https://spidee.ru/#organization",
        },
      },
    ],
  };

  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col selection:bg-blue-500 selection:text-white`}
      >
        {/* Адаптивная навигация с подсказками */}
        <Navbar />

        {/* Тело страницы */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Интерактивный подвал с подсказками */}
        <Footer />

        {/* Плавающая плашка с мини-игрой */}
        <GameBanner />
      </body>
    </html>
  );
}