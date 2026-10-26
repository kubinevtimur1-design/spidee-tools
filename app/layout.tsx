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
    icon: "/spidy-logo.PNG",
  },

  title: {
    default: "Инструменты для SEO и маркетолога онлайн — Spidy Tools",
    template: "%s | Spidy Tools",
  },

  description:
    "Бесплатные онлайн-инструменты для рутины SEO и маркетинга: подсчёт символов Title и Description, транслит в ЧПУ, генератор UTM-меток. Без регистрации.",

  keywords: [
    "SEO инструменты",
    "подсчёт символов онлайн",
    "генератор UTM",
    "транслит в ЧПУ",
    "лимиты title description",
    "инструменты маркетолога",
  ],

  authors: [{ name: "Spidy Tools" }],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://spidytools.ru/",
  },

  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Spidy Tools",
    title: {
      absolute: "Spidy Tools — инструменты для SEO и маркетолога",
    },
    description:
      "Подсчёт символов, транслит в ЧПУ и генератор UTM в один клик. Бесплатно, без регистрации.",
    url: "https://spidytools.ru/",
    images: [
      {
        url: "/hero-glass.webp",
        width: 2048,
        height: 2048,
        alt: "Spidy Tools",
        type: "image/webp",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: {
      absolute: "Spidy Tools — инструменты для SEO и маркетолога",
    },
    description:
      "Подсчёт символов, транслит в ЧПУ и генератор UTM в один клик. Бесплатно, без регистрации.",
    images: ["/hero-glass.webp"],
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>

      <body
        className={`${inter.className} min-h-screen bg-[#F7F5F2] text-[#1d1d1f] selection:bg-blue-500 selection:text-white`}
      >
        <div className="flex min-h-screen flex-col">
          <GameBanner />
          <Navbar />

          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </div>

        <Footer />
      </body>
    </html>
  );
}