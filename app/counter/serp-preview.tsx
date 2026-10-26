"use client";

import type { Platform } from "./serp-limits";

type Props = {
  platform: Platform;
  title: string;
  description: string;
  text: string;
};

const FALLBACK_TITLE = "Spidy Tools — инструменты для маркетолога";
const FALLBACK_DESCRIPTION =
  "Полезные онлайн-инструменты для ежедневной работы маркетолога.";

export default function SerpPreview({
  platform,
  title,
  description,
  text,
}: Props) {
  if (platform === "google") {
    return (
      <PreviewShell label="Google">
        <GooglePreview
          title={title}
          description={description}
        />
      </PreviewShell>
    );
  }

  if (platform === "yandex") {
    return (
      <PreviewShell label="Яндекс">
        <YandexPreview
          title={title}
          description={description}
        />
      </PreviewShell>
    );
  }

  if (platform === "vk") {
    return (
      <PreviewShell label="VK Реклама">
        <VkPreview
          title={title}
          description={description}
        />
      </PreviewShell>
    );
  }

  if (platform === "telegram") {
    return (
      <PreviewShell label="Telegram Ads">
        <TelegramPreview text={text} />
      </PreviewShell>
    );
  }

  return null;
}

function PreviewShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-black/[0.08]">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3">
        <span className="text-xs font-semibold text-[#555555]">
          {label}
        </span>

        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#AAAAAA]">
          превью
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function GooglePreview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-[600px] font-[Arial,sans-serif]">
      <div className="flex items-center gap-3">
        <SiteIcon />

        <div>
          <div className="text-[14px] text-[#202124]">
            Spidy Tools
          </div>

          <div className="text-[12px] text-[#4d5156]">
            https://spidytools.ru
          </div>
        </div>
      </div>

      <div className="mt-2 text-[20px] leading-[1.3] text-[#1a0dab]">
        {title || FALLBACK_TITLE}
      </div>

      <div className="mt-1 text-[14px] leading-[1.5] text-[#4d5156]">
        {description || FALLBACK_DESCRIPTION}
      </div>
    </div>
  );
}

function YandexPreview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-[600px] font-[Arial,sans-serif]">
      <div className="flex items-center gap-2 text-[13px] text-[#067306]">
        <SiteIcon small />
        spidytools.ru
      </div>

      <div className="mt-2 text-[19px] leading-[1.35] text-[#0044bb]">
        {title || FALLBACK_TITLE}
      </div>

      <div className="mt-1 text-[14px] leading-[1.5] text-[#333333]">
        {description || FALLBACK_DESCRIPTION}
      </div>
    </div>
  );
}

function VkPreview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-[430px] rounded-[16px] border border-black/[0.08] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF3830] text-sm font-black text-white">
          S
        </div>

        <div>
          <div className="text-sm font-semibold text-[#0B0B0B]">
            Spidy Tools
          </div>

          <div className="text-[11px] text-[#999999]">
            Реклама
          </div>
        </div>
      </div>

      <div className="mt-5 aspect-[16/9] rounded-xl bg-black/[0.04]">
        <div className="flex h-full items-center justify-center text-5xl font-black text-[#FF3830]">
          *
        </div>
      </div>

      <div className="mt-4 text-base font-bold leading-snug text-[#0B0B0B]">
        {title || "Инструменты для маркетолога"}
      </div>

      <div className="mt-2 text-sm leading-relaxed text-[#555555]">
        {description ||
          "UTM-метки, SEO-инструменты и другие полезные сервисы."}
      </div>

      <button
        type="button"
        tabIndex={-1}
        className="mt-4 w-full rounded-xl bg-black/[0.06] py-2.5 text-xs font-semibold text-[#0B0B0B]"
      >
        Подробнее
      </button>
    </div>
  );
}

function TelegramPreview({
  text,
}: {
  text: string;
}) {
  return (
    <div className="max-w-[430px]">
      <div className="rounded-[16px] bg-[#E9F5FF] p-4">
        <div className="mb-2 text-[11px] font-medium text-[#6B94B3]">
          Sponsored
        </div>

        <p className="whitespace-pre-wrap text-[14px] leading-[1.45] text-[#182533]">
          {text ||
            "Полезные инструменты для маркетолога: UTM-метки, подсчёт символов и SEO-сервисы."}
        </p>

        <div className="mt-4 border-t border-[#CFE4F3] pt-3 text-center text-xs font-semibold text-[#2481CC]">
          Открыть
        </div>
      </div>
    </div>
  );
}

function SiteIcon({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full bg-black/[0.05] font-bold text-[#555555]",
        small
          ? "h-5 w-5 text-[8px]"
          : "h-7 w-7 text-[10px]",
      ].join(" ")}
    >
      S
    </div>
  );
}