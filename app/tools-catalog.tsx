"use client";

import Link from "next/link";
import { useState } from "react";

type Category = "Все" | "Ссылки" | "Текст" | "Данные";

type Tool = {
  href: string;
  title: string;
  description: string;
  icon: string;
  category: Exclude<Category, "Все">;
  featured?: boolean;
};

const TOOLS: Tool[] = [
  {
    href: "/utm-generator/",
    title: "Генератор\nUTM-меток",
    description: "Создавайте UTM-ссылки за секунды. Без ошибок.",
    icon: "↗",
    category: "Ссылки",
    featured: true,
  },
  {
    href: "/faq-schema-generator/",
    title: "Генератор\nFAQ Schema",
    description: "Создавайте JSON-LD разметку для вопросов и ответов.",
    icon: "⌘",
    category: "Данные",
  },
  {
    href: "/counter/",
    title: "Подсчёт\nсимволов",
    description: "Проверяйте длину Title, Description и любого текста.",
    icon: "T",
    category: "Текст",
  },
  {
    href: "/slug/",
    title: "Транслит\nи ЧПУ",
    description: "Создавайте чистые и понятные URL из русского текста.",
    icon: "Aa",
    category: "Ссылки",
  },
];

const FILTERS: Category[] = ["Все", "Ссылки", "Текст", "Данные"];

export default function ToolsCatalog() {
  const [activeFilter, setActiveFilter] = useState<Category>("Все");

  const filteredTools =
    activeFilter === "Все"
      ? TOOLS
      : TOOLS.filter((tool) => tool.category === activeFilter);

  return (
    <section className="px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:pb-16">
      <div className="mx-auto w-full max-w-6xl">
        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between lg:mb-8">
          <div className="flex items-start gap-2">
            <h2 className="text-[22px] font-semibold tracking-[-0.045em] text-[#0B0B0B] sm:text-[25px]">
              Все инструменты
            </h2>

            <span className="mt-[2px] text-[11px] font-medium text-[#6B6B6B]">
              {filteredTools.length}
            </span>
          </div>

          {/* FILTERS */}
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-max items-center gap-1">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    aria-pressed={active}
                    className={[
                      "h-9 whitespace-nowrap rounded-xl px-5 text-[12px] font-medium",
                      "transition-all duration-200 active:scale-[0.96]",
                      active
                        ? "bg-[#0B0B0B] text-white"
                        : "text-[#555555] hover:bg-black/[0.04] hover:text-[#0B0B0B]",
                    ].join(" ")}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={[
                "group relative flex min-h-[240px] animate-[toolAppear_280ms_ease-out] flex-col overflow-hidden rounded-[18px] border border-black/[0.08] p-5",
                "transition-all duration-300 ease-out",
                "sm:min-h-[270px] sm:p-6",
                "hover:-translate-y-1 hover:border-black/[0.16] hover:shadow-[0_16px_35px_rgba(0,0,0,0.055)]",
                tool.featured
                  ? "bg-[#FF3830]/[0.055]"
                  : "bg-[#F7F5F2]",
              ].join(" ")}
            >
              {/* ICON */}
              <div
                className={[
                  "mb-6 flex h-10 items-center text-[32px] font-medium leading-none tracking-[-0.08em] sm:mb-7 sm:text-[34px]",
                  tool.featured
                    ? "text-[#FF3830]"
                    : "text-[#0B0B0B]",
                ].join(" ")}
                aria-hidden="true"
              >
                <span className="inline-block transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110">
                  {tool.icon}
                </span>
              </div>

              {/* TITLE */}
              <h3 className="whitespace-pre-line text-[21px] font-bold leading-[0.98] tracking-[-0.045em] text-[#0B0B0B] sm:text-[23px]">
                {tool.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="mt-3 max-w-[220px] text-[13px] font-normal leading-[1.45] text-[#777777]">
                {tool.description}
              </p>

              {/* ARROW */}
              <div className="mt-auto pt-7 sm:pt-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.1] bg-[#F7F5F2] text-[17px] text-[#0B0B0B] transition-all duration-300 ease-out group-hover:-rotate-6 group-hover:bg-[#0B0B0B] group-hover:text-white">
                  ↗
                </span>
              </div>

              {/* DECOR */}
              <span
                className={[
                  "pointer-events-none absolute -bottom-14 -right-12 h-40 w-40 rounded-full border transition-transform duration-500 ease-out group-hover:scale-125",
                  tool.featured
                    ? "border-[#FF3830]/15"
                    : "border-black/[0.04]",
                ].join(" ")}
                aria-hidden="true"
              />

              <span
                className={[
                  "pointer-events-none absolute -bottom-20 -right-4 h-40 w-40 rounded-full border transition-transform duration-500 ease-out group-hover:scale-110",
                  tool.featured
                    ? "border-[#FF3830]/10"
                    : "border-black/[0.025]",
                ].join(" ")}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes toolAppear {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}