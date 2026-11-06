import type { Metadata } from "next";
import Link from "next/link";

import { SITE_URL } from "@/app/seo";
import { articlePagePath } from "@/lib/blog/paths";
import type { Article } from "@/lib/blog/types";

export function catalogMetadata(publishedCount: number): Metadata {
  const indexable = publishedCount > 0;
  const description = indexable
    ? "Разборы Spidy Tools о метках, маркировке и рабочих схемах маркетолога."
    : "Разборы Spidy Tools. Опубликованных материалов пока нет.";
  return {
    title: { absolute: "Материалы — Spidy Tools" },
    description,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/blog/`,
    },
    openGraph: {
      title: { absolute: "Материалы — Spidy Tools" },
      description,
      url: `${SITE_URL}/blog/`,
    },
  };
}

export function ArticleCatalog({ articles }: { articles: Article[] }) {
  return (
    <main className="bg-[#F7F5F2] text-[#242424]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-14">
        <p className="mb-6 text-[13px] text-black/40">
          <Link href="/" className="hover:text-[#FF3830]">
            Главная
          </Link>
          <span className="mx-2 text-black/20">/</span>
          Материалы
        </p>
        <div className="mb-8 flex items-baseline gap-2">
          <h1 className="text-[1.9rem] font-bold tracking-[-0.045em] text-[#0B0B0B] sm:text-[2.4rem]">
            Материалы
          </h1>
          {articles.length > 0 ? (
            <span className="text-[11px] font-medium text-[#6B6B6B]">{articles.length}</span>
          ) : null}
        </div>

        {articles.length === 0 ? (
          <div className="max-w-xl rounded-[18px] border border-black/[0.08] bg-white px-5 py-6">
            <p className="text-base font-semibold text-[#0B0B0B]">
              Опубликованных материалов пока нет.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#666666]">
              Черновики не попадают в этот список, в sitemap и на статические
              страницы сайта.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={articlePagePath(article.slug)}
                className="group flex min-h-[180px] flex-col rounded-[18px] border border-black/[0.08] bg-[#F7F5F2] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-black/[0.16] hover:shadow-[0_16px_35px_rgba(0,0,0,0.055)]"
              >
                {article.section ? (
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF3830]">
                    {article.section}
                  </span>
                ) : null}
                <span className="mt-3 text-[1.35rem] font-bold leading-[1.05] tracking-[-0.04em] text-[#0B0B0B]">
                  {article.title}
                </span>
                {article.description ? (
                  <span className="mt-3 text-[13px] leading-relaxed text-[#777777]">
                    {article.description}
                  </span>
                ) : null}
                <span className="mt-auto pt-6 text-sm text-[#0B0B0B]">Читать ↗</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
