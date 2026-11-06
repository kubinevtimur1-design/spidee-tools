/**
 * JSON-LD для Article, BlogPosting и NewsArticle.
 *
 * Google Search Central (Article structured data): обязательных свойств нет.
 * Рекомендованы author, author.name, author.url, datePublished, dateModified,
 * headline и image. Лимит заголовка в 110 символов в этой справке не задан.
 * Discover советует картинки от 1200 px, но тип NewsArticle этого не даёт.
 * Schema.org: те же поля необязательны; даты — ISO 8601 (Date или DateTime).
 *
 * dateModified не копируется из datePublished.
 * Время пишется только с явно выбранным смещением, без местного пояса браузера.
 */

export const ARTICLE_TYPES = [
  { id: "Article", description: "Общая статья" },
  { id: "BlogPosting", description: "Запись в блоге" },
  { id: "NewsArticle", description: "Новостной материал" },
] as const;

export type ArticleType = (typeof ARTICLE_TYPES)[number]["id"];

export const HEADLINE_SOFT_LIMIT = 110;

export const NEWS_NOTE =
  "Тип NewsArticle сам по себе не включает материал в Google Новости или Discover.";

export const IMAGE_HINT =
  "Несколько адресов — массивом. Размер не проверяем: Article советует от ~50 000 px², Discover — ширину от 1200 px.";

export const DATE_NOTE =
  "Без времени в код идёт дата. Пояс выбираешь сам. dateModified сам не подставится.";

export const COPY_OK = "Скопировано";

export const COPY_FAIL =
  "Не вышло скопировать. Выдели код и скопируй вручную.";

export const VALIDATORS = [
  {
    href: "https://webmaster.yandex.ru/tools/microtest/",
    label: "Яндекс",
    note: "нужен вход",
  },
  {
    href: "https://search.google.com/test/rich-results",
    label: "Google",
  },
  {
    href: "https://validator.schema.org/",
    label: "Schema.org",
  },
] as const;

export const TIMEZONES: { value: string; label: string }[] = [
  { value: "+00:00", label: "UTC +00:00" },
  { value: "+01:00", label: "+01:00" },
  { value: "+02:00", label: "+02:00 Калининград" },
  { value: "+03:00", label: "+03:00 Москва" },
  { value: "+04:00", label: "+04:00 Самара" },
  { value: "+05:00", label: "+05:00 Екатеринбург" },
  { value: "+05:30", label: "+05:30" },
  { value: "+06:00", label: "+06:00 Омск" },
  { value: "+07:00", label: "+07:00 Красноярск" },
  { value: "+08:00", label: "+08:00 Иркутск" },
  { value: "+09:00", label: "+09:00 Якутск" },
  { value: "+10:00", label: "+10:00 Владивосток" },
  { value: "+11:00", label: "+11:00 Магадан" },
  { value: "+12:00", label: "+12:00 Камчатка" },
  { value: "-03:00", label: "−03:00" },
  { value: "-04:00", label: "−04:00" },
  { value: "-05:00", label: "−05:00" },
  { value: "-07:00", label: "−07:00" },
  { value: "-08:00", label: "−08:00" },
];

export type AuthorKind = "Person" | "Organization";

export type AuthorInput = {
  type: AuthorKind;
  name: string;
  url: string;
  jobTitle: string;
  sameAs: string;
};

export type ArticleDraft = {
  type: ArticleType;
  headline: string;
  authors: AuthorInput[];
  datePublished: string;
  dateModified: string;
  timePublished: string;
  timeModified: string;
  timezone: string;
  images: string[];
  articleUrl: string;
  description: string;
  inLanguage: string;
  articleSection: string;
  keywords: string;
  wordCount: string;
  publisherName: string;
  publisherLogo: string;
};

export type AuthorNode = {
  "@type": AuthorKind;
  name: string;
  url?: string;
  jobTitle?: string;
  sameAs?: string;
};

export type ArticleSchema = {
  "@context": "https://schema.org";
  "@type": ArticleType;
  headline?: string;
  description?: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author?: AuthorNode[];
  publisher?: {
    "@type": "Organization";
    name: string;
    logo?: { "@type": "ImageObject"; url: string };
  };
  url?: string;
  mainEntityOfPage?: { "@type": "WebPage"; "@id": string };
  articleSection?: string;
  keywords?: string;
  wordCount?: number;
  inLanguage?: string;
};

export type ArticleBuild = {
  errors: string[];
  warning: string | null;
  schema: ArticleSchema | null;
  json: string | null;
  script: string | null;
};

export function emptyAuthor(): AuthorInput {
  return { type: "Person", name: "", url: "", jobTitle: "", sameAs: "" };
}

