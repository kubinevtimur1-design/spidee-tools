import type { Metadata } from "next";
import { pageMetadata } from "../seo";

const CANONICAL = "https://spidytools.ru/faq-schema-generator/";
const PAGE_TITLE =
  "Генератор FAQ-разметки (FAQPage JSON-LD) онлайн | Spidy Tools";
const PAGE_DESCRIPTION =
  "Собери микроразметку FAQ для сайта: впиши вопросы и ответы — получи готовый JSON-LD для Яндекса и Google. Бесплатно, без регистрации.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/faq-schema-generator/",
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
};

export default function FaqSchemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
