"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState<{
    id: string;
    text: string;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
    setActiveNotice(null);
  };

  const triggerNotice = (
    e: React.MouseEvent,
    id: string,
    text: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (timerRef.current) clearTimeout(timerRef.current);

    setActiveNotice({ id, text });

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
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 border-b border-white/70 bg-white/45 shadow-[0_1px_18px_rgba(0,0,0,0.035)] backdrop-blur-[28px] backdrop-saturate-150" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/90" />

      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-black"
        >
          <span className="text-base leading-none">🕷️</span>
          <span>Spidy Tools</span>
        </Link>

        <nav className="hidden items-center space-x-8 text-sm text-gray-600 md:flex">
          <div className="group relative py-4">
            <button className="flex items-center gap-1 transition-colors hover:text-black focus:outline-none">
              <span>Инструменты</span>

              <svg
                className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div className="invisible absolute left-0 top-full translate-y-1 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex w-52 flex-col gap-0.5 rounded-xl border border-white/70 bg-white/60 p-1.5 shadow-lg shadow-black/[0.07] backdrop-blur-2xl">
                <Link
                  href="/counter"
                  className="flex flex-col rounded-lg px-2.5 py-2 transition-colors hover:bg-white/70"
                >
                  <span className="text-[13px] font-medium text-gray-900">
                    Подсчет символов
                  </span>
                  <span className="text-[11px] leading-4 text-gray-500">
                    Лимиты под Title и Description
                  </span>
                </Link>

                <div className="relative">
                  <button
                    onClick={(e) =>
                      triggerNotice(
                        e,
                        "tool-utm",
                        "Генератора UTM пока нет, но скоро появится! 🛠️"
                      )
                    }
                    className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/70 focus:outline-none"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-gray-900">
                        Генератор UTM
                      </span>

                      <span className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                        скоро
                      </span>
                    </div>

                    <span className="text-[11px] leading-4 text-gray-500">
                      Разметка ссылок без ошибок
                    </span>
                  </button>

                  {activeNotice?.id === "tool-utm" && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1d1d1f] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-xl shadow-black/15">
                      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#1d1d1f]" />
                      {activeNotice.text}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) =>
                      triggerNotice(
                        e,
                        "tool-meta",
                        "Выгрузка meta в разработке, скоро откроем! 🔍"
                      )
                    }
                    className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/70 focus:outline-none"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-gray-900">
                        Выгрузка meta
                      </span>

                      <span className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                        скоро
                      </span>
                    </div>

                    <span className="text-[11px] leading-4 text-gray-500">
                      Парсинг тегов по списку URL
                    </span>
                  </button>

                  {activeNotice?.id === "tool-meta" && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1d1d1f] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-xl shadow-black/15">
                      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#1d1d1f]" />
                      {activeNotice.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Link href="/pricing" className="transition-colors hover:text-black">
            Тарифы
          </Link>

          <div className="relative inline-flex items-center">
            <button
              onClick={(e) =>
                triggerNotice(
                  e,
                  "contacts",
                  "Контактов пока нет, но скоро появятся! 📬"
                )
              }
              className="transition-colors hover:text-black focus:outline-none"
            >
              Контакты
            </button>

            {activeNotice?.id === "contacts" && (
              <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#1d1d1f] px-3 py-1.5 text-xs font-medium text-white shadow-xl shadow-black/15">
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#1d1d1f]" />
                {activeNotice.text}
              </div>
            )}
          </div>

          <div className="relative inline-flex items-center">
            <button
              onClick={(e) =>
                triggerNotice(
                  e,
                  "blog",
                  "Блога пока нет, но скоро появится! 📝"
                )
              }
              className="transition-colors hover:text-black focus:outline-none"
            >
              Блог
            </button>

            {activeNotice?.id === "blog" && (
              <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#1d1d1f] px-3 py-1.5 text-xs font-medium text-white shadow-xl shadow-black/15">
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#1d1d1f]" />
                {activeNotice.text}
              </div>
            )}
          </div>
        </nav>

        <div className="relative hidden items-center md:flex">
          <button
            onClick={(e) =>
              triggerNotice(
                e,
                "cabinet",
                "Личный кабинет пока в разработке! 🔑"
              )
            }
            className="rounded-full border border-white/80 bg-white/45 px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-white/70 hover:text-black focus:outline-none"
          >
            Личный кабинет
          </button>

          {activeNotice?.id === "cabinet" && (
            <div className="pointer-events-none absolute right-0 top-full z-50 mt-2.5 whitespace-nowrap rounded-xl bg-[#1d1d1f] px-3 py-1.5 text-xs font-medium text-white shadow-xl shadow-black/15">
              <div className="absolute -top-1 right-6 h-2 w-2 rotate-45 bg-[#1d1d1f]" />
              {activeNotice.text}
            </div>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-white/60 hover:text-black focus:outline-none"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex w-full items-center justify-between py-2 text-base font-medium text-gray-900 focus:outline-none"
            >
              <span>Инструменты</span>

              <svg
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  toolsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
                <Link
                  href="/counter"
                  onClick={closeMenu}
                  className="block py-2 text-sm text-gray-700 hover:text-blue-600"
                >
                  <div className="font-medium">Подсчет символов</div>
                  <div className="text-xs text-gray-500">
                    Лимиты под Title и Description
                  </div>
                </Link>

                <button
                  onClick={(e) =>
                    triggerNotice(
                      e,
                      "m-utm",
                      "Генератора UTM пока нет, но скоро появится! 🛠️"
                    )
                  }
                  className="w-full py-2 text-left text-sm text-gray-700 hover:text-blue-600"
                >
                  <div className="font-medium">Генератор UTM</div>
                  <div className="text-xs text-gray-500">
                    Разметка ссылок без ошибок
                  </div>
                </button>

                <button
                  onClick={(e) =>
                    triggerNotice(
                      e,
                      "m-meta",
                      "Выгрузка meta в разработке, скоро откроем! 🔍"
                    )
                  }
                  className="w-full py-2 text-left text-sm text-gray-700 hover:text-blue-600"
                >
                  <div className="font-medium">Выгрузка meta</div>
                  <div className="text-xs text-gray-500">
                    Парсинг тегов по списку URL
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2.5 border-t border-black/[0.06] pt-3">
            <Link
              href="/pricing"
              onClick={closeMenu}
              className="block text-base font-medium text-gray-800"
            >
              Тарифы
            </Link>

            <button
              onClick={(e) =>
                triggerNotice(
                  e,
                  "m-contacts",
                  "Контактов пока нет, но скоро появятся! 📬"
                )
              }
              className="block text-base font-medium text-gray-800"
            >
              Контакты
            </button>

            <button
              onClick={(e) =>
                triggerNotice(
                  e,
                  "m-blog",
                  "Блога пока нет, но скоро появится! 📝"
                )
              }
              className="block text-base font-medium text-gray-800"
            >
              Блог
            </button>
          </div>

          <button
            onClick={(e) =>
              triggerNotice(
                e,
                "m-cabinet",
                "Личный кабинет пока в разработке! 🔑"
              )
            }
            className="w-full rounded-xl border border-white/80 bg-white/55 py-2.5 text-sm font-medium text-gray-900"
          >
            Личный кабинет
          </button>

          {activeNotice?.id.startsWith("m-") && (
            <div className="rounded-xl bg-[#1d1d1f] p-2.5 text-center text-xs font-medium text-white">
              {activeNotice.text}
            </div>
          )}
        </div>
      )}
    </header>
  );
}