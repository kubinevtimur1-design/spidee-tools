import type { Metadata } from "next";
import TowerGame from "./tower-game";
import { pageMetadata } from "../seo";

export const metadata: Metadata = pageMetadata({
  title: "Spidee Tower — построй небоскрёб | Spidy Tools",
  description:
    "Мини-игра Spidee Tower: строй этажи, удерживай баланс и ставь рекорды. Пока мы развиваем сервисы.",
  path: "/game/",
  ogTitle: "Spidee Tower — построй небоскрёб",
  ogDescription: "Таймкиллер: строй этажи и ставь рекорды.",
});

export default function GamePage() {
  return (
    <main className="flex-1 bg-[#F7F5F2] text-[#242424]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-14">
        <div className="mb-7 text-[13px] text-black/40 sm:mb-9">
          Главная
          <span className="mx-2 text-black/20">/</span>
          Играть
        </div>

        <div className="mb-8 max-w-3xl sm:mb-10">
          <div className="flex items-start gap-3">
            <span
              className="mt-[-0.06em] shrink-0 rotate-[-7deg] text-[64px] font-bold leading-[0.9] text-[#FF3830] sm:text-[82px]"
              aria-hidden="true"
            >
              *
            </span>

            <div>
              <h1 className="text-[clamp(46px,7vw,82px)] font-bold leading-[0.92] tracking-[-0.065em]">
                Spidee Tower
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-relaxed tracking-[-0.02em] text-black/45 sm:text-[17px]">
                Пока мы строим сервис, ты можешь отвлечься и построить свой
                небоскрёб.
              </p>
            </div>
          </div>
        </div>

        <TowerGame />
      </div>
    </main>
  );
}