"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const tools = [
  { href: "/counter/", label: "Подсчёт символов" },
  { href: "/slug/", label: "Транслит и ЧПУ" },
  { href: "/utm-generator/", label: "Генератор UTM" },
] as const;

export default function HeroToolsButton() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300/80 bg-white/65 px-3.5 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 hover:bg-white/90 hover:text-gray-900"
        aria-expanded={open}
      >
        Перейти к инструментам
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
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

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 sm:w-max">
          <div className="flex flex-col rounded-2xl border border-gray-200/80 bg-white/95 p-1.5 shadow-lg shadow-black/[0.06] backdrop-blur-xl sm:flex-row sm:items-center">
            {tools.map((tool, index) => (
              <span
                key={tool.href}
                className="flex flex-col sm:flex-row sm:items-center"
              >
                {index > 0 && (
                  <span
                    className="mx-1 hidden h-4 w-px bg-gray-200 sm:block"
                    aria-hidden="true"
                  />
                )}
                <Link
                  href={tool.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-100 motion-reduce:transition-none"
                >
                  {tool.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
