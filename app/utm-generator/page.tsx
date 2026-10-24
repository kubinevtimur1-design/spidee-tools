
"use client";

import { useMemo, useState } from "react";

type UtmKey =
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_content"
  | "utm_term";

type CustomParam = {
  id: number;
  key: string;
  value: string;
};

const FIELDS: {
  key: UtmKey;
  label: string;
  description: string;
  placeholder: string;
  suggestions: string[];
}[] = [
  {
    key: "utm_source",
    label: "Источник трафика",
    description: "Площадка, с которой приходит пользователь",
    placeholder: "yandex, vk, telegram",
    suggestions: ["yandex", "vk", "telegram", "google"],
  },
  {
    key: "utm_medium",
    label: "Тип трафика",
    description: "Канал привлечения",
    placeholder: "cpc, cpm, social, email",
    suggestions: ["cpc", "cpm", "social", "email", "organic"],
  },
  {
    key: "utm_campaign",
    label: "Название кампании",
    description: "Название или динамический ID кампании",
    placeholder: "summer_sale или {campaign_id}",
    suggestions: ["{campaign_id}", "{campaign_name}"],
  },
  {
    key: "utm_content",
    label: "Объявление",
    description: "Креатив, объявление или его идентификатор",
    placeholder: "banner_1 или {ad_id}",
    suggestions: ["{ad_id}", "{ad_name}", "{creative_id}"],
  },
  {
    key: "utm_term",
    label: "Ключевое слово",
    description: "Поисковый запрос или таргетинг",
    placeholder: "купить товар или {keyword}",
    suggestions: ["{keyword}", "{phrase_id}"],
  },
];

const PLATFORMS = [
  {
    id: "yandex",
    label: "Яндекс Директ",
    source: "yandex",
    medium: "cpc",
    params: [
      { label: "ID кампании", value: "{campaign_id}" },
      { label: "ID объявления", value: "{ad_id}" },
      { label: "ID группы", value: "{gbid}" },
      { label: "Ключевая фраза", value: "{keyword}" },
      { label: "ID фразы", value: "{phrase_id}" },
      { label: "Тип устройства", value: "{device_type}" },
      { label: "Регион", value: "{region_id}" },
      { label: "Позиция", value: "{position}" },
      { label: "Тип площадки", value: "{position_type}" },
      { label: "Условие показа", value: "{match_type}" },
      { label: "ID креатива", value: "{creative_id}" },
    ],
  },
  {
    id: "vk",
    label: "VK Реклама",
    source: "vk",
    medium: "cpc",
    params: [
      { label: "ID кампании", value: "{campaign_id}" },
      { label: "Название кампании", value: "{campaign_name}" },
      { label: "ID группы", value: "{adset_id}" },
      { label: "Название группы", value: "{adset_name}" },
      { label: "ID объявления", value: "{ad_id}" },
      { label: "Название объявления", value: "{ad_name}" },
      { label: "Площадка", value: "{placement}" },
    ],
  },
  {
    id: "mytarget",
    label: "myTarget",
    source: "mytarget",
    medium: "cpc",
    params: [
      { label: "ID кампании", value: "{campaign_id}" },
      { label: "ID объявления", value: "{banner_id}" },
      { label: "ID площадки", value: "{source}" },
    ],
  },
  {
    id: "google",
    label: "Google Ads",
    source: "google",
    medium: "cpc",
    params: [
      { label: "ID кампании", value: "{campaignid}" },
      { label: "ID объявления", value: "{creative}" },
      { label: "Ключевое слово", value: "{keyword}" },
      { label: "Устройство", value: "{device}" },
      { label: "Сеть", value: "{network}" },
    ],
  },
  {
    id: "manual",
    label: "Свои значения",
    source: "",
    medium: "",
    params: [],
  },
];

const INITIAL_UTM: Record<UtmKey, string> = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
};

function encodeValue(value: string) {
  return encodeURIComponent(value)
    .replace(/%7B/gi, "{")
    .replace(/%7D/gi, "}");
}

