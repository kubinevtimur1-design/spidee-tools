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
  metadataBase: new URL("https://spaidy.ru"),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕷️</text></svg>",
  },
  title: {
    default: "🕷️ Spaidy — полезные инструменты для SEO-маркетолога",
    template: "%s | 🕷️ Spaidy",
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
  authors: [{ name: "Spaidy Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "🕷️ Spaidy",
    title: "🕷️ Spaidy — полезные инструменты для SEO-маркетолога",
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
        "@id": "https://spaidy.ru/#organization",
        name: "🕷️ Spaidy",
        url: "https://spaidy.ru",
      },
      {
        "@type": "WebSite",
        "@id": "https://spaidy.ru/#website",
        url: "https://spaidy.ru",
          name: "🕷️ Spaidy SEO Toolbox",
        publisher: {
          "@id": "https://spaidy.ru/#organization",
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