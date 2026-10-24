"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const [activeNotice, setActiveNotice] = useState<{ id: string; text: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNotice = (e: React.MouseEvent, id: string, text: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setActiveNotice({ id, text });

    // Автоматическое скрытие через 2.5 секунды
    timerRef.current = setTimeout(() => {
      setActiveNotice(null);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <footer className="border-t border-gray-200/70 bg-white/50 backdrop-blur-sm pt-8 pb-14 sm:py-10 mt-auto text-xs text-gray-500">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 space-y-6">
        {/* Верхняя часть: логотип и навигация по инструментам */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🕷️</span>
              <span className="font-semibold text-gray-900 text-sm tracking-tight">Spaidy</span>
            </div>
            <p className="text-xs text-gray-400">
              Набор инструментов для практической работы
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-600">
            {/* Активный инструмент */}
            <Link href="/counter" className="hover:text-black transition-colors">
              Счетчик символов
            </Link>

            {/* Неактивный: Генератор UTM */}
            <div className="relative inline-flex items-center">
              <button
                onClick={(e) => triggerNotice(e, "f-utm", "Генератора UTM пока нет, но скоро появится! 🛠️")}
                className="hover:text-black transition-colors focus:outline-none"
              >
                Генератор UTM
              </button>
              {activeNotice?.id === "f-utm" && (
                <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200 pointer-events-none">
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                  {activeNotice.text}
                </div>
              )}
            </div>

            {/* Неактивный: Выгрузка meta */}
            <div className="relative inline-flex items-center">
              <button
                onClick={(e) => triggerNotice(e, "f-meta", "Выгрузка meta в разработке, скоро откроем! 🔍")}
                className="hover:text-black transition-colors focus:outline-none"
              >
                Выгрузка meta
              </button>
              {activeNotice?.id === "f-meta" && (
                <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200 pointer-events-none">
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                  {activeNotice.text}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Нижняя юридическая линия */}
        <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-gray-400">
          <p className="text-[11px] sm:text-xs text-gray-400">
            © 2026 Spaidy. Все права защищены.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-xs">
            {/* Неактивная: Политика конфиденциальности */}
            <div className="relative inline-flex items-center">
              <button
                onClick={(e) => triggerNotice(e, "f-privacy", "Политика конфиденциальности появится к запуску! 📄")}
                className="hover:text-gray-600 hover:underline transition-colors focus:outline-none"
              >
                Политика конфиденциальности
              </button>
              {activeNotice?.id === "f-privacy" && (
                <div className="absolute bottom-full mb-2.5 left-0 sm:left-1/2 sm:-translate-x-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200 pointer-events-none">
                  <div className="absolute -bottom-1 left-6 sm:left-1/2 sm:-translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                  {activeNotice.text}
                </div>
              )}
            </div>

            {/* Неактивная: Пользовательское соглашение */}
            <div className="relative inline-flex items-center">
              <button
                onClick={(e) => triggerNotice(e, "f-terms", "Пользовательское соглашение пока в разработке! 📑")}
                className="hover:text-gray-600 hover:underline transition-colors focus:outline-none"
              >
                Пользовательское соглашение
              </button>
              {activeNotice?.id === "f-terms" && (
                <div className="absolute bottom-full mb-2.5 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200 pointer-events-none">
                  <div className="absolute -bottom-1 right-6 sm:left-1/2 sm:-translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                  {activeNotice.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}