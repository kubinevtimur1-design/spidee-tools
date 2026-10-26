import type { Metadata } from "next";
import HeroTitle from "./hero-title";
import ToolsCatalog from "./tools-catalog";

export const metadata: Metadata = {
  title: "Полезные инструменты для маркетолога — Spidy Tools",

  description:
    "Простой и быстрый сервис для ежедневной рутины маркетолога: онлайн-подсчет длины сниппетов, генерация ссылок с UTM и парсер тегов.",

  keywords: [
    "seo сервис",
    "инструменты маркетолога",
    "генератор utm",
    "проверка title description",
  ],

  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-[#F7F5F2]">
      {/* HERO */}
      <section className="flex items-center px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:pb-24 lg:pt-28">
        <div className="mx-auto w-full max-w-6xl">
          <HeroTitle />

          <h2 className="mt-3 max-w-[290px] text-left text-sm font-normal leading-relaxed text-gray-500 sm:mt-4 sm:max-w-none sm:text-base">
            Быстрые инструменты для ежедневной рутины в один клик
          </h2>
        </div>
      </section>

      <ToolsCatalog />
    </main>
  );
}