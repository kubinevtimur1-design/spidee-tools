export type Platform =
  | "custom"
  | "google"
  | "yandex"
  | "vk"
  | "telegram";

export type FieldKey =
  | "custom"
  | "title"
  | "description"
  | "text";

export type PlatformField = {
  key: FieldKey;
  label: string;
  limit: number;
  placeholder: string;
  example: string;
};

export type PlatformPreset = {
  id: Platform;
  label: string;
  description: string;
  fields: PlatformField[];
};

export const GOOGLE_TITLE_LIMIT = 60;
export const GOOGLE_DESCRIPTION_LIMIT = 160;

export const YANDEX_TITLE_LIMIT = 60;
export const YANDEX_DESCRIPTION_LIMIT = 160;

export const VK_TITLE_LIMIT = 40;
export const VK_DESCRIPTION_LIMIT = 90;

export const TELEGRAM_ADS_TEXT_LIMIT = 160;

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "custom",
    label: "Свой лимит",
    description: "Укажи собственное ограничение",
    fields: [
      {
        key: "custom",
        label: "Текст",
        limit: 100,
        placeholder: "Напиши или вставь текст…",
        example:
          "Это пример текста для проверки количества символов с собственным лимитом.",
      },
    ],
  },

  {
    id: "google",
    label: "Google",
    description: "Превью поисковой выдачи Google",
    fields: [
      {
        key: "title",
        label: "Title",
        limit: GOOGLE_TITLE_LIMIT,
        placeholder: "Напиши Title…",
        example: "Бесплатные инструменты для маркетолога — Spidy Tools",
      },
      {
        key: "description",
        label: "Description",
        limit: GOOGLE_DESCRIPTION_LIMIT,
        placeholder: "Напиши Description…",
        example:
          "Полезные онлайн-инструменты для ежедневной работы маркетолога: UTM-метки, подсчёт символов, SEO-разметка и другие сервисы.",
      },
    ],
  },

  {
    id: "yandex",
    label: "Яндекс",
    description: "Превью поисковой выдачи Яндекса",
    fields: [
      {
        key: "title",
        label: "Title",
        limit: YANDEX_TITLE_LIMIT,
        placeholder: "Напиши Title…",
        example: "Инструменты для маркетолога онлайн — Spidy Tools",
      },
      {
        key: "description",
        label: "Description",
        limit: YANDEX_DESCRIPTION_LIMIT,
        placeholder: "Напиши Description…",
        example:
          "Бесплатные инструменты для маркетинга и SEO. Генератор UTM-меток, подсчёт символов, Schema-разметка и другие полезные сервисы.",
      },
    ],
  },

  {
    id: "vk",
    label: "VK Реклама",
    description: "Универсальное объявление",
    fields: [
      {
        key: "title",
        label: "Заголовок",
        limit: VK_TITLE_LIMIT,
        placeholder: "Заголовок объявления…",
        example: "Инструменты для маркетолога",
      },
      {
        key: "description",
        label: "Короткое описание",
        limit: VK_DESCRIPTION_LIMIT,
        placeholder: "Текст объявления…",
        example:
          "UTM-метки, SEO-инструменты и другие полезные сервисы для ежедневной работы.",
      },
    ],
  },

  {
    id: "telegram",
    label: "Telegram Ads",
    description: "Sponsored message",
    fields: [
      {
        key: "text",
        label: "Текст объявления",
        limit: TELEGRAM_ADS_TEXT_LIMIT,
        placeholder: "Напиши текст объявления…",
        example:
          "Полезные инструменты для маркетолога: UTM-метки, подсчёт символов и SEO-сервисы. Открывай Spidy Tools и экономь время.",
      },
    ],
  },
];

export function getPlatformPreset(platform: Platform) {
  return PLATFORM_PRESETS.find((item) => item.id === platform)!;
}