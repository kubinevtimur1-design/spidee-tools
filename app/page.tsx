import type { Metadata } from "next";
import HeroTitle from "./hero-title";
import HeroSlime from "./hero-slime";

export const metadata: Metadata = {
  title: "Полезные инструменты для SEO-маркетолога — Spidee",
  description:
    "Простой и быстрый сервис для ежедневной рутины маркетолога: онлайн-подсчет длины сниппетов, генерация ссылок с UTM и парсер тегов.",
  keywords: ["seo сервис", "инструменты маркетолога", "генератор utm", "проверка title description"],
};

export default function HomePage() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center my-auto py-16 sm:py-24 overflow-hidden">
      {/* Интерактивная жидкая сфера строго ПОЗАДИ заголовка */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <HeroSlime />
      </div>

      {/* Текст и контент на переднем плане с идеальной читаемостью */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-3 sm:space-y-4">
        <HeroTitle />
        <h2 className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed mx-auto max-w-xs sm:max-w-none sm:whitespace-nowrap">
          Быстрые инструменты для ежедневной рутины в один клик
        </h2>
      </div>
    </main>
  );
}