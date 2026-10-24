
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GameBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  if (pathname === "/game" || !isVisible) return null;

  return (
    <>
      <style jsx>{`
        .aurora-banner {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          background: #07142b;
          border-bottom: 1px solid rgba(96, 165, 250, 0.22);
          color: white;
        }

        .aurora-glow {
          position: absolute;
          z-index: 0;
          inset: -50% -10%;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse 28% 75% at 18% 50%,
              rgba(0, 92, 255, 0.9) 0%,
              rgba(0, 75, 255, 0.42) 42%,
              transparent 75%
            ),
            radial-gradient(
              ellipse 30% 85% at 52% 30%,
              rgba(35, 125, 255, 0.85) 0%,
              rgba(0, 92, 255, 0.35) 45%,
              transparent 75%
            ),
            radial-gradient(
              ellipse 26% 80% at 85% 55%,
              rgba(0, 76, 255, 0.8) 0%,
              rgba(35, 125, 255, 0.3) 45%,
              transparent 75%
            );
          filter: blur(22px);
          opacity: 0.95;
          animation: auroraDrift 12s ease-in-out infinite alternate;
        }

        .aurora-ribbon {
          position: absolute;
          z-index: 0;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            105deg,
            transparent 15%,
            rgba(30, 100, 255, 0.08) 30%,
            rgba(70, 150, 255, 0.42) 43%,
            rgba(190, 225, 255, 0.65) 47%,
            rgba(45, 125, 255, 0.38) 52%,
            rgba(0, 70, 255, 0.08) 68%,
            transparent 85%
          );
          background-size: 220% 100%;
          filter: blur(18px);
          opacity: 0.7;
          animation: ribbonShift 10s ease-in-out infinite alternate;
        }

        .banner-content {
          position: relative;
          z-index: 2;
        }

        .banner-link {
          text-shadow: 0 1px 12px rgba(37, 99, 235, 0.4);
        }

        .banner-arrow {
          color: #93c5fd;
          transition: transform 200ms ease, color 200ms ease;
        }

        .banner-link:hover .banner-arrow {
          transform: translateX(3px);
          color: #dbeafe;
        }

        @keyframes auroraDrift {
          0% {
            transform: translateX(-4%) scale(0.98);
          }
          50% {
            transform: translateX(3%) scale(1.04);
          }
          100% {
            transform: translateX(-1%) scale(1.01);
          }
        }

        @keyframes ribbonShift {
          0% {
            background-position: 100% 50%;
            opacity: 0.35;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            background-position: 0% 50%;
            opacity: 0.55;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-glow,
          .aurora-ribbon {
            animation: none;
          }
        }
      `}</style>

      <aside
        aria-label="Анонс разработки и игры"
        className="aurora-banner relative z-50 w-full select-none px-4 py-2"
      >
        <div className="aurora-glow" aria-hidden="true" />
        <div className="aurora-ribbon" aria-hidden="true" />

        <div className="banner-content max-w-5xl mx-auto flex items-center justify-center text-xs sm:text-[13px] font-normal tracking-wide">
          <Link
            href="/game"
            className="banner-link group flex items-center justify-center gap-2 text-center text-zinc-100 hover:text-white transition-colors"
          >
            <span className="text-sm leading-none shrink-0 group-hover:scale-110 transition-transform">
              🏗️
            </span>

            <span className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className="font-semibold text-white">
                Сервис строится:
              </span>
              <span>
                пока мы пишем код — постройте свой небоскрёб
              </span>
              <span className="banner-arrow inline-block font-medium">
                →
              </span>
            </span>
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-0 sm:right-2 p-1 text-zinc-300 hover:text-white hover:bg-white/10 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            title="Скрыть"
            aria-label="Закрыть уведомление"
          >
            <svg
              className="w-3.5 h-3.5"
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
          </button>
        </div>
      </aside>
    </>
  );
}
