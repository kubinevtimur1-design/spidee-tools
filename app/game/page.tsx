import type { Metadata } from "next";
import TowerGame from "./tower-game";

export const metadata: Metadata = {
  title: "Spidee Tower — Построй свой небоскреб",
  description: "Классическая таймкиллер-игра в духе кнопочных телефонов: строй этажи, удерживай баланс и ставь рекорды.",
};

export default function GamePage() {
  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
          Небоскрёб Spidee 🏗️
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xs sm:max-w-md mx-auto">
          Отвлекитесь от анализа сниппетов и проверьте реакцию, как на олдскульных мобилках.
        </p>
      </div>

      <TowerGame />
    </main>
  );
}