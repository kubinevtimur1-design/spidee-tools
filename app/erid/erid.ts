export type AdvertiserKind = "ooo" | "ip" | "self" | "person";

export const ADVERTISER_KINDS: { id: AdvertiserKind; label: string }[] = [
  { id: "ooo", label: "ООО (юрлицо)" },
  { id: "ip", label: "ИП" },
  { id: "self", label: "Самозанятый" },
  { id: "person", label: "Физлицо" },
];

export const SAMPLE_MARKING = {
  kind: "ooo" as const,
  name: "Ромашка",
  inn: "7707083893",
  erid: "2VtzqvXXXXX",
};

export const SAMPLE_LINK = {
  url: "https://example.ru/sale#reviews",
  erid: "2VtzqvXXXXX",
};

export const SAMPLE_POST = {
  text: "Реклама. ООО «Ромашка», ИНН 7707083893.\nerid: 2VtzqvXXXXX\nСкидки на букеты до конца недели.",
  link: "https://example.ru/sale?erid=2VtzqvXXXXX",
};

export const PAGE_H1 = "Маркировка рекламы с erid";

export const PAGE_LEAD =
  "Собери пометку, вставь erid в ссылку и проверь пост до публикации. Токен выдаёт ОРД, а здесь можно оформить его без ошибок.";

export const TOKEN_LINE =
  "Токен выдаёт ОРД, здесь его можно только оформить и проверить.";

export const DISCLAIMER = `Не заменяет ОРД и юриста. ${TOKEN_LINE} Подлинность токена не проверяется.`;

export const FAQ = [
  {
    q: "Где взять erid?",
    a: `У оператора рекламных данных (ОРД): регистрируешь креатив до публикации и получаешь токен. ${TOKEN_LINE}`,
  },
  {
    q: "Куда ставить erid?",
    a: "Если в посте есть ссылка, токен идёт в неё параметром ?erid=… или &erid=…, перед #. Если ссылки нет, пиши «erid: …» в начале текста или поверх креатива.",
  },
  {
    q: "Нужен ли ИНН в пометке?",
    a: "Нужен, если по названию рекламодателя его не опознать однозначно. Проще ставить всегда.",
  },
  {
    q: "Можно сократить ссылку или поменять регистр токена?",
    a: "Нет. Сокращалки и спрятанные гиперссылки скрывают erid, а смена регистра делает токен неверным. Обе ошибки Роскомнадзор называет отдельно.",
  },
  {
    q: "Инструмент проверяет, что токен настоящий?",
    a: "Нет, только формат. Подлинность смотри в кабинете своего ОРД.",
  },
] as const;

export type PlacementFormat = "post" | "story" | "video" | "circle" | "banner";

export const PLACEMENT_FORMATS: { id: PlacementFormat; label: string }[] = [
  { id: "post", label: "пост" },
  { id: "story", label: "сторис" },
  { id: "video", label: "видео" },
  { id: "circle", label: "кружок" },
  { id: "banner", label: "баннер" },
];

const PLACEMENT_LINES: Record<
  PlacementFormat,
  { link: string; plain: string }
> = {
  post: {
    link: "Токен — в ссылку параметром erid, перед #.",
    plain: "Напиши «erid: …» в начале текста.",
  },
  story: {
    link: "Токен — в ссылку стикера, параметром erid.",
    plain: "Напиши «erid: …» поверх сторис.",
  },
  video: {
    link: "Токен — в ссылку под видео, параметром erid.",
    plain: "Напиши «erid: …» поверх видео.",
  },
  circle: {
    link: "Токен — в ссылку в подписи к кружку.",
    plain: "Напиши «erid: …» поверх кружка.",
  },
  banner: {
    link: "Токен — в ссылку баннера, параметром erid.",
    plain: "Напиши «erid: …» на баннере.",
  },
};

export function placementLine(
  format: PlacementFormat,
  hasLink: boolean,
): string {
  const lines = PLACEMENT_LINES[format];
  return hasLink ? lines.link : lines.plain;
}

const INN_10_WEIGHTS = [2, 4, 10, 3, 5, 9, 4, 6, 8];
const INN_12_WEIGHTS_11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
const INN_12_WEIGHTS_12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

