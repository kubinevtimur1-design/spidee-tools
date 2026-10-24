import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "../seo";

export const metadata: Metadata = pageMetadata({
  title: "Тарифы Spidy Tools — пока бесплатно",
  description:
    "Условия Spidy Tools: все текущие инструменты бесплатно, без подписок и привязки карты.",
  path: "/pricing/",
  ogTitle: "Тарифы Spidy Tools",
  ogDescription: "Сейчас бесплатно для всех. Без скрытых списаний.",
});

export default function PricingPage() {
  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Spidy Tools — Пока что бесплатно",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="relative flex-1 w-full px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />

      <div className="vortex-wrap">
        <div className="vortex-bg">
          <div className="vortex v1" />
          <div className="vortex v2" />
          <div className="vortex v3" />
          <div className="vortex v4" />
          <div className="vortex v5" />
          <div className="vortex blue" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        <div className="mb-12 space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] sm:text-5xl">
            Простые и честные условия
          </h1>

          <p className="mx-auto max-w-md text-base text-gray-500">
            Никаких подписок, привязок карт и скрытых списаний. Работайте
            эффективно прямо сейчас.
          </p>
        </div>

        <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/45 bg-white/[0.16] p-8 shadow-2xl shadow-black/[0.08] backdrop-blur-[32px] backdrop-saturate-150">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Тарифный план
            </span>

            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1f]">
                Пока что бесплатно
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Все текущие и разрабатываемые утилиты в одном пакете
              </p>
            </div>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
                0 ₽
              </span>

              <span className="text-xs text-gray-500">/ навсегда</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-black/[0.10] pt-4">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Что входит в тариф
            </span>

            <ul className="space-y-3 text-sm">
              {[
                { name: "Подсчёт символов", ready: true },
                { name: "Транслит и ЧПУ", ready: true },
                { name: "Генератор UTM", ready: true },
                { name: "Выгрузка meta", ready: false },
                {
                  name: "Личный кабинет для комфортной работы",
                  ready: false,
                },
              ].map((item) => (
                <li key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        item.ready
                          ? "bg-white/25 font-semibold text-gray-800"
                          : "bg-white/20 text-gray-500"
                      }`}
                    >
                      {item.ready ? "✓" : "•"}
                    </div>

                    <span
                      className={
                        item.ready
                          ? "font-medium text-gray-900"
                          : "text-gray-700"
                      }
                    >
                      {item.name}
                    </span>
                  </div>

                  {item.ready ? (
                    <span className="text-xs font-medium text-gray-600">
                      Работает
                    </span>
                  ) : (
                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium text-gray-600">
                      скоро
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link
              href="/counter/"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d1d1f] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-black"
            >
              Перейти к инструментам <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .vortex-wrap {
          position: absolute;
          top: -56px;
          left: 0;
          right: 0;
          bottom: -80px;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .vortex-bg {
          position: absolute;
          inset: -25%;
          background: #fff;
          overflow: hidden;
          filter: contrast(108%);
        }

        .vortex {
          position: absolute;
          border-radius: 42% 58% 65% 35% / 55% 35% 65% 45%;
          filter: blur(65px);
          mix-blend-mode: multiply;
          will-change: transform;
        }

        .v1 {
          width: 75%;
          height: 65%;
          left: -5%;
          top: 5%;
          background: rgba(0, 0, 0, 0.17);
          animation: spin1 7s ease-in-out infinite alternate;
        }

        .v2 {
          width: 70%;
          height: 70%;
          right: -5%;
          top: 0;
          background: rgba(35, 35, 35, 0.14);
          animation: spin2 8s ease-in-out infinite alternate;
        }

        .v3 {
          width: 70%;
          height: 65%;
          left: 20%;
          bottom: -5%;
          background: rgba(80, 80, 80, 0.15);
          animation: spin3 6s ease-in-out infinite alternate;
        }

        .v4 {
          width: 55%;
          height: 75%;
          left: 28%;
          top: 10%;
          background: rgba(0, 0, 0, 0.11);
          animation: spin4 5s ease-in-out infinite alternate;
        }

        .v5 {
          width: 45%;
          height: 55%;
          left: 30%;
          top: 25%;
          background: rgba(255, 255, 255, 0.9);
          mix-blend-mode: screen;
          animation: spin5 5.5s ease-in-out infinite alternate;
        }

        .blue {
          width: 55%;
          height: 45%;
          left: 25%;
          top: 30%;
          background: rgba(37, 99, 235, 0.12);
          filter: blur(80px);
          animation: blueSpin 6.5s ease-in-out infinite alternate;
        }

        @keyframes spin1 {
          from {
            transform: translate(-15%, -10%) rotate(-35deg) scale(0.8, 1.2);
          }
          to {
            transform: translate(55%, 30%) rotate(140deg) scale(1.35, 0.7);
          }
        }

        @keyframes spin2 {
          from {
            transform: translate(25%, -20%) rotate(40deg) scale(1.3, 0.75);
          }
          to {
            transform: translate(-55%, 35%) rotate(-150deg) scale(0.7, 1.4);
          }
        }

        @keyframes spin3 {
          from {
            transform: translate(-35%, 35%) rotate(-60deg) scale(0.7, 1.3);
          }
          to {
            transform: translate(40%, -45%) rotate(170deg) scale(1.45, 0.65);
          }
        }

        @keyframes spin4 {
          from {
            transform: translate(40%, 30%) rotate(0deg) scale(0.65, 1.45);
          }
          to {
            transform: translate(-45%, -35%) rotate(220deg) scale(1.5, 0.6);
          }
        }

        @keyframes spin5 {
          from {
            transform: translate(-45%, -30%) rotate(-40deg) scale(0.7);
          }
          to {
            transform: translate(55%, 40%) rotate(180deg) scale(1.6);
          }
        }

        @keyframes blueSpin {
          from {
            transform: translate(-45%, 30%) rotate(-70deg) scale(0.65, 1.3);
          }
          to {
            transform: translate(55%, -35%) rotate(190deg) scale(1.4, 0.7);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vortex {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}