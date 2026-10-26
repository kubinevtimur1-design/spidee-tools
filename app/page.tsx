import type { Metadata } from "next";
import HeroTitle from "./hero-title";
import HeroSlime from "./hero-slime";

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
<main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24">      <div className="pointer-events-none absolute -top-14 -bottom-20 left-0 right-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <HeroSlime />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <HeroTitle />

        <h2 className="mt-3 max-w-xs text-left text-sm font-normal leading-relaxed text-gray-500 sm:mt-4 sm:max-w-none sm:whitespace-nowrap sm:text-base">
          Быстрые инструменты для ежедневной рутины в один клик
        </h2>
      </div>
    </main>
  );
}