import type { Metadata } from "next";

export const SITE_URL = "https://spidytools.ru";

const OG_IMAGE = {
  url: "/hero-glass.webp",
  width: 2048,
  height: 2048,
  alt: "Spidy Tools",
  type: "image/webp",
} as const;

export type LivePath =
  | "/"
  | "/counter/"
  | "/slug/"
  | "/utm-generator/"
  | "/qr/"
  | "/pricing/"
  | "/game/";

type PageSeo = {
  title: string;
  description: string;
  path: LivePath;
  ogTitle: string;
  ogDescription: string;
};

export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
}: PageSeo): Metadata {
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: "Spidy Tools",
      title: { absolute: ogTitle },
      description: ogDescription,
      url,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary",
      title: { absolute: ogTitle },
      description: ogDescription,
      images: [OG_IMAGE.url],
    },
  };
}
