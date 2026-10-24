import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import UtmTool from "./utm-tool";

const CANONICAL = "https://www.spidytools.ru/utm-generator/";
const PAGE_TITLE =
  "Генератор UTM-меток и QR-код — Директ, VK, Google Ads | Spidy Tools";
const PAGE_DESCRIPTION =
  "Соберите UTM-ссылку для Яндекс Директа, VK Рекламы, myTarget и Google Ads и скачайте QR-код. Пресеты площадок и динамические параметры. Бесплатно, без регистрации.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/utm-generator/",
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
    "генератор utm",
    "utm метки",
    "qr код для ссылки",
    "utm яндекс директ",
  ],
};

export default function UtmGeneratorPage() {
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
            name: "Генератор UTM",
            item: CANONICAL,
          },
        ],
      },
      {
        "@type": "WebApplication",
        name: "Генератор UTM-меток и QR-код",
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <UtmTool />
    </>
  );
}
