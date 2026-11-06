import Image from "next/image";
import Link from "next/link";

import { stripMatchingH1 } from "@/lib/blog/markdown";
import { articlePagePath, catalogPath } from "@/lib/blog/paths";
import { blogToolById } from "@/lib/blog/tools";
import type { Article, ArticleBlock, ComparisonBlock } from "@/lib/blog/types";

import { MarkdownBody } from "./markdown-body";

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function formatRuDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const monthName = MONTHS[Number(month) - 1];
  if (!year || !monthName || !day) return iso;
  return `${Number(day)} ${monthName} ${year}`;
}

function ComparisonTable({ block }: { block: ComparisonBlock }) {
  return (
    <figure className="my-8" data-block="comparison">
      {block.caption ? (
        <figcaption className="mb-3 text-sm text-[#555555]">{block.caption}</figcaption>
      ) : null}
      <div className="blog-table-scroll">
        <table>
          <thead>
            <tr>
              {block.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, index) => (
              <tr key={`${row.join("|")}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${block.columns[cellIndex]}-${cell}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function BlockView({ block, title }: { block: ArticleBlock; title: string }) {
  if (block.type === "markdown") {
    const text = stripMatchingH1(block.text, title).trim();
    if (!text) return null;
    return <MarkdownBody text={text} />;
  }

  if (block.type === "note") {
    return (
      <aside
        data-block="note"
        data-tone={block.tone}
        className={`my-8 rounded-2xl border px-4 py-4 sm:px-5 ${
          block.tone === "warning"
            ? "border-[#FF3830]/30 bg-[#FF3830]/[0.06]"
            : "border-black/[0.08] bg-white"
        }`}
      >
        <MarkdownBody text={block.text} />
      </aside>
    );
  }

  if (block.type === "cta") {
    const external = block.href.startsWith("https://");
    const className =
      "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B0B0B] px-4 text-sm font-semibold text-white transition-transform duration-150 hover:bg-[#FF3830] active:scale-[0.98]";
    return (
      <div data-block="cta" className="my-10 flex flex-col items-start gap-3">
        {block.lead ? <p className="text-base text-[#242424]">{block.lead}</p> : null}
        {external ? (
          <a className={className} href={block.href} target="_blank" rel="noopener noreferrer">
            {block.label}
          </a>
        ) : (
          <Link className={className} href={block.href}>
            {block.label}
          </Link>
        )}
      </div>
    );
  }

  if (block.type === "tool") {
    const tool = blogToolById(block.tool);
    if (!tool) return null;
    return (
      <div data-block="tool" className="my-8">
        {block.caption ? (
          <p className="mb-3 text-base leading-relaxed text-[#242424]">{block.caption}</p>
        ) : null}
        <Link
          href={tool.href}
          className="group flex items-center gap-3 rounded-[18px] border border-black/[0.08] bg-[#F7F5F2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/[0.16] hover:shadow-[0_16px_35px_rgba(0,0,0,0.055)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-base font-bold">
            {tool.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold tracking-[-0.03em] text-[#0B0B0B]">
              {tool.title}
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-[#777777]">
              {tool.description}
            </span>
          </span>
          <span className="ml-auto text-[#0B0B0B] transition-transform duration-200 group-hover:-rotate-6">
            ↗
          </span>
        </Link>
      </div>
    );
  }

  return <ComparisonTable block={block} />;
}

export function ArticleDocument({ article }: { article: Article }) {
  const publishedLabel = [article.author, article.date ? formatRuDate(article.date) : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="bg-[#F7F5F2] text-[#242424]" data-draft={article.draft ? "true" : "false"}>
      <article className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12">
        <p className="mb-6 text-[13px] text-black/40">
          <Link href="/" className="hover:text-[#FF3830]">
            Главная
          </Link>
          <span className="mx-2 text-black/20">/</span>
          <Link href={catalogPath()} className="hover:text-[#FF3830]">
            Материалы
          </Link>
        </p>

        {article.draft ? (
          <p className="mb-6 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-relaxed text-[#242424]">
            Черновик для локального просмотра. В каталог, sitemap и статический
            экспорт эта страница не попадает. Автор, дата и обложка намеренно не
            заполнены.
          </p>
        ) : null}

        {article.section ? (
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF3830]">
            {article.section}
          </p>
        ) : null}

        <h1 className="text-[1.75rem] font-bold leading-[1.08] tracking-[-0.045em] text-[#0B0B0B] sm:text-[2.55rem]">
          {article.title}
        </h1>

        {article.description ? (
          <p className="mt-4 text-base leading-relaxed text-[#555555] sm:text-lg">
            {article.description}
          </p>
        ) : null}

        {publishedLabel ? (
          <p className="mt-4 text-sm text-[#777777]">
            {article.author ? <span>{article.author}</span> : null}
            {article.author && article.date ? <span> · </span> : null}
            {article.date ? <time dateTime={article.date}>{formatRuDate(article.date)}</time> : null}
          </p>
        ) : null}

        {article.updated && article.updated !== article.date ? (
          <p className="mt-1 text-sm text-[#777777]">
            Обновлено <time dateTime={article.updated}>{formatRuDate(article.updated)}</time>
          </p>
        ) : null}

        {article.cover ? (
          <Image
            src={article.cover}
            alt={article.coverAlt}
            width={1200}
            height={630}
            className="mt-8 h-auto w-full rounded-[20px] border border-black/[0.06]"
          />
        ) : null}

        <div className="mt-8">
          {article.blocks.map((block, index) => (
            <BlockView key={`${block.type}-${index}`} block={block} title={article.title} />
          ))}
        </div>
      </article>
    </main>
  );
}

export function AliasNotice({ article }: { article: Article }) {
  const href = articlePagePath(article.slug);
  return (
    <main className="bg-[#F7F5F2] text-[#242424]">
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-[1.75rem] font-bold tracking-[-0.045em]">Материал переехал</h1>
        <p className="mt-4 text-base leading-relaxed text-[#555555]">
          Новый адрес:{" "}
          <Link href={href} className="underline decoration-[#FF3830] underline-offset-4">
            {article.title}
          </Link>
        </p>
        <meta httpEquiv="refresh" content={`0; url=${href}`} />
      </section>
    </main>
  );
}