const SHORTENER_HOSTS = [
  "clck.ru",
  "clck.yandex.ru",
  "bit.ly",
  "bitly.com",
  "tinyurl.com",
  "tiny.cc",
  "goo.su",
  "goo.gl",
  "cutt.ly",
  "cutt.us",
  "t.ly",
  "vk.cc",
  "vk.link",
  "u.to",
  "is.gd",
  "ow.ly",
  "rebrand.ly",
  "shorturl.at",
  "ya.cc",
  "t.co",
  "rb.gy",
  "short.io",
  "clc.to",
  "surl.li",
];

export function normalizeInn(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function innLengthFor(kind: AdvertiserKind): 10 | 12 {
  return kind === "ooo" ? 10 : 12;
}

function checksum(digits: string, weights: number[]): number {
  const sum = weights.reduce(
    (total, weight, index) => total + weight * Number(digits[index]),
    0,
  );

  return (sum % 11) % 10;
}

/** Official INN check digits. Length is not guessed: 10 or 12 only. */
export function isValidInnChecksum(inn: string): boolean {
  if (/^\d{10}$/.test(inn)) {
    return checksum(inn, INN_10_WEIGHTS) === Number(inn[9]);
  }

  if (/^\d{12}$/.test(inn)) {
    const eleventh = checksum(inn, INN_12_WEIGHTS_11);
    const twelfth = checksum(inn, INN_12_WEIGHTS_12);

    return eleventh === Number(inn[10]) && twelfth === Number(inn[11]);
  }

  return false;
}

export function innError(kind: AdvertiserKind, raw: string): string | null {
  const inn = normalizeInn(raw.trim());

  if (!inn) return "Впиши ИНН.";
  if (!/^\d+$/.test(inn)) return "ИНН — только цифры.";

  const need = innLengthFor(kind);

  if (inn.length !== need) {
    return need === 10
      ? "Для юрлица ИНН — 10 цифр."
      : "Для ИП, самозанятого и физлица ИНН — 12 цифр.";
  }

  if (!isValidInnChecksum(inn)) {
    return "ИНН не сходится по контрольной сумме.";
  }

  return null;
}

/** Letters and digits only. Length is intentionally not checked. */
export function isValidErid(token: string): boolean {
  return /^[A-Za-z0-9]+$/.test(token);
}

export function eridError(raw: string): string | null {
  const token = raw.trim();

  if (!token) return "Впиши erid.";
  if (!isValidErid(token)) return "Токен — только латиница и цифры.";

  return null;
}

function firstInitial(word: string): string {
  const char = [...word][0] ?? "";
  return `${char.toLocaleUpperCase("ru-RU")}.`;
}

export function formatPersonName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return "";

  const compact = name.match(/^(\p{L}+(?:-\p{L}+)?)\s+(\p{L})\.\s*(\p{L})\.?$/u);

  if (compact) {
    return `${compact[1]} ${compact[2].toLocaleUpperCase("ru-RU")}. ${compact[3].toLocaleUpperCase("ru-RU")}.`;
  }

  const parts = name.split(" ");
  const plain = /^\p{L}+(?:-\p{L}+)?$/u;

  if (parts.length >= 3 && parts.slice(0, 3).every((part) => plain.test(part))) {
    const [last, first, middle] = parts;
    return `${last} ${firstInitial(first)} ${firstInitial(middle)}`;
  }

  return name;
}

