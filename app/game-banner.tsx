"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GameBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Не показываем баннер на странице самой игры
    if (pathname === "/game") {
      setIsVisible(false);
      return;
    }

    // Проверяем, не закрывал ли пользователь плашку ранее
    const isDismissed = sessionStorage.getItem("spidee_game_dismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    sessionStorage.setItem("spidee_game_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Мини-игра на время разработки"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm sm:max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative group bg-white/90 backdrop-blur-xl border border-gray-200/90 rounded-2xl p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-200">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:scale-105 shadow-xs transition-all focus:outline-none"
          title="Скрыть уведомление"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Link href="/game" className="flex items-center gap-3.5">
          {/* Крупный эмодзи без фона и рамки */}
          <span className="text-3xl sm:text-4xl leading-none shrink-0 group-hover:scale-110 transition-transform">
            🏗️
          </span>

          {/* Текстовый блок без пульсирующей точки */}
          <div className="space-y-0.5 pr-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Сервис строится
            </span>
            <p className="text-xs font-medium text-gray-900 leading-snug">
              Пока мы пишем код — постройте свой небоскрёб →
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}