import type { Metadata } from "next";
import { pageMetadata } from "../seo";

const CANONICAL = "https://spidytools.ru/contacts/";
const PAGE_TITLE = "Контакты | Spidy Tools";
const PAGE_DESCRIPTION =
  "Напиши нам: идеи инструментов, найденные ошибки и предложения по Spidy Tools.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/contacts/",
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

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
