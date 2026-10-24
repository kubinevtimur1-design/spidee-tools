```tsx
"use client";

import { useMemo, useState } from "react";

type UtmKey =
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_content"
  | "utm_term";

type Platform = {
  id: string;
  name: string;
  source: string;
  medium: string;
  params: { label: string; value: string }[];
};

const platforms: Platform[] = [
  {
    id: "manual",
    name: "Свои значения",
    source: "",
    medium: "",
    params: [],
  },
  {
    id: "yandex",
    name: "Яндекс Директ",
    source: "yandex",
    medium: "cpc",
    params: [
      { label: "ID кампании", value: "{campaign_id}" },
      { label: "Название кампании", value: "{campaign_name}" },
      { label: "ID объявления", value: "{ad_id}" },
      { label: "Ключевая фраза", value: "{keyword}" },
      { label: "Площадка", value: "{source}" },
      { label: "Тип площадки", value: "{source_type}" },
      { label: "Тип устройства", value: "{device_type}" },
      { label: "Позиция объявления", value: "{position}" },
      { label: "Тип позиции", value: "{position_type}" },
      { label: "ID региона", value: "{region_id}" },
    ],
  },
  {
    id: "vk",
    name: "VK Реклама",
    source: "vk",
    medium: "cpc",
    params: [
      { label: "ID кампании", value: "{{campaign_id}}" },
      { label: "Название кампании", value: "{{campaign_name}}" },
      { label: "ID объявления", value: "{{ad_id}}" },
      { label: "ID баннера", value: "{{banner_id}}" },
    ],
  },
  {
    id: "telegram",
    name: "Telegram Ads",
    source: "telegram",
    medium: "cpc",
    params: [],
  },
  {
    id: "google",
    name: "Google Ads",
    source: "google",
    medium: "cpc",
    params: [
      { label: "ID кампании", value: "{campaignid}" },
      { label: "ID группы", value: "{adgroupid}" },
      { label: "ID объявления", value: "{creative}" },
      { label: "Ключевое слово", value: "{keyword}" },
      { label: "Устройство", value: "{device}" },
      { label: "Площадка", value: "{placement}" },
      { label: "Тип сети", value: "{network}" },
      { label: "Тип соответствия", value: "{matchtype}" },
    ],
  },
];

const fields: { key: UtmKey; label: string; hint: string }[] = [
  {
    key: "utm_source",
    label: "utm_source",
    hint: "Источник трафика",
  },
  {
    key: "utm_medium",
    label: "utm_medium",
    hint: "Тип трафика",
  },
  {
    key: "utm_campaign",
    label: "utm_campaign",
    hint: "Кампания",
  },
  {
    key: "utm_content",
    label: "utm_content",
    hint: "Объявление / креатив",
  },
  {
    key: "utm_term",
    label: "utm_term",
    hint: "Ключевая фраза",
  },
];

export default function UtmPage() {
  const [url, setUrl] = useState("");
  const [platformId, setPlatformId] = useState("manual");

  const [utm, setUtm] = useState<Record<UtmKey, string>>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  });

  const [customParams, setCustomParams] = useState<
    { id: number; key: string; value: string }[]
  >([]);

  const [openParam, setOpenParam] = useState<UtmKey | null>(null);
  const [copied, setCopied] = useState(false);

  const platform =
    platforms.find((item) => item.id === platformId) ?? platforms[0];

  function selectPlatform(id: string) {
    const selected = platforms.find((item) => item.id === id);
    if (!selected) return;

    setPlatformId(id);
    setOpenParam(null);

    if (id !== "manual") {
      setUtm((current) => ({
        ...current,
        utm_source: selected.source,
        utm_medium: selected.medium,
      }));
    }
  }

  function updateUtm(key: UtmKey, value: string) {
    setUtm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function insertDynamic(key: UtmKey, value: string) {
    setUtm((current) => ({
      ...current,
      [key]: current[key] ? `${current[key]}${value}` : value,
    }));

    setOpenParam(null);
  }

  function addCustomParam() {
    setCustomParams((current) => [
      ...current,
      {
        id: Date.now(),
        key: "",
        value: "",
      },
    ]);
  }

  function updateCustomParam(
    id: number,
    field: "key" | "value",
    value: string,
  ) {
    setCustomParams((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeCustomParam(id: number) {
    setCustomParams((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  const queryString = useMemo(() => {
    const params: string[] = [];

    Object.entries(utm).forEach(([key, value]) => {
      if (value.trim()) {
        params.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(value.trim())}`,
        );
      }
    });

    customParams.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        params.push(
          `${encodeURIComponent(item.key.trim())}=${encodeURIComponent(
            item.value.trim(),
          )}`,
        );
      }
    });

    return params.join("&");
  }, [utm, customParams]);

  const finalUrl = useMemo(() => {
    const cleanUrl = url.trim();

    if (!cleanUrl) return "";
    if (!queryString) return cleanUrl;

    return `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}${queryString}`;
  }, [url, queryString]);

  async function copyText(text: string) {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div className="mb-3 text-4xl">🔗</div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Генератор UTM-меток
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Создавайте UTM-ссылки вручную или используйте динамические
            параметры рекламных систем.
          </p>
        </div>

        <div className="overflow-visible rounded-[28px] border border-gray-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Ссылка на страницу
            </label>

            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.ru/page"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3.5 text-sm text-gray-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-7">
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Рекламная система
            </label>

            <div className="flex flex-wrap gap-2">
              {platforms.map((item) => {
                const active = platformId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectPlatform(item.id)}
                    className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition sm:text-sm ${
                      active
                        ? "bg-gray-950 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-8 h-px bg-gray-100" />

          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.key}>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      {field.label}
                    </label>

                    <span className="text-xs text-gray-400">
                      {field.hint}
                    </span>
                  </div>

                  {platform.params.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenParam(
                            openParam === field.key ? null : field.key,
                          )
                        }
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        + Динамический параметр
                      </button>

                      {openParam === field.key && (
                        <div className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                          {platform.params.map((param) => (
                            <button
                              key={`${field.key}-${param.value}`}
                              type="button"
                              onClick={() =>
                                insertDynamic(field.key, param.value)
                              }
                              className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition hover:bg-gray-50"
                            >
                              <span className="text-xs font-medium text-gray-700">
                                {param.label}
                              </span>

                              <span className="shrink-0 font-mono text-[11px] text-blue-600">
                                {param.value}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={utm[field.key]}
                  onChange={(event) =>
                    updateUtm(field.key, event.target.value)
                  }
                  placeholder={
                    field.key === "utm_source"
                      ? "yandex"
                      : field.key === "utm_medium"
                        ? "cpc"
                        : field.key === "utm_campaign"
                          ? "brand_search"
                          : ""
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3.5 font-mono text-sm text-gray-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            ))}
          </div>

          {customParams.length > 0 && (
            <>
              <div className="my-8 h-px bg-gray-100" />

              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Дополнительные параметры
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Добавьте любые параметры, которые нужны для вашей ссылки.
                  </p>
                </div>

                {customParams.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_1fr_auto] gap-2"
                  >
                    <input
                      type="text"
                      value={item.key}
                      onChange={(event) =>
                        updateCustomParam(
                          item.id,
                          "key",
                          event.target.value,
                        )
                      }
                      placeholder="Параметр"
                      className="min-w-0 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    />

                    <input
                      type="text"
                      value={item.value}
                      onChange={(event) =>
                        updateCustomParam(
                          item.id,
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder="Значение"
                      className="min-w-0 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => removeCustomParam(item.id)}
                      className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-gray-200 text-lg text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      aria-label="Удалить параметр"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={addCustomParam}
            className="mt-6 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
          >
            + Добавить свой параметр
          </button>

          <div className="mt-8 rounded-[22px] bg-gray-950 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                Готовая ссылка
              </span>

              <button
                type="button"
                disabled={!finalUrl}
                onClick={() => copyText(finalUrl)}
                className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-950 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {copied ? "Скопировано ✓" : "Скопировать"}
              </button>
            </div>

            <div className="mt-4 min-h-[52px] break-all font-mono text-sm leading-6 text-gray-200">
              {finalUrl || (
                <span className="font-sans text-gray-600">
                  Здесь появится готовая ссылка
                </span>
              )}
            </div>

            {queryString && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-500">
                    Только параметры
                  </span>

                  <button
                    type="button"
                    onClick={() => copyText(queryString)}
                    className="text-xs font-semibold text-gray-400 transition hover:text-white"
                  >
                    Копировать
                  </button>
                </div>

                <div className="break-all font-mono text-xs leading-5 text-gray-500">
                  {queryString}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-gray-400">
          Динамические параметры заменяются рекламной системой на реальные
          значения в момент перехода пользователя по объявлению.
        </p>
      </div>
    </main>
  );
}