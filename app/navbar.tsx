"use client";

import { useState } from "react";
import Link from "next/link";
import NavbarLogo from "./navbar-logo";

const tools = [
  {
    href: "/counter/",
    title: "Подсчёт символов",
    description: "Лимиты Title и Description",
  },
  {
    href: "/slug/",
    title: "Транслит и ЧПУ",
    description: "Чистый URL из заголовка",
  },
  {
    href: "/utm-generator/",
    title: "Генератор UTM",
    description: "Разметка ссылок для рекламы",
  },
] as const;

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 border-b border-white/70 bg-white/45 shadow-[0_1px_18px_rgba(0,0,0,0.035)] backdrop-blur-[28px] backdrop-saturate-150" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/90" />

      <div className="relative mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1">
          <NavbarLogo onClick={closeMenu} />
        </div>

        <nav className="hidden shrink-0 items-center gap-1 text-sm text-gray-600 md:flex">
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/60 hover:text-black focus:outline-none focus-visible:bg-white/60"
              aria-haspopup="true"
            >
              <span>Инструменты</span>
              <svg
                className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="flex w-60 flex-col gap-0.5 rounded-xl border border-white/70 bg-white/80 p-1.5 shadow-lg shadow-black/[0.07] backdrop-blur-2xl">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex flex-col rounded-lg px-2.5 py-2 transition-colors hover:bg-white"
                  >
                    <span className="text-[13px] font-medium text-gray-900">
                      {tool.title}
                    </span>
                    <span className="text-[11px] leading-4 text-gray-500">
                      {tool.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/pricing/"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/60 hover:text-black"
          >
            Тарифы
          </Link>

          <Link
            href="/game/"
            className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/60 hover:text-black"
          >
            Игра
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-white/60 hover:text-black focus:outline-none md:hidden"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="relative space-y-4 border-b border-white/80 bg-white/70 px-5 pb-6 pt-3 shadow-lg shadow-black/[0.05] backdrop-blur-2xl md:hidden">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setToolsOpen((open) => !open)}
              className="flex w-full items-center justify-between py-2 text-base font-medium text-gray-900 focus:outline-none"
              aria-expanded={toolsOpen}
            >
              <span>Инструменты</span>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  toolsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {toolsOpen && (
              <div className="ml-1 space-y-1 border-l-2 border-black/[0.06] py-1 pl-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={closeMenu}
                    className="block py-2 text-sm text-gray-700 hover:text-blue-600"
                  >
                    <div className="font-medium">{tool.title}</div>
                    <div className="text-xs text-gray-500">
                      {tool.description}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2.5 border-t border-black/[0.06] pt-3">
            <Link
              href="/pricing/"
              onClick={closeMenu}
              className="block text-base font-medium text-gray-800"
            >
              Тарифы
            </Link>
            <Link
              href="/game/"
              onClick={closeMenu}
              className="block text-base font-medium text-gray-800"
            >
              Игра
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