export function emptyDraft(): ArticleDraft {
  return {
    type: "Article",
    headline: "",
    authors: [emptyAuthor()],
    datePublished: "",
    dateModified: "",
    timePublished: "",
    timeModified: "",
    timezone: "",
    images: [],
    articleUrl: "",
    description: "",
    inLanguage: "",
    articleSection: "",
    keywords: "",
    wordCount: "",
    publisherName: "",
    publisherLogo: "",
  };
}

export function headlineWarning(headline: string): string | null {
  if ([...headline.trim()].length <= HEADLINE_SOFT_LIMIT) return null;
  return `Длиннее ${HEADLINE_SOFT_LIMIT} символов. Это не ошибка — в код попадёт целиком.`;
}

export function copyOutcome(ok: boolean): {
  copied: boolean;
  copyError: boolean;
  trackCopy: boolean;
} {
  if (ok) return { copied: true, copyError: false, trackCopy: true };
  return { copied: false, copyError: true, trackCopy: false };
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const OFFSET_RE = /^[+-](?:0\d|1[0-4]):[0-5]\d$/;
const BCP47_RE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

export function isHttpUrl(raw: string): boolean {
  return urlProblem(raw) === null && raw.trim() !== "";
}

function urlProblem(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return "нужен абсолютный адрес http или https.";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "нужен абсолютный адрес http или https.";
  }

  if (!parsed.hostname) {
    return "нужен абсолютный адрес http или https.";
  }

  return null;
}

function isRealDate(value: string): boolean {
  const match = DATE_RE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  const iso = date.toISOString().slice(0, 10);
  const expected = `${match[1]}-${match[2]}-${match[3]}`;
  return iso === expected;
}

type BuiltDate = {
  date: string;
  time: string | null;
  iso: string;
};

function buildDate(
  dateRaw: string,
  timeRaw: string,
  timezone: string,
  label: string,
  errors: string[],
): BuiltDate | null {
  const date = dateRaw.trim();
  const time = timeRaw.trim();
  if (!date && !time) return null;

  if (!date) {
    errors.push(`${label}: укажи дату, если ставишь время.`);
    return null;
  }

  if (!isRealDate(date)) {
    errors.push(`${label}: такой даты нет.`);
    return null;
  }

  if (!time) return { date, time: null, iso: date };

  if (!TIME_RE.test(time)) {
    errors.push(`${label}: время в формате ЧЧ:ММ.`);
    return null;
  }

  const offset = timezone.trim();
  if (!offset) {
    pushOnce(errors, "Для времени выбери часовой пояс. Сам он не подставится.");
    return null;
  }

  if (!OFFSET_RE.test(offset)) {
    pushOnce(errors, "Часовой пояс: смещение вида +00:00.");
    return null;
  }

  const clock = time.length === 5 ? `${time}:00` : time;
  return { date, time: clock, iso: `${date}T${clock}${offset}` };
}

function pushOnce(errors: string[], message: string) {
  if (!errors.includes(message)) errors.push(message);
}

function encodeChar(char: string): string {
  const code = char.codePointAt(0);
  if (code === undefined) return char;
  return `\\u${code.toString(16).padStart(4, "0")}`;
}

/** JSON для вставки в HTML: < > & и разделители строк не рвут script. */
export function encodeJsonLd(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/[<>&\u2028\u2029]/g, encodeChar);
}

