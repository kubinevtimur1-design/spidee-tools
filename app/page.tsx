import type { Metadata } from "next";
import HeroTitle from "./hero-title";
import HeroSlime from "./hero-slime";
import HeroToolsButton from "./hero-tools-button";

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
    <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center my-auto py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <HeroSlime />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        <HeroTitle />

        <h2 className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500 font-normal leading-relaxed mx-auto max-w-xs sm:max-w-none sm:whitespace-nowrap">
          Быстрые инструменты для ежедневной рутины в один клик
        </h2>

        <div className="mt-6 flex w-full justify-center">
          <HeroToolsButton />
        </div>
      </div>
    </main>
  );
}