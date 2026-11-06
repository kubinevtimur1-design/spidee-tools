export type BlogTool = {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: string;
};

export const BLOG_TOOLS: readonly BlogTool[] = [
  {
    id: "utm-generator",
    href: "/utm-generator/",
    title: "Генератор UTM-меток",
    description: "Собрать ссылку с метками по полям.",
    icon: "↗",
  },
  {
    id: "erid",
    href: "/erid/",
    title: "Маркировка erid",
    description: "Пометка «Реклама» и токен в ссылке.",
    icon: "Er",
  },
  {
    id: "qr",
    href: "/qr/",
    title: "QR-код",
    description: "Код из уже размеченной ссылки.",
    icon: "▣",
  },
  {
    id: "counter",
    href: "/counter/",
    title: "Подсчёт символов",
    description: "Длина Title и Description.",
    icon: "T",
  },
  {
    id: "slug",
    href: "/slug/",
    title: "Транслит и ЧПУ",
    description: "Адрес из русского текста.",
    icon: "Aa",
  },
  {
    id: "faq-schema",
    href: "/faq-schema-generator/",
    title: "FAQ Schema",
    description: "JSON-LD для вопросов и ответов.",
    icon: "{}",
  },
];

export function blogToolById(id: string): BlogTool | undefined {
  return BLOG_TOOLS.find((tool) => tool.id === id);
}
