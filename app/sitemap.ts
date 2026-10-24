import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const lastModified = "2026-10-24";

const pages: MetadataRoute.Sitemap = [
  {
    url: "https://spidytools.ru/",
    lastModified,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: "https://spidytools.ru/counter/",
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "https://spidytools.ru/slug/",
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "https://spidytools.ru/utm-generator/",
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "https://spidytools.ru/pricing/",
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: "https://spidytools.ru/game/",
    lastModified,
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages;
}
