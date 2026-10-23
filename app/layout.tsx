import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spidee.ru"),
  // Фавиконка в виде эмодзи паучка
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕷️</text></svg>",
  },
  title: {
    default: "🕷️ Spydee — полезные инструменты для SEO-маркетолога",
    template: "%s | 🕷️ Spydee",
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
    siteName: "🕷️ Spydee",
    title: "🕷️ Spydee — полезные инструменты для SEO-маркетолога",
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
        name: "🕷️ Spydee",
        url: "https://spidee.ru",
      },
      {
        "@type": "WebSite",
        "@id": "https://spidee.ru/#website",
        url: "https://spidee.ru",
        name: "🕷️ Spydee SEO Toolbox",
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
      <body className={`${inter.className} min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col selection:bg-blue-500 selection:text-white`}>
        {/* Хедер сайта */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight text-black flex items-center gap-2">
              <span className="text-base leading-none">🕷️</span>
              Spydee
            </Link>

            <nav className="flex items-center space-x-8 text-sm font-normal text-gray-600">
              <div className="relative group py-4">
                <button className="flex items-center gap-1 hover:text-black transition-colors focus:outline-none">
                  <span>Инструменты</span>
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                  <div className="w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/80 p-2 flex flex-col gap-1">
                    <Link href="/counter" className="px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col">
                      <span className="font-medium text-gray-900">Подсчет символов</span>
                      <span className="text-xs text-gray-400">Лимиты под Title и Description</span>
                    </Link>
                    <Link href="/utm" className="px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col">
                      <span className="font-medium text-gray-900">Генератор UTM</span>
                      <span className="text-xs text-gray-400">Разметка ссылок без ошибок</span>
                    </Link>
                    <Link href="/meta" className="px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col">
                      <span className="font-medium text-gray-900">Выгрузка meta</span>
                      <span className="text-xs text-gray-400">Парсинг тегов по списку URL</span>
                    </Link>
                  </div>
                </div>
              </div>

              <Link href="/pricing" className="hover:text-black transition-colors">Тарифы</Link>
              <Link href="#" className="hover:text-black transition-colors">Контакты</Link>
              <Link href="#" className="hover:text-black transition-colors">Блог</Link>
            </nav>

            <div>
              <Link href="#" className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-100 hover:text-black transition-all">
                Личный кабинет
              </Link>
            </div>
          </div>
        </header>

        {/* Тело страниц */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Подвал */}
        <footer className="border-t border-gray-200/70 bg-white/50 backdrop-blur-sm py-10 mt-auto text-xs text-gray-500">
          <div className="max-w-5xl mx-auto px-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">🕷️</span>
                <span className="font-semibold text-gray-900 text-sm">Spydee</span>
                <span className="text-gray-400">— набор инструментов для удобной работы</span>
              </div>
              <div className="flex flex-wrap gap-6 text-gray-600">
                <Link href="/counter" className="hover:text-black transition-colors">Счетчик символов</Link>
                <Link href="/utm" className="hover:text-black transition-colors">Генератор UTM</Link>
                <Link href="/meta" className="hover:text-black transition-colors">Выгрузка meta</Link>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-gray-400">
            <p>© 2026 Spydee. Все права защищены.</p>              <div className="flex gap-4">
                <Link href="#" className="hover:underline">Политика конфиденциальности</Link>
                <Link href="#" className="hover:underline">Пользовательское соглашение</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}