export function wrapJsonLdScript(json: string): string {
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function authorIsBlank(author: AuthorInput): boolean {
  return (
    !author.name.trim() &&
    !author.url.trim() &&
    !author.jobTitle.trim() &&
    !author.sameAs.trim()
  );
}

function hasPayload(draft: ArticleDraft): boolean {
  if (draft.headline.trim()) return true;
  if (draft.datePublished.trim() || draft.dateModified.trim()) return true;
  if (draft.timePublished.trim() || draft.timeModified.trim()) return true;
  if (draft.images.some((item) => item.trim())) return true;
  if (draft.articleUrl.trim()) return true;
  if (draft.description.trim()) return true;
  if (draft.inLanguage.trim()) return true;
  if (draft.articleSection.trim()) return true;
  if (draft.keywords.trim()) return true;
  if (draft.wordCount.trim()) return true;
  if (draft.publisherName.trim() || draft.publisherLogo.trim()) return true;
  return draft.authors.some((author) => !authorIsBlank(author));
}

export function buildArticleSchema(draft: ArticleDraft): ArticleBuild {
  const warning = headlineWarning(draft.headline);
  const errors: string[] = [];

  if (!hasPayload(draft)) {
    return { errors, warning, schema: null, json: null, script: null };
  }

  if (!ARTICLE_TYPES.some((item) => item.id === draft.type)) {
    errors.push("Неизвестный тип статьи.");
  }

  const headline = draft.headline.trim();
  const description = draft.description.trim();
  const articleSection = draft.articleSection.trim();
  const keywords = draft.keywords.trim();
  const inLanguage = draft.inLanguage.trim();

  if (inLanguage && !BCP47_RE.test(inLanguage)) {
    errors.push("Язык: код вроде ru или ru-RU.");
  }

  let wordCount: number | null = null;
  const wordRaw = draft.wordCount.trim();
  if (wordRaw) {
    if (!/^\d+$/.test(wordRaw) || !Number.isSafeInteger(Number(wordRaw))) {
      errors.push("Число слов: целое число.");
    } else {
      wordCount = Number(wordRaw);
    }
  }

  const images = draft.images.map((item) => item.trim()).filter(Boolean);
  if (images.some((item) => urlProblem(item))) {
    errors.push("Картинка: нужен абсолютный адрес http или https.");
  }

  const articleUrl = draft.articleUrl.trim();
  const articleUrlProblem = urlProblem(articleUrl);
  if (articleUrlProblem) errors.push(`URL статьи: ${articleUrlProblem}`);

  const publisherName = draft.publisherName.trim();
  const publisherLogo = draft.publisherLogo.trim();
  const logoProblem = urlProblem(publisherLogo);
  if (logoProblem) errors.push(`Логотип: ${logoProblem}`);
  if (!publisherName && publisherLogo) {
    errors.push("Для логотипа нужно название издателя.");
  }

  const published = buildDate(
    draft.datePublished,
    draft.timePublished,
    draft.timezone,
    "Дата публикации",
    errors,
  );
  const modified = buildDate(
    draft.dateModified,
    draft.timeModified,
    draft.timezone,
    "Дата изменения",
    errors,
  );

  if (
    published &&
    modified &&
    (published.time && modified.time
      ? Date.parse(modified.iso) < Date.parse(published.iso)
      : modified.date < published.date)
  ) {
    errors.push("Дата изменения раньше даты публикации.");
  }

  const authors: AuthorNode[] = [];
  const multiple = draft.authors.filter((author) => !authorIsBlank(author)).length > 1;

  draft.authors.forEach((author, index) => {
    if (authorIsBlank(author)) return;

    const who = multiple ? `Автор ${index + 1}` : "Автор";
    const name = author.name.trim();
    const url = author.url.trim();
    const jobTitle = author.jobTitle.trim();
    const sameAs = author.sameAs.trim();

    if (author.type !== "Person" && author.type !== "Organization") {
      errors.push(`${who}: тип Person или Organization.`);
    }

    if (!name) {
      errors.push(`${who}: впиши имя или очисти остальные поля.`);
    }

    const authorUrlProblem = urlProblem(url);
    if (authorUrlProblem) errors.push(`${who}: ссылка — ${authorUrlProblem}`);

    const sameAsProblem = urlProblem(sameAs);
    if (sameAsProblem) errors.push(`${who}: sameAs — ${sameAsProblem}`);

    if (jobTitle && author.type !== "Person") {
      errors.push(`${who}: должность только у Person.`);
    }

    if (!name || authorUrlProblem || sameAsProblem) return;
    if (author.type !== "Person" && author.type !== "Organization") return;

    const node: AuthorNode = { "@type": author.type, name };
    if (url) node.url = url;
    if (jobTitle && author.type === "Person") node.jobTitle = jobTitle;
    if (sameAs) node.sameAs = sameAs;
    authors.push(node);
  });

  if (errors.length > 0) {
    return { errors, warning, schema: null, json: null, script: null };
  }

  const schema: ArticleSchema = {
    "@context": "https://schema.org",
    "@type": draft.type,
  };

  if (headline) schema.headline = headline;
  if (description) schema.description = description;
  if (images.length > 0) schema.image = images;
  if (published) schema.datePublished = published.iso;
  if (modified) schema.dateModified = modified.iso;
  if (authors.length > 0) schema.author = authors;

  if (publisherName) {
    schema.publisher = { "@type": "Organization", name: publisherName };
    if (publisherLogo) {
      schema.publisher.logo = { "@type": "ImageObject", url: publisherLogo };
    }
  }

  if (articleUrl) {
    schema.url = articleUrl;
    schema.mainEntityOfPage = { "@type": "WebPage", "@id": articleUrl };
  }

  if (articleSection) schema.articleSection = articleSection;
  if (keywords) schema.keywords = keywords;
  if (wordCount !== null) schema.wordCount = wordCount;
  if (inLanguage) schema.inLanguage = inLanguage;

  const json = encodeJsonLd(schema);
  return {
    errors,
    warning,
    schema,
    json,
    script: wrapJsonLdScript(json),
  };
}
