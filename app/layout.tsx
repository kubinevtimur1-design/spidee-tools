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
  metadataBase: new URL("https://spidytools.ru"),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕷️</text></svg>",
  },
  title: {
    default: "🕷️ Spidy Tools — полезные инструменты для маркетолога",
    template: "%s | 🕷️ Spidy Tools",
  },
  description:
    "Минималистичный набор онлайн-инструментов для специалистов по продвижению: подсчет символов, генератор UTM и парсер тегов без перегруженных дашбордов.",
  keywords: [
    "SEO инструменты",
    "подсчет символов онлайн",
    "генератор UTM",
    "выгрузка мета тегов",
    "лимиты title description",
    "инструменты маркетолога",
  ],
  authors: [{ name: "Spidy Tools" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Spidy Tools",
    title: "🕷️ Spidy Tools — полезные инструменты для маркетолога",
    description:
      "Быстрые инструменты для ежедневной рутины маркетолога в один клик.",
    url: "https://spidytools.ru",
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
        "@id": "https://spidytools.ru/#organization",
        name: "Spidy Tools",
        url: "https://spidytools.ru",
      },
      {
        "@type": "WebSite",
        "@id": "https://spidytools.ru/#website",
        url: "https://spidytools.ru",
        name: "Spidy Tools",
        publisher: {
          "@id": "https://spidytools.ru/#organization",
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
        <GameBanner />
        <Navbar />

        <div className="flex flex-1 flex-col">{children}</div>

        <Footer />
      </body>
    </html>
  );
}