import type { Metadata } from "next";
import HeroTitle from "./hero-title";
import HeroSlime from "./hero-slime";
import HeroToolsButton from "./hero-tools-button";
import { pageMetadata } from "./seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Инструменты для SEO и маркетолога онлайн — Spidy Tools",
    description:
      "Бесплатные онлайн-инструменты для рутины SEO и маркетинга: подсчёт символов Title и Description, транслит в ЧПУ, генератор UTM-меток. Без регистрации.",
    path: "/",
    ogTitle: "Spidy Tools — инструменты для SEO и маркетолога",
    ogDescription:
      "Подсчёт символов, транслит в ЧПУ и генератор UTM в один клик. Бесплатно, без регистрации.",
  }),
  keywords: [
    "seo сервис",
    "инструменты маркетолога",
    "генератор utm",
    "транслит в чпу",
    "проверка title description",
  ],
};

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute -top-14 -bottom-20 left-0 right-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <HeroSlime />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <HeroTitle />

        <h2 className="mx-auto mt-3 max-w-xs text-sm font-normal leading-relaxed text-gray-500 sm:mt-4 sm:max-w-none sm:whitespace-nowrap sm:text-base">
          Быстрые инструменты для ежедневной рутины в один клик
        </h2>

        <div className="mt-6 flex w-full justify-center">
          <HeroToolsButton />
        </div>
      </div>
    </main>
  );
}