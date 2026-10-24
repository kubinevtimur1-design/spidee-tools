import { ELLIPSIS } from "./serp-limits";

export function normalizeSnippet(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export type CharCut = {
  normalized: string;
  visible: string;
  overflow: string;
  truncated: boolean;
};

/**
 * Обрезает по символам на границе слова. Если первое слово длиннее лимита,
 * режет его по символам. Многоточие в лимит не входит — это метка обрезки.
 */
export function truncateByChars(text: string, maxChars: number): CharCut {
  const normalized = normalizeSnippet(text);
  if (!normalized || maxChars < 1) {
    return {
      normalized,
      visible: "",
      overflow: normalized,
      truncated: normalized.length > 0,
    };
  }
  if (normalized.length <= maxChars) {
    return { normalized, visible: normalized, overflow: "", truncated: false };
  }

  let end = maxChars;
  const next = normalized[end];
  const prev = normalized[end - 1];
  if (next !== " " && prev !== " ") {
    const space = normalized.lastIndexOf(" ", end - 1);
    if (space > 0) end = space;
  }

  const visible = normalized.slice(0, end).trimEnd();
  const overflow = normalized.slice(visible.length).trimStart();
  return {
    normalized,
    visible,
    overflow,
    truncated: overflow.length > 0,
  };
}

export type PixelCut = {
  normalized: string;
  visible: string;
  overflow: string;
  truncated: boolean;
  /** Ширина всей строки без многоточия. */
  fullWidth: number;
  /** Ширина видимой части. С многоточием, если строка обрезана. */
  visibleWidth: number;
  cappedByCustom: boolean;
};

/**
 * Обрезает по пикселям: последнее целое слово, которое вместе с «…»
 * помещается в бюджет. Длинное первое слово режется по символам.
 * `measure` — обычно canvas.measureText, в тестах подменяется.
 */
export function truncateByPixels(
  text: string,
  maxPx: number,
  measure: (sample: string) => number,
): PixelCut {
  const normalized = normalizeSnippet(text);
  const fullWidth = normalized ? measure(normalized) : 0;
  if (!normalized || fullWidth <= maxPx) {
    return {
      normalized,
      visible: normalized,
      overflow: "",
      truncated: false,
      fullWidth,
      visibleWidth: fullWidth,
      cappedByCustom: false,
    };
  }

  const words = normalized.split(" ");
  let bestWords = 0;
  let low = 1;
  let high = words.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const candidate = `${words.slice(0, mid).join(" ")}${ELLIPSIS}`;
    if (measure(candidate) <= maxPx) {
      bestWords = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (bestWords > 0) {
    const visible = words.slice(0, bestWords).join(" ");
    return {
      normalized,
      visible,
      overflow: words.slice(bestWords).join(" "),
      truncated: true,
      fullWidth,
      visibleWidth: measure(`${visible}${ELLIPSIS}`),
      cappedByCustom: false,
    };
  }

  const word = words[0] ?? "";
  let bestChars = 0;
  low = 0;
  high = word.length;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const candidate = `${word.slice(0, mid)}${ELLIPSIS}`;
    if (measure(candidate) <= maxPx) {
      bestChars = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const visible = word.slice(0, bestChars);
  const overflow =
    bestChars === 0
      ? normalized
      : [word.slice(bestChars), ...words.slice(1)].filter(Boolean).join(" ");

  return {
    normalized,
    visible,
    overflow,
    truncated: true,
    fullWidth,
    visibleWidth: measure(`${visible}${ELLIPSIS}`),
    cappedByCustom: false,
  };
}

/** Если свой лимит короче уже посчитанной обрезки — режем ещё раз по символам. */
export function capPixelCutByChars(
  cut: PixelCut,
  maxChars: number,
  measure: (sample: string) => number,
): PixelCut {
  const byChars = truncateByChars(cut.normalized, maxChars);
  if (byChars.visible.length >= cut.visible.length) return cut;
  return {
    normalized: cut.normalized,
    visible: byChars.visible,
    overflow: byChars.overflow,
    truncated: byChars.truncated,
    fullWidth: cut.fullWidth,
    visibleWidth: measure(byChars.truncated ? `${byChars.visible}${ELLIPSIS}` : byChars.visible),
    cappedByCustom: true,
  };
}

export type YandexPieces = {
  normalized: string;
  length: number;
  /** Точно помещается в мягкий ориентир. */
  keep: string;
  /** У описания: кусок между 160 и жёсткой обрезкой. У заголовка пусто. */
  soft: string;
  /** Хвост за жёсткой обрезкой или за своим лимитом. */
  cut: string;
  engineWarn: number;
  engineHard: number;
  cappedByCustom: boolean;
};

export function yandexPieces(
  text: string,
  engineWarn: number,
  engineHard: number,
  customLimit: number | null,
): YandexPieces {
  const normalized = normalizeSnippet(text);
  const cap =
    customLimit == null ? engineHard : Math.min(engineHard, Math.max(1, customLimit));
  const cutResult = truncateByChars(normalized, cap);
  const keepCount = Math.min(engineWarn, cutResult.visible.length);
  return {
    normalized,
    length: normalized.length,
    keep: cutResult.visible.slice(0, keepCount),
    soft: cutResult.visible.slice(keepCount),
    cut: cutResult.overflow,
    engineWarn,
    engineHard,
    cappedByCustom: customLimit != null && customLimit < engineHard && cutResult.truncated,
  };
}

let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Грубая оценка до появления canvas (сервер и первый кадр). */
export function approximateWidth(text: string, font: string): number {
  const pxPerChar = font.includes("20px") ? 10.6 : 7.4;
  return text.length * pxPerChar;
}

/** Лёгкий замер: один canvas на страницу, без библиотек. */
export function measureWithCanvas(text: string, font: string): number {
  if (typeof document === "undefined") return approximateWidth(text, font);
  if (measureCtx === undefined) {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) return approximateWidth(text, font);
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}
