import type { Metadata } from "next";
import { pageMetadata } from "../seo";

export const metadata: Metadata = pageMetadata({
  title:
    "Генератор UTM-меток онлайн — Директ, VK, Google Ads | Spidy Tools",
  description:
    "Соберите UTM-ссылку для Яндекс Директа, VK Рекламы, myTarget и Google Ads. Пресеты площадок и динамические параметры. Бесплатно, без регистрации.",
  path: "/utm-generator/",
  ogTitle: "Генератор UTM-меток онлайн",
  ogDescription:
    "Пресеты Директ, VK, myTarget, Google Ads + динамические параметры.",
});

export default function UtmGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
