"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
  };

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

        {/* Десктопное меню (скрыто на экранах меньше md: 768px) */}
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
              <div className="w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/80 p-2 flex flex-col gap-1">
                <Link
                  href="/counter"
                  className="px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col"
                >
                  <span className="font-medium text-gray-900">Подсчет символов</span>
                  <span className="text-xs text-gray-400">Лимиты под Title и Description</span>
                </Link>
                <Link
                  href="/utm"
                  className="px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col"
                >
                  <span className="font-medium text-gray-900">Генератор UTM</span>
                  <span className="text-xs text-gray-400">Разметка ссылок без ошибок</span>
                </Link>
                <Link
                  href="/meta"
                  className="px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors flex flex-col"
                >
                  <span className="font-medium text-gray-900">Выгрузка meta</span>
                  <span className="text-xs text-gray-400">Парсинг тегов по списку URL</span>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/pricing" className="hover:text-black transition-colors">
            Тарифы
          </Link>
          <Link href="#" className="hover:text-black transition-colors">
            Контакты
          </Link>
          <Link href="#" className="hover:text-black transition-colors">
            Блог
          </Link>
        </nav>

        {/* Правая часть на десктопе: кнопка ЛК */}
        <div className="hidden md:flex items-center">
          <Link
            href="#"
            className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-100 hover:text-black transition-all"
          >
            Личный кабинет
          </Link>
        </div>

        {/* Мобильная кнопка Гамбургер / Крестик */}
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

      {/* Мобильная выпадающая шторка */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-5 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Аккордеон инструментов для смартфона */}
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
                <Link
                  href="/utm"
                  onClick={closeMenu}
                  className="block py-2 text-sm text-gray-700 hover:text-blue-600"
                >
                  <div className="font-medium">Генератор UTM</div>
                  <div className="text-xs text-gray-400">Разметка ссылок без ошибок</div>
                </Link>
                <Link
                  href="/meta"
                  onClick={closeMenu}
                  className="block py-2 text-sm text-gray-700 hover:text-blue-600"
                >
                  <div className="font-medium">Выгрузка meta</div>
                  <div className="text-xs text-gray-400">Парсинг тегов по списку URL</div>
                </Link>
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
            <Link
              href="#"
              onClick={closeMenu}
              className="block text-base font-medium text-gray-800 hover:text-blue-600"
            >
              Контакты
            </Link>
            <Link
              href="#"
              onClick={closeMenu}
              className="block text-base font-medium text-gray-800 hover:text-blue-600"
            >
              Блог
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="#"
              onClick={closeMenu}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium flex items-center justify-center transition-colors"
            >
              Личный кабинет
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}