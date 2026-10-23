import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Navbar from "./navbar";
import "./globals.css";
import GameBanner from "./game-banner";

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
        {/* Адаптивная навигация */}
        <Navbar />

        {/* Тело страницы */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Адаптивный подвал */}
        <footer className="border-t border-gray-200/70 bg-white/50 backdrop-blur-sm pt-8 pb-14 sm:py-10 mt-auto text-xs text-gray-500">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🕷️</span>
                  <span className="font-semibold text-gray-900 text-sm tracking-tight">Spidee</span>
                </div>
                <p className="text-xs text-gray-400">
                  Набор инструментов для практической работы
                </p>
              </div>

              <nav className="flex flex-wrap gap-x-5 gap-y-2 text-gray-600">
                <Link href="/counter" className="hover:text-black transition-colors">
                  Счетчик символов
                </Link>
                <Link href="/utm" className="hover:text-black transition-colors">
                  Генератор UTM
                </Link>
                <Link href="/meta" className="hover:text-black transition-colors">
                  Выгрузка meta
                </Link>
              </nav>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-gray-400">
              <p className="text-[11px] sm:text-xs text-gray-400">
                © 2026 Spidee. Все права защищены.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs">
                <Link href="#" className="hover:text-gray-600 hover:underline transition-colors">
                  Политика конфиденциальности
                </Link>
                <Link href="#" className="hover:text-gray-600 hover:underline transition-colors">
                  Пользовательское соглашение
                </Link>
              </div>
            </div>
          </div>
        </footer>
        {/* Плавающая плашка с игрой */}
     <GameBanner />
      </body>
    </html>
  );
}