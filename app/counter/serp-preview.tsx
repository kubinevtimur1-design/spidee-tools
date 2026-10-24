"use client";

import { useId, useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import {
  DESCRIPTION_CHAR_PRESET,
  ELLIPSIS,
  GOOGLE_DESC_DESKTOP_PX,
  GOOGLE_DESC_MOBILE_PX,
  GOOGLE_TITLE_DESKTOP_PX,
  GOOGLE_TITLE_MOBILE_PX,
  GOOGLE_WARN_RATIO,
  SAMPLE_DESCRIPTION,
  SAMPLE_TITLE,
  SERP_URL,
  SNIPPET_FONT_STACK,
  TITLE_CHAR_PRESET,
  YANDEX_DESC_HARD_CHARS,
  googleBudget,
  snippetRole,
  yandexCharLimits,
  type LimitMode,
  type SerpDevice,
  type SerpEngine,
  type SnippetRole,
} from "./serp-limits";
import {
  capPixelCutByChars,
  measureWithCanvas,
  truncateByPixels,
  yandexPieces,
  type PixelCut,
  type YandexPieces,
} from "./serp-truncate";

type Props = {
  text: string;
  mode: LimitMode;
  customLimit: number;
};

function usePrefersMobile() {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia("(max-width: 639px)");
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false,
  );
}

const snippetFont: CSSProperties = {
  fontFamily: SNIPPET_FONT_STACK,
  fontSynthesis: "none",
  fontVariantLigatures: "none",
};

function SiteMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
      <rect width="28" height="28" rx="14" fill="#f3f4f6" />
      <circle cx="14" cy="14" r="6.25" fill="none" stroke="#4b5563" strokeWidth="1.4" />
      <path
        d="M14 7.75v12.5M7.75 14h12.5M9.2 10.6c1.5 1.1 3.1 1.7 4.8 1.7s3.3-.6 4.8-1.7M9.2 17.4c1.5-1.1 3.1-1.7 4.8-1.7s3.3.6 4.8 1.7"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ZoneMeter({
  value,
  scale,
  segments,
  tickAt,
  label,
  readout,
  tone,
  meterLabel,
}: {
  value: number;
  scale: number;
  segments: { width: number; className: string }[];
  tickAt: number[];
  label: string;
  readout: string;
  tone: "ok" | "warn" | "over";
  meterLabel: string;
}) {
  const pct = (n: number) => `${(n / scale) * 100}%`;
  const readoutClass =
    tone === "over" ? "text-red-600" : tone === "warn" ? "text-amber-700" : "text-gray-900";

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
        <span className="text-gray-500">{label}</span>
        <span className={`font-medium tabular-nums ${readoutClass}`}>{readout}</span>
      </div>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-gray-100"
        role="meter"
        aria-label={meterLabel}
        aria-valuemin={0}
        aria-valuemax={Math.round(scale)}
        aria-valuenow={Math.max(0, Math.round(value))}
      >
        {segments.map((segment, index) => {
          const left = segments.slice(0, index).reduce((sum, item) => sum + item.width, 0);
          if (segment.width <= 0) return null;
          return (
            <div
              key={`${segment.className}-${index}`}
              className={`absolute inset-y-0 ${segment.className}`}
              style={{ left: pct(left), width: pct(segment.width) }}
            />
          );
        })}
        {tickAt.map((tick) => (
          <div
            key={tick}
            className="absolute inset-y-0 w-px bg-gray-900/35"
            style={{ left: pct(tick) }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

function CutCallout({
  tone,
  title,
  text,
}: {
  tone: "warn" | "over";
  title: string;
  text: string;
}) {
  const box =
    tone === "over"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-amber-200 bg-amber-50 text-amber-950";
  const heading = tone === "over" ? "text-red-700" : "text-amber-800";
  return (
    <div className={`mt-3 rounded-xl border px-3 py-2 ${box}`}>
      <p className={`text-[11px] font-medium ${heading}`}>{title}</p>
      <p className="mt-1 line-clamp-4 text-sm leading-snug">{text}</p>
      <p className={`mt-1 text-[11px] tabular-nums ${heading}`}>{text.length} симв. обрежется в выдаче</p>
    </div>
  );
}

function googleTone(cut: PixelCut, limit: number): "ok" | "warn" | "over" {
  if (cut.fullWidth > limit) return "over";
  if (cut.fullWidth >= limit * GOOGLE_WARN_RATIO) return "warn";
  return "ok";
}

export default function SerpPreview({ text, mode, customLimit }: Props) {
  const meterId = useId();
  const [engine, setEngine] = useState<SerpEngine>("google");
  const [deviceOverride, setDeviceOverride] = useState<SerpDevice | null>(null);
  const prefersMobile = usePrefersMobile();
  const device = deviceOverride ?? (prefersMobile ? "mobile" : "desktop");

  const role = snippetRole(mode, customLimit);
  const charPreset = role === "title" ? TITLE_CHAR_PRESET : DESCRIPTION_CHAR_PRESET;
  const customCap = mode === "custom" ? customLimit : null;

  const google = useMemo(() => {
    const budget = googleBudget(role, device);
    const measure = (sample: string) => measureWithCanvas(sample, budget.font);
    let cut = truncateByPixels(text, budget.maxPx, measure);
    if (customCap != null) cut = capPixelCutByChars(cut, customCap, measure);
    return { ...budget, cut };
  }, [text, role, device, customCap]);

  const yandex = useMemo(() => {
    const limits = yandexCharLimits(role);
    return {
      ...limits,
      pieces: yandexPieces(text, limits.warn, limits.hard, customCap),
    };
  }, [text, role, customCap]);

  const hasText = google.cut.normalized.length > 0;
  const columnClass = engine === "google" && device === "mobile" ? "max-w-[400px]" : "max-w-[600px]";

  const googleStatus = googleStatusText(google.cut, google.maxPx, customCap);
  const yandexStatus = yandexStatusText(yandex.pieces);

  const desktopPx = role === "title" ? GOOGLE_TITLE_DESKTOP_PX : GOOGLE_DESC_DESKTOP_PX;
  const mobilePx = role === "title" ? GOOGLE_TITLE_MOBILE_PX : GOOGLE_DESC_MOBILE_PX;
  const activeCut = engine === "google" ? google.cut.overflow : yandex.pieces.cut;

  return (
    <section
      className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6"
      aria-labelledby={`${meterId}-heading`}
      data-serp-engine={engine}
      data-serp-device={device}
      data-serp-role={role}
      data-serp-visible={engine === "google" ? google.cut.visible : `${yandex.pieces.keep}${yandex.pieces.soft}`}
      data-serp-overflow={activeCut}
      data-serp-px={Math.round(google.cut.fullWidth)}
      data-serp-truncated={engine === "google" ? String(google.cut.truncated) : String(yandex.pieces.cut.length > 0)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id={`${meterId}-heading`} className="text-sm font-semibold text-[#1d1d1f]">
            Превью сниппета
          </h2>
          <p className="text-xs text-gray-500">
            {roleCaption(mode, role, customLimit)}
          </p>
        </div>
        <p className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
          ориентир выдачи
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Поисковая система" className="flex items-center gap-2">
          <EngineTab
            selected={engine === "google"}
            onSelect={() => setEngine("google")}
            dotClass="bg-[#1a73e8]"
            label="Google"
          />
          <EngineTab
            selected={engine === "yandex"}
            onSelect={() => setEngine("yandex")}
            dotClass="bg-[#e23b2f]"
            label="Яндекс"
          />
        </div>
        {engine === "google" && (
          <div className="flex items-center gap-1 rounded-full bg-gray-100 p-0.5" role="group" aria-label="Ширина ориентира Google">
            <DeviceButton
              selected={device === "desktop"}
              onSelect={() => setDeviceOverride("desktop")}
              label="Десктоп"
            />
            <DeviceButton
              selected={device === "mobile"}
              onSelect={() => setDeviceOverride("mobile")}
              label="Телефон"
            />
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-[#fff] px-4 py-3.5">
        {!hasText && (
          <p className="mb-2.5 text-[11px] text-gray-400">
            Пример. Напиши свой текст или нажми «Подставить пример».
          </p>
        )}
        <div className={`min-w-0 ${columnClass}`}>
          <div className="flex items-center gap-2.5">
            <SiteMark />
            <p className="truncate text-[14px] leading-5" style={{ ...snippetFont, color: engine === "yandex" ? "#067306" : "#202124" }}>
              {SERP_URL}
            </p>
          </div>

          {engine === "google" ? (
            <GoogleSnippet
              role={role}
              hasText={hasText}
              cut={google.cut}
            />
          ) : (
            <YandexSnippet role={role} hasText={hasText} pieces={yandex.pieces} />
          )}
        </div>

        {engine === "google" && google.cut.truncated && google.cut.overflow && (
          <CutCallout
            tone={google.cut.fullWidth > google.maxPx ? "over" : "warn"}
            title={
              google.cut.cappedByCustom && google.cut.fullWidth <= google.maxPx
                ? "Режем по твоему лимиту"
                : "Обрежется в выдаче"
            }
            text={google.cut.overflow}
          />
        )}
        {engine === "yandex" && yandex.pieces.cut && (
          <CutCallout
            tone={yandex.pieces.length > yandex.hard && role === "description" ? "over" : "warn"}
            title={yandexCutTitle(yandex.pieces, role)}
            text={yandex.pieces.cut}
          />
        )}
      </div>

      <div className="mt-4 space-y-2">
        {engine === "google" ? (
          <GoogleMeter cut={google.cut} limit={google.maxPx} role={role} device={device} />
        ) : (
          <YandexMeter pieces={yandex.pieces} role={role} />
        )}
        <p className="text-xs leading-relaxed text-gray-500">
          {engine === "google" ? googleStatus : yandexStatus}
        </p>
        {text.length > 0 && text.length !== google.cut.normalized.length && (
          <p className="text-xs text-gray-400">
            Пробелы и переносы в выдаче схлопнутся: останется {google.cut.normalized.length} симв.
          </p>
        )}
        <p className="text-[11px] leading-relaxed text-gray-400">
          {engine === "google"
            ? `Google меряем по ширине (${role === "title" ? "Arial 20px" : "Arial 14px"}): десктоп ${desktopPx} px, телефон ${mobilePx} px. Режем по последнему слову.`
            : `Яндекс меряем по символам: заголовок ${TITLE_CHAR_PRESET}, описание после ${DESCRIPTION_CHAR_PRESET} может обрезаться, иногда до ~${YANDEX_DESC_HARD_CHARS}.`}{" "}
          Это ориентир выдачи, не точный лимит.
        </p>
        {mode !== "custom" && engine === "google" && hasText && (
          <CharPixelNote
            rawLength={text.length}
            charLimit={charPreset}
            overPixels={google.cut.fullWidth > google.maxPx}
            role={role}
          />
        )}
      </div>
    </section>
  );
}

function EngineTab({
  selected,
  onSelect,
  dotClass,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  dotClass: string;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium motion-reduce:transition-none ${
        selected ? "bg-[#1d1d1f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : dotClass}`} aria-hidden="true" />
      {label}
    </button>
  );
}

function DeviceButton({
  selected,
  onSelect,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium motion-reduce:transition-none ${
        selected ? "bg-white text-gray-900" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {label}
    </button>
  );
}

function GoogleSnippet({
  role,
  hasText,
  cut,
}: {
  role: "title" | "description";
  hasText: boolean;
  cut: PixelCut;
}) {
  const titleActive = role === "title" && hasText;
  const descActive = role === "description" && hasText;
  return (
    <>
      <p
        className="mt-1.5 break-words"
        style={{
          ...snippetFont,
          fontWeight: 700,
          fontSize: "20px",
          lineHeight: 1.3,
          color: titleActive || !hasText ? "#1a0dab" : "#9ca3af",
        }}
      >
        {titleActive ? (
          <>
            {cut.visible}
            {cut.truncated ? ELLIPSIS : ""}
          </>
        ) : (
          SAMPLE_TITLE
        )}
      </p>
      <p
        className="mt-1 break-words"
        style={{
          ...snippetFont,
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: 1.45,
          color: descActive || !hasText ? "#4d5156" : "#9ca3af",
        }}
      >
        {descActive ? (
          <>
            {cut.visible}
            {cut.truncated ? ELLIPSIS : ""}
          </>
        ) : (
          SAMPLE_DESCRIPTION
        )}
      </p>
    </>
  );
}

function YandexSnippet({
  role,
  hasText,
  pieces,
}: {
  role: "title" | "description";
  hasText: boolean;
  pieces: YandexPieces;
}) {
  const titleActive = role === "title" && hasText;
  const descActive = role === "description" && hasText;
  return (
    <>
      <p
        className="mt-1.5 break-words"
        style={{
          ...snippetFont,
          fontWeight: 400,
          fontSize: "18px",
          lineHeight: 1.35,
          color: titleActive || !hasText ? "#0044bb" : "#9ca3af",
        }}
      >
        {titleActive ? <YandexRun pieces={pieces} /> : SAMPLE_TITLE}
      </p>
      <p
        className="mt-1 break-words"
        style={{
          ...snippetFont,
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: 1.45,
          color: descActive || !hasText ? "#333333" : "#9ca3af",
        }}
      >
        {descActive ? <YandexRun pieces={pieces} /> : SAMPLE_DESCRIPTION}
      </p>
    </>
  );
}

function YandexRun({ pieces }: { pieces: YandexPieces }) {
  return (
    <>
      {pieces.keep}
      {pieces.soft ? (
        <span className="rounded-sm bg-amber-200 text-amber-950" title="Может обрезаться">
          {pieces.soft}
        </span>
      ) : null}
      {pieces.cut ? ELLIPSIS : ""}
    </>
  );
}

function GoogleMeter({
  cut,
  limit,
  role,
  device,
}: {
  cut: PixelCut;
  limit: number;
  role: "title" | "description";
  device: SerpDevice;
}) {
  const scale = Math.max(limit, cut.fullWidth, 1);
  const warnAt = limit * GOOGLE_WARN_RATIO;
  const tone = googleTone(cut, limit);
  const blue = Math.min(cut.fullWidth, warnAt);
  const gap = Math.max(0, warnAt - cut.fullWidth);
  const amber = Math.max(0, Math.min(cut.fullWidth, limit) - warnAt);
  const amberRest = Math.max(0, limit - Math.max(cut.fullWidth, warnAt));
  const over = Math.max(0, cut.fullWidth - limit);
  const field = role === "title" ? "Заголовок" : "Описание";
  const deviceLabel = device === "desktop" ? "десктоп" : "телефон";

  return (
    <ZoneMeter
      value={cut.fullWidth}
      scale={scale}
      tickAt={[limit]}
      label={`Ширина · ${deviceLabel}`}
      readout={`${Math.round(cut.fullWidth)} / ${limit} px`}
      tone={tone}
      meterLabel={`Ширина ${field.toLowerCase()} в Google`}
      segments={[
        { width: blue, className: "bg-blue-600" },
        { width: gap, className: "bg-transparent" },
        { width: amber, className: "bg-amber-500" },
        { width: amberRest, className: "bg-amber-100" },
        { width: over, className: "bg-red-500" },
      ]}
    />
  );
}

function YandexMeter({
  pieces,
  role,
}: {
  pieces: YandexPieces;
  role: "title" | "description";
}) {
  const { length, engineWarn, engineHard } = pieces;
  const scale = Math.max(engineHard, length, 1);
  const overHard = length > engineHard;
  const overWarn = length > engineWarn;
  const tone: "ok" | "warn" | "over" =
    role === "description" && overHard ? "over" : overWarn ? "warn" : "ok";
  const blue = Math.min(length, engineWarn);
  const gap = Math.max(0, engineWarn - length);
  const amber = Math.max(0, Math.min(length, engineHard) - engineWarn);
  const amberRest = Math.max(0, engineHard - Math.max(length, engineWarn));
  const over = Math.max(0, length - engineHard);
  const overClass = role === "title" ? "bg-amber-500" : "bg-red-500";

  return (
    <ZoneMeter
      value={length}
      scale={scale}
      tickAt={role === "description" ? [engineWarn, engineHard] : [engineWarn]}
      label="Символы"
      readout={`${length} / ${engineWarn}`}
      tone={tone}
      meterLabel="Длина текста в Яндексе"
      segments={[
        { width: blue, className: "bg-blue-600" },
        { width: gap, className: "bg-transparent" },
        { width: amber, className: "bg-amber-500" },
        { width: amberRest, className: "bg-amber-100" },
        { width: over, className: overClass },
      ]}
    />
  );
}

function CharPixelNote({
  rawLength,
  charLimit,
  overPixels,
  role,
}: {
  rawLength: number;
  charLimit: number;
  overPixels: boolean;
  role: SnippetRole;
}) {
  const name = role === "title" ? "заголовок" : "описание";
  const overChars = rawLength > charLimit;
  if (overPixels && !overChars) {
    return (
      <p className="text-xs text-amber-700">
        По символам влезает, по ширине Google — обрежется в выдаче.
      </p>
    );
  }
  if (!overPixels && overChars) {
    return (
      <p className="text-xs text-amber-700">
        По символам уже больше {charLimit}, по ширине Google {name} ещё влезает.
      </p>
    );
  }
  return null;
}

function roleCaption(mode: LimitMode, role: "title" | "description", customLimit: number): string {
  if (mode === "custom") {
    const asRole = role === "title" ? "заголовок" : "описание";
    return `Лимит ${customLimit} — смотрим как ${asRole}.`;
  }
  return role === "title"
    ? "Сейчас это заголовок. Описание рядом — пример."
    : "Сейчас это описание. Заголовок рядом — пример.";
}

function googleStatusText(cut: PixelCut, limit: number, customCap: number | null): string {
  if (!cut.normalized) return "Напиши текст — сразу видно, влезет ли он.";
  if (cut.fullWidth > limit) {
    const extra = Math.round(cut.fullWidth - limit);
    return `Обрежется в выдаче: шире на ${extra} px. Хвост показан ниже.`;
  }
  if (cut.cappedByCustom && customCap != null) {
    return "Режем по твоему лимиту. По ширине Google ещё влезает.";
  }
  if (cut.fullWidth >= limit * GOOGLE_WARN_RATIO) {
    return "Ещё чуть-чуть — и обрежется в выдаче.";
  }
  return "Влезет в Google.";
}

function yandexStatusText(pieces: YandexPieces): string {
  if (!pieces.normalized) return "Напиши текст — сразу видно, влезет ли он.";
  if (pieces.cappedByCustom && pieces.length > pieces.engineHard) {
    return "Обрежется в выдаче — и по твоему лимиту тоже.";
  }
  if (pieces.cappedByCustom && pieces.length <= pieces.engineHard) {
    if (pieces.length > pieces.engineWarn && pieces.engineHard > pieces.engineWarn) {
      return "Режем по твоему лимиту. Часть уже может обрезаться в выдаче.";
    }
    if (pieces.length <= pieces.engineWarn) {
      return "Режем по твоему лимиту. В Яндексе ещё есть запас.";
    }
  }
  if (pieces.length > pieces.engineHard && pieces.engineHard > pieces.engineWarn) {
    return "Обрежется в выдаче. Жёлтым отмечено то, что ещё иногда видно.";
  }
  if (pieces.length > pieces.engineWarn) {
    return pieces.engineHard === pieces.engineWarn
      ? "Может обрезаться в выдаче. Хвост показан ниже."
      : `После ${pieces.engineWarn} символов может обрезаться. Иногда видно до ~${pieces.engineHard}.`;
  }
  return "Влезет в Яндекс.";
}

function yandexCutTitle(pieces: YandexPieces, role: "title" | "description"): string {
  if (pieces.cappedByCustom && pieces.length <= pieces.engineWarn) return "Режем по твоему лимиту";
  if (role === "title") return "Может обрезаться";
  return "Обрежется в выдаче";
}
