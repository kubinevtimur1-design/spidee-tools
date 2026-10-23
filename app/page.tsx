import type { Metadata } from "next";
import HeroTitle from "./hero-title";

export const metadata: Metadata = {
  title: "Spydee — полезные инструменты для SEO-маркетолога",
  description:
    "Простой и быстрый сервис для ежедневной рутины маркетолога: онлайн-подсчет длины сниппетов, генерация ссылок с UTM и парсер тегов.",
  keywords: ["seo сервис", "инструменты маркетолога", "генератор utm", "проверка title description"],
};

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center my-auto py-20">
      <div className="max-w-4xl mx-auto space-y-4">
        <HeroTitle />
        <h2 className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed mx-auto sm:whitespace-nowrap">
          Быстрые инструменты для ежедневной рутины в один клик
        </h2>
      </div>
    </main>
  );
}