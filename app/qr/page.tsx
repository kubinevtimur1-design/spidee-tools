import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "../seo";
import QrStudio from "./qr-studio";

const CANONICAL = "https://spidytools.ru/qr/";
const PAGE_TITLE =
  "QR-код генератор: создать QR онлайн бесплатно | Spidy Tools";
const PAGE_DESCRIPTION =
  "Создай QR-код онлайн бесплатно: вставь ссылку или текст и скачай готовый код в PNG и SVG. Без регистрации, прямо в браузере.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/qr/",
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
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: "https://spidytools.ru/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Генератор QR-кода",
          item: "https://spidytools.ru/qr/",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Генератор QR-кода Spidy Tools",
      url: "https://spidytools.ru/qr/",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      inLanguage: "ru",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
      },
      description: PAGE_DESCRIPTION,
      featureList: [
        "Стили QR-кода",
        "Скачивание SVG",
        "Скачивание PNG",
        "Копирование PNG",
        "Настройка контраста и уровня коррекции",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Можно ли менять цвет и форму QR-кода?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. Меняются цвет модулей, цвет углов, фон и форма точек. Код остаётся читаемым, если контраст высокий, угловые маркеры целые, а вокруг кода есть светлая рамка.",
          },
        },
        {
          "@type": "Question",
          name: "Чем SVG лучше PNG?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SVG — вектор. Его можно растянуть на баннер или визитку без пикселей. PNG удобен для мессенджеров, презентаций и быстрой вставки.",
          },
        },
        {
          "@type": "Question",
          name: "Считывается ли стилизованный QR-код?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Считывается, если не убирать три угловых маркера, не делать фон прозрачным и не сближать цвет точек с цветом фона. Для печати лучше уровень коррекции Q или H и файл SVG.",
          },
        },
      ],
    },
  ],
};

export default function QrPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Suspense fallback={<div className="min-h-screen bg-[#F7F5F2]" />}>
        <QrStudio />
      </Suspense>
    </>
  );
}