
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
          background: #07142f;
          border-bottom: 1px solid rgba(96, 165, 250, 0.25);
          color: white;
        }

        .aurora-glow {
          position: absolute;
          z-index: 0;
          pointer-events: none;
          left: -8%;
          right: -8%;
          top: -25px;
          height: calc(100% + 85px);
          border-radius: 50%;
          filter: blur(32px);
          will-change: transform, opacity;
          background:
            radial-gradient(
              ellipse 35% 100% at 22% 25%,
              rgba(0, 102, 255, 0.95) 0%,
              rgba(0, 91, 255, 0.55) 38%,
              transparent 100%
            ),
            radial-gradient(
              ellipse 35% 110% at 55% 0%,
              rgba(55, 145, 255, 0.95) 0%,
              rgba(0, 100, 255, 0.5) 42%,
              transparent 100%
            ),
            radial-gradient(
              ellipse 30% 100% at 88% 25%,
              rgba(0, 80, 255, 0.9) 0%,
              rgba(36, 126, 255, 0.4) 45%,
              transparent 100%
            );
          animation: electricAurora 9s ease-in-out infinite alternate;
        }

        .aurora-ribbon {
          position: absolute;
          z-index: 0;
          pointer-events: none;
          left: -10%;
          top: -15px;
          width: 120%;
          height: calc(100% + 55px);
          background: linear-gradient(
            110deg,
            transparent 10%,
            rgba(0, 92, 255, 0.08) 24%,
            rgba(49, 137, 255, 0.55) 38%,
            rgba(190, 225, 255, 0.9) 43%,
            rgba(38, 117, 255, 0.65) 48%,
            rgba(0, 76, 255, 0.12) 65%,
            transparent 82%
          );
          filter: blur(24px);
          opacity: 0.65;
          transform: translateX(-25%) skewX(-12deg);
          animation: electricFlow 8s ease-in-out infinite alternate;
        }

        .banner-content {
          position: relative;
          z-index: 2;
        }

        .banner-link {
          text-shadow: 0 1px 12px rgba(37, 99, 235, 0.45);
        }

        .banner-arrow {
          color: #93c5fd;
          transition: transform 200ms ease;
        }

        .banner-link:hover .banner-arrow {
          transform: translateX(3px);
        }

        @keyframes electricAurora {
          0% {
            transform: translate3d(-3%, -4px, 0) scale(1, 0.95);
            opacity: 0.75;
          }
          50% {
            transform: translate3d(2%, 7px, 0) scale(1.05, 1.08);
            opacity: 1;
          }
          100% {
            transform: translate3d(-1%, 2px, 0) scale(1.02, 1);
            opacity: 0.85;
          }
        }

        @keyframes electricFlow {
          0% {
            transform: translateX(-35%) skewX(-12deg);
            opacity: 0.3;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(35%) skewX(-12deg);
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
        className="aurora-banner relative z-50 w-full select-none overflow-visible px-4 py-2"
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
