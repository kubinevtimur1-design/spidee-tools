/**
 * Ориентиры длины сниппета для превью на /counter/.
 * Это не официальные лимиты API — в интерфейсе они подписаны как «ориентир выдачи».
 * Числа можно править здесь, вёрстка подхватит их сама.
 */

export type LimitMode = "title" | "description" | "custom";
export type SnippetRole = "title" | "description";
export type SerpEngine = "google" | "yandex";
export type SerpDevice = "desktop" | "mobile";

/**
 * Свой лимит не длиннее этого порога рисуется как заголовок,
 * длиннее — как описание.
 */
export const CUSTOM_TITLE_STYLE_MAX = 80;

/**
 * Шрифт замера Google. Бюджеты ниже калибровались под Arial.
 * Liberation Sans — метрически близкая замена, если Arial в системе нет
 * (типичный Linux). В canvas и в вёрстке стек один и тот же.
 */
export const SNIPPET_FONT_STACK = 'Arial, "Liberation Sans", sans-serif';

/** Google title: Arial bold 20px. */
export const GOOGLE_TITLE_FONT = `700 20px ${SNIPPET_FONT_STACK}`;
/** Google description: Arial 14px. */
export const GOOGLE_DESC_FONT = `400 14px ${SNIPPET_FONT_STACK}`;

/** Заголовок, десктоп: ~600px, примерно 50–60 символов. */
export const GOOGLE_TITLE_DESKTOP_PX = 600;
/**
 * Заголовок, телефон: ~560px.
 * Запас сознательно уже: на телефоне заголовок часто занимает две строки,
 * но ориентир держим консервативным.
 */
export const GOOGLE_TITLE_MOBILE_PX = 560;
/** Описание, десктоп: ~920px, примерно 150–160 символов. */
export const GOOGLE_DESC_DESKTOP_PX = 920;
/** Описание, телефон: ~680px, примерно 110–130 символов. */
export const GOOGLE_DESC_MOBILE_PX = 680;

/**
 * Доля бюджета, с которой полоска желтеет ещё до обрезки.
 * Сам текст режется только после 100% бюджета.
 */
export const GOOGLE_WARN_RATIO = 0.9;

/**
 * Яндекс не публикует пиксельные лимиты — считаем символы.
 * Заголовок ≈ 60. Описание: предупреждение на 160, иногда строка
 * живёт до ~180–200.
 */
export const YANDEX_TITLE_CHARS = 60;
export const YANDEX_DESC_WARN_CHARS = 160;
export const YANDEX_DESC_HARD_CHARS = 200;

/** Пресеты кнопок счётчика. Совпадают с символьными ориентирами Яндекса. */
export const TITLE_CHAR_PRESET = YANDEX_TITLE_CHARS;
export const DESCRIPTION_CHAR_PRESET = YANDEX_DESC_WARN_CHARS;

export const SERP_URL = "www.spidytools.ru › пример";

/** Короткий пример в пустой карточке — сам по себе влезает. */
export const SAMPLE_TITLE = "Подсчёт символов и превью сниппета";
export const SAMPLE_DESCRIPTION =
  "Пиши title или description — сразу видно, влезет ли текст в выдачу.";

/**
 * Текст кнопки «Подставить пример». Намеренно длиннее лимита,
 * чтобы сразу было видно, где строка обрежется.
 */
export const EXAMPLE_TITLE =
  "Бесплатный подсчёт символов и живое превью сниппета в Google и Яндексе";
export const EXAMPLE_DESCRIPTION =
  "Пиши title или description и сразу смотри, влезет ли текст в выдачу Google и Яндекса. Хвост, который не помещается, покажем отдельно — так проще укоротить фразу до выдачи и не потерять смысл.";

export const ELLIPSIS = "…";

export function snippetRole(mode: LimitMode, customLimit: number): SnippetRole {
  if (mode === "description") return "description";
  if (mode === "title") return "title";
  return customLimit <= CUSTOM_TITLE_STYLE_MAX ? "title" : "description";
}

export function googleBudget(role: SnippetRole, device: SerpDevice): {
  maxPx: number;
  font: string;
} {
  if (role === "title") {
    return {
      maxPx: device === "desktop" ? GOOGLE_TITLE_DESKTOP_PX : GOOGLE_TITLE_MOBILE_PX,
      font: GOOGLE_TITLE_FONT,
    };
  }
  return {
    maxPx: device === "desktop" ? GOOGLE_DESC_DESKTOP_PX : GOOGLE_DESC_MOBILE_PX,
    font: GOOGLE_DESC_FONT,
  };
}

export function yandexCharLimits(role: SnippetRole): { warn: number; hard: number } {
  if (role === "title") {
    return { warn: YANDEX_TITLE_CHARS, hard: YANDEX_TITLE_CHARS };
  }
  return { warn: YANDEX_DESC_WARN_CHARS, hard: YANDEX_DESC_HARD_CHARS };
}
