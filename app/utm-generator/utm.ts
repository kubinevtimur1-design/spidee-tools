export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export type UtmValues = Record<UtmKey, string>;

export type UtmCustomParam = {
  key: string;
  value: string;
};

export const EMPTY_UTM: UtmValues = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
};

/**
 * Кодирует значение параметра, но оставляет фигурные скобки:
 * макросы вроде {campaign_id} должны уйти в ссылку как есть.
 */
export function encodeUtmValue(value: string): string {
  return encodeURIComponent(value).replace(/%7B/gi, "{").replace(/%7D/gi, "}");
}

export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** QR имеет смысл только для готовой http(s)-ссылки, не для черновика. */
export function shouldShowQr(result: string): boolean {
  return result.trim().length > 0 && isHttpUrl(result);
}

export function buildUtmUrl(
  rawUrl: string,
  utm: UtmValues,
  customParams: UtmCustomParam[],
): string {
  const base = rawUrl.trim();
  if (!base) return "";

  const params: [string, string][] = [];

  for (const key of UTM_KEYS) {
    const value = utm[key].trim();
    if (value) params.push([key, value]);
  }

  for (const param of customParams) {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key && value) params.push([key, value]);
  }

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
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeUtmValue(value)}`)
    .join("&");

  return `${withoutHash}${separator}${query}${hash}`;
}
