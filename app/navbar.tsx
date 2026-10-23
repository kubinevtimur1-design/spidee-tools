"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Состояние активного всплывающего сообщения: { id кнопки, текст }
  const [activeNotice, setActiveNotice] = useState<{ id: string; text: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
    setActiveNotice(null);
  };

  // Универсальный триггер всплывающего сообщения
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

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-200/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Логотип */}
        <Link
          href="/"
          onClick={closeMenu}
          className="font-semibold text-lg tracking-tight text-black flex items-center gap-2"
        >
          <span className="text-base leading-none">🕷️</span>
          <span>Spidee</span>
        </Link>

        {/* Десктопное меню */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-normal text-gray-600">
          {/* Выпадающий список "Инструменты" */}
          <div className="relative group py-4">
            <button className="flex items-center gap-1 hover:text-black transition-colors focus:outline-none">
              <span>Инструменты</span>
              <svg
                className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
              <div className="w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/80 p-2 flex flex-col gap-1">
                {/* Активный инструмент: Подсчет символов */}
                <Link
                  href="/counter"
                  className="px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col"
                >
                  <span className="font-medium text-gray-900">Подсчет символов</span>
                  <span className="text-xs text-gray-400">Лимиты под Title и Description</span>
                </Link>

                {/* Неактивный: Генератор UTM */}
                <div className="relative">
                  <button
                    onClick={(e) => triggerNotice(e, "tool-utm", "Генератора UTM пока нет, но скоро появится! 🛠️")}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Генератор UTM</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">скоро</span>
                    </div>
                    <span className="text-xs text-gray-400">Разметка ссылок без ошибок</span>
                  </button>
                  {activeNotice?.id === "tool-utm" && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                      {activeNotice.text}
                    </div>
                  )}
                </div>

                {/* Неактивный: Выгрузка meta */}
                <div className="relative">
                  <button
                    onClick={(e) => triggerNotice(e, "tool-meta", "Выгрузка meta в разработке, скоро откроем! 🔍")}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Выгрузка meta</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">скоро</span>
                    </div>
                    <span className="text-xs text-gray-400">Парсинг тегов по списку URL</span>
                  </button>
                  {activeNotice?.id === "tool-meta" && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                      {activeNotice.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Тарифы (активная страница) */}
          <Link href="/pricing" className="hover:text-black transition-colors">
            Тарифы
          </Link>

          {/* Неактивная кнопка: Контакты */}
          <div className="relative inline-flex items-center">
            <button
              onClick={(e) => triggerNotice(e, "contacts", "Контактов пока нет, но скоро появятся! 📬")}
              className="hover:text-black transition-colors focus:outline-none"
            >
              Контакты
            </button>
            {activeNotice?.id === "contacts" && (
              <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-200 pointer-events-none">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                {activeNotice.text}
              </div>
            )}
          </div>

          {/* Неактивная кнопка: Блог */}
          <div className="relative inline-flex items-center">
            <button
              onClick={(e) => triggerNotice(e, "blog", "Блога пока нет, но скоро появится! 📝")}
              className="hover:text-black transition-colors focus:outline-none"
            >
              Блог
            </button>
            {activeNotice?.id === "blog" && (
              <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-200 pointer-events-none">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                {activeNotice.text}
              </div>
            )}
          </div>
        </nav>

        {/* Правая часть: Личный кабинет (десктоп) */}
        <div className="hidden md:flex items-center relative">
          <button
            onClick={(e) => triggerNotice(e, "cabinet", "Личный кабинет пока в разработке! 🔑")}
            className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-100 hover:text-black transition-all focus:outline-none"
          >
            Личный кабинет
          </button>
          {activeNotice?.id === "cabinet" && (
            <div className="absolute top-full mt-2.5 right-0 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-xl shadow-black/15 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-200 pointer-events-none">
              <div className="absolute -top-1 right-6 w-2 h-2 bg-[#1d1d1f] rotate-45" />
              {activeNotice.text}
            </div>
          )}
        </div>

        {/* Мобильная кнопка Гамбургер */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Мобильная шторка с поддержкой уведомлений */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-5 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="w-full flex items-center justify-between py-2 text-base font-medium text-gray-900 focus:outline-none"
            >
              <span>Инструменты</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  toolsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {toolsOpen && (
              <div className="pl-3 py-1 space-y-1 border-l-2 border-gray-100 ml-1">
                <Link
                  href="/counter"
                  onClick={closeMenu}
                  className="block py-2 text-sm text-gray-700 hover:text-blue-600"
                >
                  <div className="font-medium">Подсчет символов</div>
                  <div className="text-xs text-gray-400">Лимиты под Title и Description</div>
                </Link>

                <div className="relative">
                  <button
                    onClick={(e) => triggerNotice(e, "m-utm", "Генератора UTM пока нет, но скоро появится! 🛠️")}
                    className="w-full text-left py-2 text-sm text-gray-700 hover:text-blue-600 focus:outline-none"
                  >
                    <div className="font-medium flex items-center justify-between pr-2">
                      <span>Генератор UTM</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">скоро</span>
                    </div>
                    <div className="text-xs text-gray-400">Разметка ссылок без ошибок</div>
                  </button>
                  {activeNotice?.id === "m-utm" && (
                    <div className="mt-1 p-2 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-md animate-in fade-in duration-200">
                      {activeNotice.text}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => triggerNotice(e, "m-meta", "Выгрузка meta в разработке, скоро откроем! 🔍")}
                    className="w-full text-left py-2 text-sm text-gray-700 hover:text-blue-600 focus:outline-none"
                  >
                    <div className="font-medium flex items-center justify-between pr-2">
                      <span>Выгрузка meta</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">скоро</span>
                    </div>
                    <div className="text-xs text-gray-400">Парсинг тегов по списку URL</div>
                  </button>
                  {activeNotice?.id === "m-meta" && (
                    <div className="mt-1 p-2 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-md animate-in fade-in duration-200">
                      {activeNotice.text}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            <Link
              href="/pricing"
              onClick={closeMenu}
              className="block text-base font-medium text-gray-800 hover:text-blue-600"
            >
              Тарифы
            </Link>

            {/* Контакты (мобайл) */}
            <div>
              <button
                onClick={(e) => triggerNotice(e, "m-contacts", "Контактов пока нет, но скоро появятся! 📬")}
                className="w-full text-left text-base font-medium text-gray-800 hover:text-blue-600 focus:outline-none"
              >
                Контакты
              </button>
              {activeNotice?.id === "m-contacts" && (
                <div className="mt-1.5 p-2.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-md animate-in fade-in duration-200">
                  {activeNotice.text}
                </div>
              )}
            </div>

            {/* Блог (мобайл) */}
            <div>
              <button
                onClick={(e) => triggerNotice(e, "m-blog", "Блога пока нет, но скоро появится! 📝")}
                className="w-full text-left text-base font-medium text-gray-800 hover:text-blue-600 focus:outline-none"
              >
                Блог
              </button>
              {activeNotice?.id === "m-blog" && (
                <div className="mt-1.5 p-2.5 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-md animate-in fade-in duration-200">
                  {activeNotice.text}
                </div>
              )}
            </div>
          </div>

          {/* Личный кабинет (мобайл) */}
          <div className="pt-2">
            <button
              onClick={(e) => triggerNotice(e, "m-cabinet", "Личный кабинет пока в разработке! 🔑")}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium flex items-center justify-center transition-colors focus:outline-none"
            >
              Личный кабинет
            </button>
            {activeNotice?.id === "m-cabinet" && (
              <div className="mt-2 p-2.5 text-center rounded-xl bg-[#1d1d1f] text-white text-xs font-medium shadow-md animate-in fade-in duration-200">
                {activeNotice.text}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}