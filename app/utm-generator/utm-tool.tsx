"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { copyPngToClipboard } from "./copy-png";
import { buildQrAsset, type QrAsset } from "./qr";
import {
  EMPTY_UTM,
  buildUtmUrl,
  isHttpUrl,
  shouldShowQr,
  type UtmKey,
  type UtmValues,
} from "./utm";

type CustomParam = {
  id: number;
  key: string;
  value: string;
};

type Field = {
  key: UtmKey;
  shortLabel: string;
  placeholder: string;
  suggestions: string[];
  help: string;
};

const FIELDS: Field[] = [
  {
    key: "utm_source",
    shortLabel: "Источник",
    placeholder: "spidytools",
    suggestions: ["spidytools", "vk", "telegram", "google"],
    help:
      "Источник трафика — откуда пришёл пользователь. Указывай конкретный источник и используй одинаковое написание во всех кампаниях.",
  },
  {
    key: "utm_medium",
    shortLabel: "Канал",
    placeholder: "cpc, cpm, social, email",
    suggestions: ["cpc", "cpm", "social", "email", "organic"],
    help:
      "Тип или канал трафика. Например: cpc для рекламы с оплатой за клик, cpm — за показы, email — для рассылок, social — для социальных сетей.",
  },
  {
    key: "utm_campaign",
    shortLabel: "Кампания",
    placeholder: "spidy_tools или {campaign_id}",
    suggestions: ["{campaign_id}", "{campaign_name}"],
    help:
      "Название или ID рекламной кампании. Лучше использовать понятную единую систему названий, например spidy_tools_launch или динамический ID кампании.",
  },
  {
    key: "utm_content",
    shortLabel: "Объявление",
    placeholder: "utm_generator или {ad_id}",
    suggestions: ["{ad_id}", "{ad_name}", "{creative_id}"],
    help:
      "Помогает различать объявления, ссылки и креативы внутри одной кампании. Например utm_generator, banner_red, video_1 или динамический ID объявления.",
  },
  {
    key: "utm_term",
    shortLabel: "Ключевое слово",
    placeholder: "utm_metki или {keyword}",
    suggestions: ["{keyword}", "{phrase_id}"],
    help:
      "Ключевое слово, поисковая фраза или другой параметр таргетинга. Особенно полезен для поисковой рекламы.",
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

function triggerDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = href;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(href), 1500);
}

async function downloadPng(dataUrl: string) {
  const response = await fetch(dataUrl);
  triggerDownload(await response.blob(), "utm-qr.png");
}

function downloadSvg(svg: string) {
  triggerDownload(
    new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    }),
    "utm-qr.svg",
  );
}

