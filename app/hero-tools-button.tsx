"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function HeroToolsButton() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setNotice(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const showNotice = (text: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setNotice(text);

    timerRef.current = setTimeout(() => {
      setNotice(null);
    }, 2200);
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setNotice(null);
        }}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300/80 bg-white/65 px-3.5 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 hover:bg-white/90 hover:text-gray-900"
      >
        Перейти к инструментам

        <svg
          className={`h-3 w-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
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

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2">
          <div className="flex items-center whitespace-nowrap rounded-2xl border border-gray-200/80 bg-white/95 p-1.5 shadow-lg shadow-black/[0.06] backdrop-blur-xl animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-200">
            <Link
              href="/counter"
              className="rounded-xl px-3 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-100"
            >
              Подсчет символов
            </Link>

            <div className="mx-1 h-4 w-px bg-gray-200" />

            <button
              onClick={() =>
                showNotice("Генератор UTM пока в разработке")
              }
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              Генератор UTM

              <span className="text-[9px] font-medium text-gray-400">
                скоро
              </span>
            </button>

            <div className="mx-1 h-4 w-px bg-gray-200" />

            <button
              onClick={() =>
                showNotice("Выгрузка meta пока в разработке")
              }
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              Выгрузка meta

              <span className="text-[9px] font-medium text-gray-400">
                скоро
              </span>
            </button>
          </div>

          {notice && (
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1d1d1f] px-2.5 py-1.5 text-[11px] text-white shadow-lg">
              {notice}
            </div>
          )}
        </div>
      )}
    </div>
  );
}