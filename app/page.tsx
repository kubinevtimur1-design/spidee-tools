import type { Metadata } from "next";
import HeroTitle from "./hero-title";

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
    <main className="relative flex flex-1 flex-col items-center justify-center bg-[#F7F5F2] px-4 py-16 sm:px-6 sm:py-24">
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <HeroTitle />

        <h2 className="mt-3 max-w-xs text-left text-sm font-normal leading-relaxed text-gray-500 sm:mt-4 sm:max-w-none sm:whitespace-nowrap sm:text-base">
          Быстрые инструменты для ежедневной рутины в один клик
        </h2>
      </div>
    </main>
  );
}