export default function UtmTool() {
  const [url, setUrl] = useState("");
  const [utm, setUtm] = useState<UtmValues>(EMPTY_UTM);
  const [platformId, setPlatformId] = useState("yandex");
  const [customParams, setCustomParams] = useState<CustomParam[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [confettiBurst, setConfettiBurst] = useState(0);

  const [qr, setQr] = useState<{
    url: string;
    asset: QrAsset | null;
  } | null>(null);

  const [pngCopiedUrl, setPngCopiedUrl] = useState<string | null>(null);

  const [pngHint, setPngHint] = useState<{
    url: string;
    text: string;
    tone: "muted" | "error";
  } | null>(null);

  const pngCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const platform = PLATFORMS.find((item) => item.id === platformId)!;

  const launchConfetti = () => {
    setConfettiBurst((current) => current + 1);
  };

  const updateUtm = (key: UtmKey, value: string) => {
    setUtm((current) => ({
      ...current,
      [key]: value,
    }));

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
      {
        id: Date.now(),
        key: "",
        value: "",
      },
    ]);

    setCopied(false);
  };

  const updateCustomParam = (
    id: number,
    field: "key" | "value",
    value: string,
  ) => {
    setCustomParams((current) =>
      current.map((param) =>
        param.id === id
          ? {
              ...param,
              [field]: value,
            }
          : param,
      ),
    );

    setCopied(false);
  };

  const removeCustomParam = (id: number) => {
    setCustomParams((current) =>
      current.filter((param) => param.id !== id),
    );

    setCopied(false);
  };

  const result = useMemo(
    () => buildUtmUrl(url, utm, customParams),
    [url, utm, customParams],
  );

  const qrReady = shouldShowQr(result);

  let qrAsset: QrAsset | null = null;
  let qrFailed = false;
  let qrPending = false;
  let qrFresh = false;

  if (qrReady && qr?.url === result) {
    qrAsset = qr.asset;
    qrFailed = qr.asset === null;
    qrFresh = qr.asset !== null;
  } else if (qrReady && qr?.asset) {
    qrAsset = qr.asset;
  } else if (qrReady) {
    qrPending = true;
  }

  useEffect(() => {
    if (!qrReady) return;

    let cancelled = false;
    const target = result;

    buildQrAsset(target).then((asset) => {
      if (cancelled) return;

      setQr({
        url: target,
        asset,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [qrReady, result]);

  useEffect(() => {
    return () => {
      if (pngCopyTimer.current) {
        clearTimeout(pngCopyTimer.current);
      }
    };
  }, []);

  const generate = () => {
    if (!url.trim()) {
      setError("Введи URL страницы, которую нужно разметить.");
      return;
    }

    if (!isHttpUrl(url)) {
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

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Не удалось скопировать ссылку. Попробуй ещё раз.");
    }
  };

  const copyQrPng = async () => {
    if (!qrFresh || !qrAsset) return;

    const copiedUrl = result;

    const outcome = await copyPngToClipboard(qrAsset.pngDataUrl, {
      download: () => downloadPng(qrAsset.pngDataUrl),
    });

    if (pngCopyTimer.current) {
      clearTimeout(pngCopyTimer.current);
      pngCopyTimer.current = null;
    }

    if (outcome.status === "copied") {
      setPngHint(null);
      setPngCopiedUrl(copiedUrl);

      pngCopyTimer.current = setTimeout(() => {
        setPngCopiedUrl(null);
      }, 2000);

      return;
    }

    setPngCopiedUrl(null);

    setPngHint({
      url: copiedUrl,
      text: outcome.hint,
      tone: outcome.status === "failed" ? "error" : "muted",
    });
  };

  const reset = () => {
    setUrl("");
    setUtm(EMPTY_UTM);
    setCustomParams([]);
    setPlatformId("yandex");
    setCopied(false);
    setError("");
    setQr(null);
    setPngCopiedUrl(null);
    setPngHint(null);

    if (pngCopyTimer.current) {
      clearTimeout(pngCopyTimer.current);
      pngCopyTimer.current = null;
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#F7F5F2] text-[#242424]">
        <section className="relative overflow-hidden border-b border-black/[0.08]">
          <UtmHeroPattern />

          <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pb-24">
            <nav
              aria-label="Хлебные крошки"
              className="mb-8 flex items-center gap-2 text-xs font-medium text-[#999999]"
            >
              <Link
                href="/"
                className="transition-colors hover:text-[#0B0B0B]"
              >
                Главная
              </Link>

              <span>/</span>
              <span>Инструменты</span>
              <span>/</span>

              <span className="text-[#555555]">
                Генератор UTM
              </span>
            </nav>

            <h1 className="relative z-10 max-w-5xl text-[44px] font-bold leading-[0.9] tracking-[-0.055em] text-[#242424] sm:text-6xl lg:text-[72px]">
              Генератор
              <br />
              UTM-меток
              <button
                type="button"
                onClick={launchConfetti}
                aria-label="Запустить конфетти"
                className="inline border-0 bg-transparent p-0 font-inherit text-[#FF3830] outline-none"
              >
                .
              </button>
            </h1>

            <DotConfetti burst={confettiBurst} />

            <h2 className="relative z-10 mt-7 max-w-2xl text-base font-normal leading-6 text-[#777777] sm:text-lg">
              Собирай UTM-ссылки с динамическими параметрами рекламных
              площадок и создавай QR-коды.
            </h2>

            <Link
              href="/qr/"
              className="relative z-10 mt-4 inline-block text-xs font-medium text-[#999999] transition-colors hover:text-[#0B0B0B]"
            >
              Нужен просто QR? →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-96 pt-10 sm:px-6 sm:pb-72 sm:pt-12">
          <div className="space-y-5">
            <div className="rounded-[18px] border border-black/[0.08] p-5 sm:p-6">
              <label
                htmlFor="destination-url"
                className="mb-3 block text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
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
                className="h-12 w-full rounded-xl border border-black/[0.1] bg-transparent px-4 text-sm text-[#242424] outline-none transition-all placeholder:text-[#AAAAAA] focus:border-black/[0.3] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.025)]"
              />
            </div>

            <div className="rounded-[18px] border border-black/[0.08] p-5 sm:p-6">
              <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                <div
                  className="flex w-max gap-2"
                  role="tablist"
                  aria-label="Рекламная система"
                >
                  {PLATFORMS.map((item) => {
                    const active = platformId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => selectPlatform(item.id)}
                        className={[
                          "h-10 whitespace-nowrap rounded-xl px-5 text-xs font-medium",
                          "transition-all duration-200 active:scale-[0.97]",
                          active
                            ? "bg-[#0B0B0B] text-white"
                            : "border border-black/[0.08] text-[#555555] hover:border-black/[0.18] hover:text-[#0B0B0B]",
                        ].join(" ")}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {platform.params.length > 0 && (
                <div className="mt-5 border-t border-black/[0.06] pt-5">
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
                        className="group rounded-lg border border-black/[0.08] px-3 py-2 text-xs transition-all hover:border-black/[0.18] hover:bg-[#D7FF00]/60"
                      >
                        <span className="font-mono text-[#444444] group-hover:text-[#0B0B0B]">
                          {param.value}
                        </span>

                        <span className="ml-2 text-[#AAAAAA] group-hover:text-[#0B0B0B]">
                          +
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-visible rounded-[18px] border border-black/[0.08]">
              {FIELDS.map((field, index) => (
                <div
                  key={field.key}
                  className={[
                    "relative p-5 sm:p-6",
                    index !== FIELDS.length - 1
                      ? "border-b border-black/[0.06]"
                      : "",
                  ].join(" ")}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <label
                      htmlFor={field.key}
                      className="text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]"
                    >
                      {field.key}
                    </label>

                    <span className="text-sm text-[#0B0B0B]/40">
                      · {field.shortLabel}
                    </span>

                    <div className="group/help relative">
                      <span
                        tabIndex={0}
                        aria-label={`Что такое ${field.key}`}
                        className="flex h-[18px] w-[18px] cursor-help items-center justify-center rounded-full border border-black/[0.16] text-[10px] font-bold leading-none text-black/40 outline-none transition-all group-hover/help:border-black/30 group-hover/help:bg-[#D7FF00] group-hover/help:text-[#0B0B0B] focus:border-black/30 focus:bg-[#D7FF00] focus:text-[#0B0B0B]"
                      >
                        ?
                      </span>

                      <div
                        role="tooltip"
                        className="pointer-events-none absolute left-0 top-7 z-30 w-[min(320px,calc(100vw-64px))] translate-y-1 rounded-[14px] border border-black/[0.1] bg-[#0B0B0B] p-4 text-xs font-normal leading-5 text-white opacity-0 shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-150 group-hover/help:translate-y-0 group-hover/help:opacity-100 group-focus-within/help:translate-y-0 group-focus-within/help:opacity-100"
                      >
                        <div className="mb-1.5 font-bold">
                          {field.key}
                        </div>

                        <p className="text-white/70">
                          {field.help}
                        </p>
                      </div>
                    </div>
                  </div>

                  <input
                    id={field.key}
                    type="text"
                    value={utm[field.key]}
                    onChange={(event) =>
                      updateUtm(field.key, event.target.value)
                    }
                    placeholder={field.placeholder}
                    className="h-11 w-full rounded-xl border border-black/[0.1] bg-transparent px-4 text-sm text-[#242424] outline-none transition-all placeholder:text-[#AAAAAA] focus:border-black/[0.3]"
                  />

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {field.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          updateUtm(field.key, suggestion)
                        }
                        className="rounded-lg bg-black/[0.035] px-2.5 py-1.5 font-mono text-[11px] text-[#666666] transition-all hover:bg-[#D7FF00]/70 hover:text-[#0B0B0B]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[18px] border border-black/[0.08] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-bold tracking-[-0.02em] text-[#0B0B0B]">
                  Дополнительные параметры
                </h2>

                <button
                  type="button"
                  onClick={addCustomParam}
                  className="shrink-0 rounded-xl border border-black/[0.1] px-4 py-2.5 text-xs font-medium text-[#444444] transition-all hover:border-black/[0.2] hover:bg-[#0B0B0B] hover:text-white active:scale-[0.97]"
                >
                  + Добавить
                </button>
              </div>

              {customParams.length > 0 && (
                <div className="mt-5 space-y-3">
                  {customParams.map((param) => (
                    <div
                      key={param.id}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <input
                        type="text"
                        aria-label="Название параметра"
                        value={param.key}
                        onChange={(event) =>
                          updateCustomParam(
                            param.id,
                            "key",
                            event.target.value,
                          )
                        }
                        placeholder="Параметр"
                        className="min-w-0 flex-1 rounded-xl border border-black/[0.1] bg-transparent px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-[#AAAAAA] focus:border-black/[0.3]"
                      />

                      <span className="hidden text-[#AAAAAA] sm:block">
                        =
                      </span>

                      <input
                        type="text"
                        aria-label="Значение параметра"
                        value={param.value}
                        onChange={(event) =>
                          updateCustomParam(
                            param.id,
                            "value",
                            event.target.value,
                          )
                        }
                        placeholder="Значение или макрос"
                        className="min-w-0 flex-[1.5] rounded-xl border border-black/[0.1] bg-transparent px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-[#AAAAAA] focus:border-black/[0.3]"
                      />

                      <button
                        type="button"
                        onClick={() => removeCustomParam(param.id)}
                        aria-label="Удалить параметр"
                        className="flex h-11 w-full shrink-0 items-center justify-center rounded-xl border border-black/[0.08] text-lg text-[#999999] transition-all hover:border-[#FF3830]/20 hover:bg-[#FF3830]/[0.06] hover:text-[#FF3830] sm:w-11"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={generate}
                className="flex-1 rounded-xl bg-[#0B0B0B] px-5 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)] active:translate-y-0 active:scale-[0.99]"
              >
                Проверить URL
              </button>

              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-black/[0.1] px-5 py-3.5 text-sm font-medium text-[#666666] transition-all hover:border-black/[0.2] hover:text-[#0B0B0B]"
              >
                Сбросить
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[#FF3830]/20 bg-[#FF3830]/[0.055] px-4 py-3 text-sm text-[#D52D27]"
              >
                {error}
              </p>
            )}
          </div>
        </section>
      </main>

      {url.trim() && (
        <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-5">
          <div className="mx-auto max-h-[min(26rem,calc(100dvh-7.5rem))] max-w-6xl overflow-y-auto rounded-[18px] border border-black/[0.1] bg-[#F7F5F2]/95 p-4 shadow-[0_-12px_45px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#D7FF00]" />

                  <span className="text-xs font-bold text-[#0B0B0B]">
                    UTM-ссылка
                  </span>
                </div>

                <div
                  title={result}
                  className="max-h-16 overflow-y-auto break-all font-mono text-[11px] leading-5 text-[#666666] sm:text-xs"
                >
                  {result}
                </div>
              </div>

              <button
                type="button"
                onClick={copyResult}
                disabled={!result}
                className="shrink-0 rounded-xl bg-[#0B0B0B] px-4 py-2.5 text-xs font-medium text-white transition-all hover:bg-[#242424] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-black/[0.08] disabled:text-[#AAAAAA] sm:text-sm"
              >
                {copied ? "✓ Скопировано" : "Копировать"}
              </button>
            </div>

            <div
              id="utm-qr"
              aria-labelledby="utm-qr-title"
              aria-busy={qrPending}
              className="mt-4 border-t border-black/[0.07] pt-4"
            >
              <div className="flex items-start gap-4">
                <QrMark
                  ready={qrReady}
                  asset={qrFailed ? null : qrAsset}
                  fresh={qrFresh}
                />

                <div className="min-w-0 flex-1">
                  <h2
                    id="utm-qr-title"
                    className="text-sm font-bold text-[#0B0B0B]"
                  >
                    QR-код
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#888888]">
                    {!qrReady &&
                      "Появится для корректной ссылки с http:// или https://."}

                    {qrFailed &&
                      "Не удалось собрать QR-код — ссылка слишком длинная."}

                    {qrFresh &&
                      "Можно скачать в PNG или SVG."}

                    {qrReady &&
                      !qrFailed &&
                      !qrFresh &&
                      "Собираю QR…"}
                  </p>

                  {qrFresh && qrAsset && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void copyQrPng()}
                        aria-describedby={
                          pngHint?.url === result
                            ? "utm-qr-copy-hint"
                            : undefined
                        }
                        className="min-h-10 rounded-xl border border-black/[0.1] px-3 text-xs font-medium text-[#444444] transition-all hover:border-black/[0.2] hover:text-[#0B0B0B]"
                      >
                        {pngCopiedUrl === result
                          ? "Скопировано"
                          : "Скопировать PNG"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void downloadPng(qrAsset.pngDataUrl)
                        }
                        className="min-h-10 rounded-xl bg-[#0B0B0B] px-3 text-xs font-medium text-white transition-all hover:bg-[#242424]"
                      >
                        Скачать PNG
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadSvg(qrAsset.svg)}
                        className="min-h-10 rounded-xl border border-black/[0.1] px-3 text-xs font-medium text-[#444444] transition-all hover:border-black/[0.2] hover:text-[#0B0B0B]"
                      >
                        Скачать SVG
                      </button>
                    </div>
                  )}

                  <span className="sr-only" aria-live="polite">
                    {pngCopiedUrl === result ? "Скопировано" : ""}
                  </span>

                  {pngHint?.url === result && (
                    <p
                      id="utm-qr-copy-hint"
                      role="status"
                      className={`mt-2 text-[11px] leading-4 ${
                        pngHint.tone === "error"
                          ? "text-[#D52D27]"
                          : "text-[#777777]"
                      }`}
                    >
                      {pngHint.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UtmHeroPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block"
    >
      <div className="absolute left-[45%] top-[-3%] whitespace-nowrap font-mono text-[22px] font-medium tracking-[-0.04em] text-black/[0.025] lg:text-[28px]">
        https://spidytools.ru/utm-generator/
      </div>

      <div className="absolute left-[56%] top-[19%] rotate-[-2deg] whitespace-nowrap font-mono text-[24px] font-semibold tracking-[-0.045em] text-black/[0.03] lg:text-[31px]">
        ?utm_source=spidytools
      </div>

      <div className="absolute left-[48%] top-[34%] rotate-[1deg] whitespace-nowrap font-mono text-[23px] font-semibold tracking-[-0.045em] text-black/[0.025] lg:text-[30px]">
        &amp;utm_medium=tools
      </div>

      <div className="absolute left-[61%] top-[50%] rotate-[-1.5deg] whitespace-nowrap font-mono text-[25px] font-semibold tracking-[-0.045em] text-black/[0.032] lg:text-[33px]">
        &amp;utm_campaign=utm_generator
      </div>

      <div className="absolute left-[45%] top-[67%] rotate-[1.5deg] whitespace-nowrap font-mono text-[22px] font-semibold tracking-[-0.045em] text-black/[0.025] lg:text-[29px]">
        &amp;utm_content=generator
      </div>

      <div className="absolute left-[67%] top-[81%] rotate-[-1deg] whitespace-nowrap font-mono text-[24px] font-semibold tracking-[-0.045em] text-black/[0.03] lg:text-[31px]">
        &amp;utm_term=utm_metki
      </div>
    </div>
  );
}

function QrMark({
  ready,
  asset,
  fresh,
}: {
  ready: boolean;
  asset: QrAsset | null;
  fresh: boolean;
}) {
  if (!ready || !asset) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.pngDataUrl}
      width={384}
      height={384}
      alt={
        fresh
          ? "QR-код сгенерированной ссылки"
          : "QR-код обновляется"
      }
      className="h-28 w-28 shrink-0 rounded-xl border border-black/[0.08] bg-white sm:h-32 sm:w-32"
    />
  );
}

function DotConfetti({ burst }: { burst: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (burst === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    let frameId = 0;
    let previousTime = performance.now();
    let elapsed = 0;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    type Dot = {
      x: number;
      y: number;

      radius: number;
      depth: number;

      vx: number;
      vy: number;
      gravity: number;

      delay: number;

      swayAmount: number;
      swaySpeed: number;
      swayPhase: number;

      opacity: number;
      blur: number;

      active: boolean;
    };

    /*
     * Чуть больше точек на широком экране,
     * но без превращения в сплошную стену.
     */
    const DOT_COUNT = Math.max(
      75,
      Math.min(135, Math.round(width / 10)),
    );

    /*
     * Разбиваем экран на равномерные зоны.
     * Это предотвращает большие случайные пустоты.
     */
    const zoneWidth = width / DOT_COUNT;

    const dots: Dot[] = Array.from(
      { length: DOT_COUNT },
      (_, index) => {
        /*
         * depth:
         * 0 = точка визуально дальше,
         * 1 = ближе к зрителю.
         */
        const depth = Math.pow(Math.random(), 0.8);

        /*
         * Размеры специально не слишком экстремальные.
         * Большинство точек среднего размера.
         */
        const radius =
          2.2 +
          depth * 5.8 +
          Math.random() * 1.8;

        /*
         * Основная масса появляется за первые ~1.3 сек,
         * но распределение не полностью равномерное.
         *
         * Math.pow(..., 1.6) даёт чуть более плотное
         * начало и редкий хвост.
         */
        const delay =
          Math.pow(Math.random(), 1.6) * 1.35;

        return {
          x:
            index * zoneWidth +
            Math.random() * zoneWidth,

          /*
           * Начинаем заметно выше viewport.
           * Поэтому точки не выглядят так,
           * будто материализуются на верхней границе.
           */
          y: -30 - Math.random() * 160,

          radius,
          depth,

          /*
           * Почти вертикальное падение.
           */
          vx: (Math.random() - 0.5) * (4 + depth * 5),

          /*
           * Ближние точки изначально чуть быстрее.
           */
          vy:
            20 +
            depth * 35 +
            Math.random() * 25,

          /*
           * Разная "масса".
           * Крупные/ближние точки быстрее набирают скорость.
           */
          gravity:
            115 +
            depth * 95 +
            Math.random() * 25,

          delay,

          /*
           * Минимальное покачивание.
           * Дальние лёгкие точки немного сильнее
           * реагируют на условный воздух.
           */
          swayAmount:
            1.5 +
            (1 - depth) * 5 +
            Math.random() * 3,

          swaySpeed:
            0.65 +
            Math.random() * 0.8,

          swayPhase:
            Math.random() * Math.PI * 2,

          /*
           * Глубина также влияет на прозрачность.
           */
          opacity:
            0.42 +
            depth * 0.5 +
            Math.random() * 0.08,

          /*
           * Очень небольшой blur только у дальнего слоя.
           */
          blur:
            depth < 0.25
              ? 0.45 + Math.random() * 0.45
              : 0,

          active: false,
        };
      },
    );

    /*
     * Глобальный ветер.
     *
     * Он очень слабый и медленно меняется,
     * поэтому вся масса точек слегка "дышит"
     * как единая среда.
     */
    const getWind = (time: number) => {
      return (
        Math.sin(time * 0.55) * 1.7 +
        Math.sin(time * 0.21 + 2.4) * 1.1
      );
    };

    const drawDot = (
      dot: Dot,
      x: number,
      y: number,
    ) => {
      ctx.save();

      ctx.globalAlpha = dot.opacity;

      if (dot.blur > 0) {
        ctx.filter = `blur(${dot.blur}px)`;
      }

      /*
       * Небольшой мягкий halo только у крупных точек.
       * Он почти незаметный, но убирает ощущение
       * абсолютно плоских кружков.
       */
      if (dot.depth > 0.78) {
        ctx.beginPath();

        ctx.arc(
          x,
          y,
          dot.radius * 1.55,
          0,
          Math.PI * 2,
        );

        ctx.fillStyle = "rgba(255, 56, 48, 0.055)";
        ctx.fill();
      }

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        dot.radius,
        0,
        Math.PI * 2,
      );

      ctx.fillStyle = "#FF3830";
      ctx.fill();

      ctx.restore();
    };

    const animate = (time: number) => {
      const dt = Math.min(
        (time - previousTime) / 1000,
        0.033,
      );

      previousTime = time;
      elapsed += dt;

      ctx.clearRect(0, 0, width, height);

      const globalWind = getWind(elapsed);

      let alive = false;

      for (const dot of dots) {
        if (elapsed < dot.delay) {
          alive = true;
          continue;
        }

        if (!dot.active) {
          dot.active = true;
        }

        if (dot.y - dot.radius > height + 80) {
          continue;
        }

        alive = true;

        /*
         * Настоящее ускорение вниз.
         */
        dot.vy += dot.gravity * dt;

        /*
         * Терминальная скорость.
         *
         * Без неё к низу экрана точки начинали бы
         * выглядеть как пули.
         */
        const terminalVelocity =
          330 + dot.depth * 150;

        dot.vy = Math.min(
          dot.vy,
          terminalVelocity,
        );

        /*
         * Очень слабый общий ветер.
         * На дальний слой влияет немного сильнее.
         */
        dot.vx +=
          globalWind *
          (1.15 - dot.depth * 0.55) *
          dt;

        /*
         * Горизонтальное сопротивление.
         */
        dot.vx *= Math.pow(0.985, dt * 60);

        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        const age = elapsed - dot.delay;

        /*
         * Индивидуальное мягкое покачивание.
         */
        const localSway =
          Math.sin(
            age * dot.swaySpeed +
              dot.swayPhase,
          ) * dot.swayAmount;

        /*
         * Второй микроскопический шум делает
         * траекторию менее идеально синусоидальной.
         */
        const microSway =
          Math.sin(
            age * 2.1 +
              dot.swayPhase * 1.7,
          ) *
          1.2 *
          (1 - dot.depth);

        drawDot(
          dot,
          dot.x + localSway + microSway,
          dot.y,
        );
      }

      if (alive) {
        frameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [burst]);

  if (burst === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  );
}