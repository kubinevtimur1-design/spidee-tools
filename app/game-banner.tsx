"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function GameBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  if (!visible || pathname === "/game") return null;

  return (
    <div className="relative z-[60] overflow-hidden border-b border-blue-100 bg-blue-50/70">
      <div className="absolute left-1/3 top-0 h-full w-72 bg-blue-300/20 blur-2xl animate-pulse" />

      <div className="relative flex h-9 items-center justify-center px-12">
        <Link
          href="/game"
          className="group flex items-center gap-2 text-[11px] text-gray-600 hover:text-gray-900"
        >
          <span className="crane">🏗️</span>

          <span>
            Пока мы строим сервис —{" "}
            <span className="font-medium text-blue-600">
              постройте свой небоскрёб
            </span>
          </span>

          <span className="text-blue-500 transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>

        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 text-sm text-gray-400 hover:text-gray-900"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>

      <style jsx>{`
        .crane {
          display: inline-block;
          animation: crane-turn 4s ease-in-out infinite;
        }

        @keyframes crane-turn {
          0%, 15% {
            transform: scaleX(1);
          }

          45%, 55% {
            transform: scaleX(-1);
          }

          85%, 100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}