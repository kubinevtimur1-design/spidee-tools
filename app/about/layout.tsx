import type { Metadata } from "next";
import { pageMetadata } from "../seo";

const CANONICAL = "https://spidytools.ru/about/";
const PAGE_TITLE = "О проекте | Spidy Tools";
const PAGE_DESCRIPTION =
  "Spidy Tools — бесплатные инструменты для SEO и маркетинга: счётчик символов, транслит, UTM, QR и FAQ-разметка. Работают прямо в браузере.";

const sharedMetadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/about/",
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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