export default function UtmGeneratorPage() {
  const [url, setUrl] = useState("");
  const [utm, setUtm] = useState(INITIAL_UTM);
  const [platformId, setPlatformId] = useState("yandex");
  const [customParams, setCustomParams] = useState<CustomParam[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const platform = PLATFORMS.find((item) => item.id === platformId)!;

  const updateUtm = (key: UtmKey, value: string) => {
    setUtm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const selectPlatform = (id: string) => {
    const selected = PLATFORMS.find((item) => item.id === id);
    if (!selected) return;

    setPlatformId(id);

    if (id !== "manual") {
      setUtm((current) => ({
        ...current,
        utm_source: selected.source,
        utm_medium: selected.medium,
      }));
    }

    setCopied(false);
  };

  const insertDynamic = (key: UtmKey, value: string) => {
    setUtm((current) => ({
      ...current,
      [key]: current[key] ? `${current[key]}${value}` : value,
    }));
    setCopied(false);
  };

  const addCustomParam = () => {
    setCustomParams((current) => [
      ...current,
      { id: Date.now(), key: "", value: "" },
    ]);
    setCopied(false);
  };

  const updateCustomParam = (
    id: number,
    field: "key" | "value",
    value: string
  ) => {
    setCustomParams((current) =>
      current.map((param) =>
        param.id === id ? { ...param, [field]: value } : param
      )
    );
    setCopied(false);
  };

  const removeCustomParam = (id: number) => {
    setCustomParams((current) =>
      current.filter((param) => param.id !== id)
    );
    setCopied(false);
  };

  const result = useMemo(() => {
    const base = url.trim();
    if (!base) return "";

    const params: [string, string][] = FIELDS
      .filter((field) => utm[field.key].trim())
      .map((field) => [field.key, utm[field.key].trim()]);

    customParams.forEach((param) => {
      const key = param.key.trim();
      const value = param.value.trim();

      if (key && value) {
        params.push([key, value]);
      }
    });

    if (!params.length) return base;

    const hashIndex = base.indexOf("#");
    const hash = hashIndex >= 0 ? base.slice(hashIndex) : "";
    const withoutHash = hashIndex >= 0 ? base.slice(0, hashIndex) : base;

    const separator = withoutHash.includes("?")
      ? withoutHash.endsWith("?") || withoutHash.endsWith("&")
        ? ""
        : "&"
      : "?";

    const query = params
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeValue(value)}`
      )
      .join("&");

    return `${withoutHash}${separator}${query}${hash}`;
  }, [url, utm, customParams]);

  const generate = () => {
    if (!url.trim()) {
      setError("Введи URL страницы, которую нужно разметить.");
      return;
    }

    try {
      const parsed = new URL(url.trim());

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("invalid protocol");
      }
    } catch {
      setError("Введи корректный URL, начиная с https:// или http://.");
      return;
    }

    setError("");
  };

  const copyResult = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Не удалось скопировать ссылку. Попробуй ещё раз.");
    }
  };

  const reset = () => {
    setUrl("");
    setUtm(INITIAL_UTM);
    setCustomParams([]);
    setPlatformId("yandex");
    setCopied(false);
    setError("");
  };

  return (
    <>
      <main className="min-h-[80vh] bg-transparent px-4 pb-40 pt-10 sm:px-6 sm:pb-36 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              Генератор UTM-меток
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Создавай размеченные ссылки для рекламных кампаний.
              Используй собственные значения и динамические параметры
              рекламных систем.
            </p>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-xl sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                  1
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Ссылка на сайт
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Вставь полный URL целевой страницы
                  </p>
                </div>
              </div>

              <label
                htmlFor="destination-url"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                URL страницы
              </label>

              <input
                id="destination-url"
                type="url"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError("");
                  setCopied(false);
                }}
                placeholder="https://example.ru/catalog"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />

              <p className="mt-2 text-xs leading-5 text-gray-400">
                Существующие параметры URL сохраняются. Результат
                обновляется автоматически по мере заполнения полей.
              </p>
            </section>

            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-xl sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                  2
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Рекламная система
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Выбери площадку для быстрого заполнения
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PLATFORMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectPlatform(item.id)}
                    className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                      platformId === item.id
                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                        : "border-gray-200 bg-white/70 text-gray-700 hover:border-gray-400 hover:bg-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {platform.params.length > 0 && (
                <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <p className="mb-3 text-xs font-medium text-gray-600">
                    Динамические параметры · нажми, чтобы добавить
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {platform.params.map((param) => (
                      <button
                        key={param.value}
                        type="button"
                        title={`Добавить ${param.value}`}
                        onClick={() => {
                          const label = param.label.toLowerCase();

                          const target: UtmKey =
                            label.includes("ключ") ||
                            label.includes("фраз")
                              ? "utm_term"
                              : label.includes("креатив") ||
                                  label.includes("объяв")
                                ? "utm_content"
                                : "utm_campaign";

                          insertDynamic(target, param.value);
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 transition hover:border-gray-400 hover:text-black"
                      >
                        <span className="font-mono">{param.value}</span>
                        <span className="ml-1.5 text-gray-400">+</span>
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-400">
                    Синтаксис макросов зависит от рекламной системы и типа
                    кампании. Перед запуском проверь их поддержку в справке
                    выбранной площадки.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-xl sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                  3
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    UTM-параметры
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Заполни нужные поля — остальные можно оставить пустыми
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {FIELDS.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="mb-1.5 block text-sm font-medium text-gray-800"
                    >
                      {field.label}
                      <code className="ml-2 text-xs font-normal text-gray-400">
                        {field.key}
                      </code>
                    </label>

                    <input
                      id={field.key}
                      type="text"
                      value={utm[field.key]}
                      onChange={(event) =>
                        updateUtm(field.key, event.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                      {field.description}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {field.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => updateUtm(field.key, suggestion)}
                          className="rounded-md bg-gray-100/80 px-2 py-1 font-mono text-[11px] text-gray-600 transition hover:bg-gray-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-xl sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                    4
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Дополнительные параметры
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Произвольные ключи и значения
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addCustomParam}
                  className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  + Добавить
                </button>
              </div>

              {customParams.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                  Например, click_id, partner_id или свой макрос
                </p>
              ) : (
                <div className="space-y-3">
                  {customParams.map((param) => (
                    <div
                      key={param.id}
                      className="flex items-start gap-2"
                    >
                      <input
                        type="text"
                        aria-label="Название параметра"
                        value={param.key}
                        onChange={(event) =>
                          updateCustomParam(
                            param.id,
                            "key",
                            event.target.value
                          )
                        }
                        placeholder="Параметр"
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                      />

                      <span className="pt-2.5 text-gray-400">=</span>

                      <input
                        type="text"
                        aria-label="Значение параметра"
                        value={param.value}
                        onChange={(event) =>
                          updateCustomParam(
                            param.id,
                            "value",
                            event.target.value
                          )
                        }
                        placeholder="Значение или макрос"
                        className="min-w-0 flex-[1.5] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                      />

                      <button
                        type="button"
                        onClick={() => removeCustomParam(param.id)}
                        aria-label="Удалить параметр"
                        className="rounded-lg px-2.5 py-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={generate}
                className="flex-1 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.99]"
              >
                Проверить URL
              </button>

              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-gray-200 bg-white/70 px-5 py-3.5 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-gray-900"
              >
                Сбросить
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </main>

      {url.trim() && (
        <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-5">
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200/80 bg-white/95 p-3 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-gray-700">
                    Твоя UTM-ссылка
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Обновляется автоматически
                  </span>
                </div>

                <div
                  title={result}
                  className="max-h-14 overflow-y-auto break-all font-mono text-[11px] leading-5 text-gray-600 sm:max-h-16 sm:text-xs"
                >
                  {result || "Добавь UTM-параметры в полях выше"}
                </div>
              </div>

              <button
                type="button"
                onClick={copyResult}
                disabled={!result}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-3 text-xs font-medium text-white transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:px-5 sm:text-sm"
              >
                {copied ? (
                  <>
                    <span>✓</span>
                    <span>Скопировано</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="11"
                        height="11"
                        rx="2"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"
                        strokeWidth="1.8"
                      />
                    </svg>
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
