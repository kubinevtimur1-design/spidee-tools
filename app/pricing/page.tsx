import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Тарифы — Spidee",
  description:
    "Прозрачные условия Spidee: пока что бесплатно для всех пользователей. Полный доступ к инструментам без скрытых списаний.",
  keywords: ["тарифы spidee", "бесплатные seo инструменты", "сервис для маркетолога"],
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Spidee — Пока что бесплатно",
    "description": "Тариф с полным доступом ко всем инструментам Spidee на этапе развития сервиса",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock",
    },
  };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />

      {/* Заголовочный блок */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
          Простые и честные условия
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto">
          Никаких подписок, привязок карт и скрытых списаний. Работайте эффективно прямо сейчас.
        </p>
      </div>

      {/* Карточка тарифа в чистом стиле Apple */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200/90 p-8 space-y-8">
        {/* Шапка карточки */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Тарифный план
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Активен
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1d1d1f]">Пока что бесплатно</h2>
            <p className="text-xs text-gray-500 mt-1">
              Все текущие и разрабатываемые утилиты в одном пакете
            </p>
          </div>

          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-[#1d1d1f]">0 ₽</span>
            <span className="text-xs text-gray-400 font-normal">/ навсегда</span>
          </div>
        </div>

        {/* Список возможностей */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Что входит в тариф
          </span>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  ✓
                </div>
                <span className="text-gray-900 font-medium">Подсчет символов</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Работает</span>
            </li>

            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">
                  •
                </div>
                <span className="text-gray-700">Генератор UTM</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium">
                скоро
              </span>
            </li>

            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">
                  •
                </div>
                <span className="text-gray-700">Выгрузка meta</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium">
                скоро
              </span>
            </li>

            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">
                  •
                </div>
                <span className="text-gray-700">Личный кабинет для комфортной работы</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium">
                скоро
              </span>
            </li>
          </ul>
        </div>

        {/* Кнопка действия */}
        <div className="pt-2">
          <Link
            href="/counter"
            className="w-full py-3 px-4 rounded-2xl bg-[#1d1d1f] hover:bg-black text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            Перейти к инструментам
            <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}