function stripOoo(name: string): string {
  return name
    .replace(/^ооо\s+/iu, "")
    .replace(/^[«"]+/u, "")
    .replace(/[»"]+$/u, "")
    .trim();
}

export function formatAdvertiser(kind: AdvertiserKind, raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return "";

  if (kind === "ooo") {
    const core = stripOoo(name);
    return core ? `ООО «${core}»` : "";
  }

  if (kind === "ip") {
    const core = formatPersonName(name.replace(/^ип\s+/iu, ""));
    return core ? `ИП ${core}` : "";
  }

  if (kind === "self") {
    const core = formatPersonName(
      name.replace(/^(?:самозанятый|самозанятая)\s+/iu, ""),
    );
    return core ? `Самозанятый ${core}` : "";
  }

  return name;
}

export function buildMarking(input: {
  kind: AdvertiserKind;
  name: string;
  inn: string;
  erid: string;
}): string {
  const advertiser = formatAdvertiser(input.kind, input.name);
  const inn = normalizeInn(input.inn.trim());
  const erid = input.erid.trim();

  return `Реклама. ${advertiser}, ИНН ${inn}. erid: ${erid}`;
}

export function markingReady(input: {
  kind: AdvertiserKind;
  name: string;
  inn: string;
  erid: string;
}): boolean {
  return (
    formatAdvertiser(input.kind, input.name).length > 0 &&
    innError(input.kind, input.inn) === null &&
    eridError(input.erid) === null
  );
}

/**
 * Inserts or replaces the erid query param before the hash.
 * The token is written as-is: no lowercasing and no percent-encoding.
 * The rest of the query string is left untouched.
 */
export function appendErid(rawUrl: string, rawErid: string): string {
  const url = rawUrl.trim();
  const token = rawErid.trim();

  if (!url || !token) return url;

  const hashIndex = url.indexOf("#");
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const queryIndex = withoutHash.indexOf("?");
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";
  const parts = query.length > 0 ? query.split("&") : [];
  const kept: string[] = [];
  let inserted = false;

  for (const part of parts) {
    if (!part) continue;

    const eq = part.indexOf("=");
    const rawKey = eq >= 0 ? part.slice(0, eq) : part;
    let key = rawKey;

    try {
      key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    } catch {
      key = rawKey;
    }

    if (key.toLowerCase() === "erid") {
      if (!inserted) {
        kept.push(`erid=${token}`);
        inserted = true;
      }
      continue;
    }

    kept.push(part);
  }

  if (!inserted) kept.push(`erid=${token}`);

  return `${path}?${kept.join("&")}${hash}`;
}

export function isShortenerHost(hostname: string): boolean {
  const host = hostname
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^www\./, "");

  return SHORTENER_HOSTS.some(
    (item) => host === item || host.endsWith(`.${item}`),
  );
}

const URLISH_RE =
  /(?:https?:\/\/)?(?:www\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?=[/?#\s]|$)/gi;

export function textHasShortener(text: string): boolean {
  for (const match of text.matchAll(URLISH_RE)) {
    if (isShortenerHost(match[1] ?? "")) return true;
  }

  return false;
}

export function isShortenerUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value)
    ? value
    : `https://${value}`;

  try {
    return isShortenerHost(new URL(candidate).hostname);
  } catch {
    return textHasShortener(value);
  }
}

const AD_MARKER_RE = /(?:^|[^\p{L}\p{N}])реклама(?![\p{L}\p{N}])/iu;
const ADVERTISER_FORM_RE =
  /(?:^|[^\p{L}\p{N}])(?:ооо|оао|зао|пао|нао|ао|ип|нко|ано|кфх|самозанят(?:ый|ая|ые)?)(?![\p{L}\p{N}])/iu;
const INN_RE = /инн(?![\p{L}])[\s:.№-]*(\d{10}|\d{12})(?!\d)/iu;
const ERID_COLON_RE = /(?:^|[^A-Za-z0-9])erid\s*:\s*([A-Za-z0-9]+)/gi;
const ERID_PARAM_RE = /(?:^|[^A-Za-z0-9])erid\s*=\s*([A-Za-z0-9]+)/gi;

function captureTokens(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)]
    .map((match) => match[1] ?? "")
    .filter(Boolean);
}

export type EridCaseState = "none" | "single" | "match" | "mismatch";

export type PostCheck = {
  hasAdMarker: boolean;
  hasAdvertiser: boolean;
  hasErid: boolean;
  caseState: EridCaseState;
  hasShortener: boolean;
};

export function checkPost(text: string, link: string): PostCheck {
  const colonTokens = captureTokens(text, ERID_COLON_RE);
  const paramTokens = [
    ...captureTokens(text, ERID_PARAM_RE),
    ...captureTokens(link, ERID_PARAM_RE),
  ];
  const allTokens = [...colonTokens, ...paramTokens];
  const unique = new Set(allTokens);

  let caseState: EridCaseState = "none";

  if (allTokens.length === 0) {
    caseState = "none";
  } else if (unique.size > 1) {
    caseState = "mismatch";
  } else if (colonTokens.length > 0 && paramTokens.length > 0) {
    caseState = "match";
  } else {
    caseState = "single";
  }

  return {
    hasAdMarker: AD_MARKER_RE.test(text),
    hasAdvertiser: ADVERTISER_FORM_RE.test(text) || INN_RE.test(text),
    hasErid: allTokens.length > 0,
    caseState,
    hasShortener: textHasShortener(text) || isShortenerUrl(link),
  };
}
