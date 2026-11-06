import type { MetadataRoute } from "next";

import { blogSitemapEntries, loadArticles } from "@/lib/blog/content";

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
    url: "https://spidytools.ru/erid/",
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "https://spidytools.ru/qr/",
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "https://spidytools.ru/faq-schema-generator/",
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "https://spidytools.ru/article-schema-generator/",
    lastModified: "2026-11-06",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "https://spidytools.ru/about/",
    lastModified,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: "https://spidytools.ru/contacts/",
    lastModified,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: "https://spidytools.ru/game/",
    lastModified,
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pages, ...blogSitemapEntries(loadArticles())];
}
