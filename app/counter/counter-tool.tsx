"use client";

import { useMemo, useState } from "react";
import {
  PLATFORM_PRESETS,
  getPlatformPreset,
  type FieldKey,
  type Platform,
} from "./serp-limits";
import SerpPreview from "./serp-preview";

type Values = Record<FieldKey, string>;

const EMPTY_VALUES: Values = {
  custom: "",
  title: "",
  description: "",
  text: "",
};

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function CounterTool() {
  const [platform, setPlatform] = useState<Platform>("custom");
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [customLimit, setCustomLimit] = useState(100);
  const [copiedField, setCopiedField] = useState<FieldKey | null>(null);

  const preset = getPlatformPreset(platform);

  const activeFields = useMemo(() => {
    return preset.fields.map((field) => ({
      ...field,
      limit:
        platform === "custom"
          ? Math.max(1, customLimit || 1)
          : field.limit,
    }));
  }, [preset, platform, customLimit]);

  const combinedText = activeFields
    .map((field) => values[field.key])
    .filter(Boolean)
    .join(" ");

  const totalStats = {
    chars: combinedText.length,
    charsWithoutSpaces: combinedText.replace(/\s+/g, "").length,
    words: countWords(combinedText),
    lines: combinedText
      ? combinedText.split(/\r\n|\r|\n/).length
      : 0,
  };

  const changePlatform = (nextPlatform: Platform) => {
    setPlatform(nextPlatform);
    setCopiedField(null);
  };

  const updateField = (key: FieldKey, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setCopiedField(null);
  };

  const fillExample = () => {
    const next = { ...values };

    preset.fields.forEach((field) => {
      next[field.key] = field.example;
    });

    setValues(next);
    setCopiedField(null);
  };

  const clearFields = () => {
    const next = { ...values };

    preset.fields.forEach((field) => {
      next[field.key] = "";
    });

    setValues(next);
    setCopiedField(null);
  };

  const copyField = async (key: FieldKey) => {
    const value = values[key];

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);

      window.setTimeout(() => {
        setCopiedField(null);
      }, 1500);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* PLATFORM */}

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          className="flex w-max gap-2"
          role="tablist"
          aria-label="Площадка"
        >
          {PLATFORM_PRESETS.map((item) => {
            const selected = platform === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => changePlatform(item.id)}
                className={[
                  "h-10 whitespace-nowrap rounded-xl px-5 text-xs font-medium",
                  "transition-all duration-200 active:scale-[0.97]",
                  selected
                    ? "bg-[#0B0B0B] text-white"
                    : "border border-black/[0.08] text-[#555555] hover:border-black/[0.16] hover:text-[#0B0B0B]",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTROLS */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {platform === "custom" ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#777777]">
              Лимит
            </span>

            <input
              type="number"
              min={1}
              value={customLimit}
              onChange={(event) =>
                setCustomLimit(
                  Math.max(1, Number(event.target.value) || 1)
                )
              }
              className="h-9 w-24 rounded-xl border border-black/[0.1] bg-transparent px-3 text-sm font-semibold text-[#0B0B0B] outline-none transition-colors focus:border-black/[0.3]"
            />

            <span className="text-xs text-[#999999]">
              символов
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={fillExample}
            className="text-xs font-medium text-[#555555] transition-colors hover:text-[#0B0B0B]"
          >
            Подставить пример
          </button>

          {combinedText && (
            <button
              type="button"
              onClick={clearFields}
              className="text-xs font-medium text-[#999999] transition-colors hover:text-[#FF3830]"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* FIELDS */}

      <div className="space-y-3">
        {activeFields.map((field) => {
          const value = values[field.key];
          const length = value.length;
          const exceeded = length > field.limit;

          const percentage = Math.min(
            (length / field.limit) * 100,
            100
          );

          return (
            <div
              key={`${platform}-${field.key}`}
              className="overflow-hidden rounded-[18px] border border-black/[0.08] transition-all duration-300 focus-within:border-black/[0.18] focus-within:shadow-[0_14px_35px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3">
                <span className="text-xs font-semibold text-[#555555]">
                  {field.label}
                </span>

                <div className="flex items-center gap-4">
                  {value && (
                    <button
                      type="button"
                      onClick={() => copyField(field.key)}
                      className="text-[11px] font-medium text-[#999999] transition-colors hover:text-[#0B0B0B]"
                    >
                      {copiedField === field.key
                        ? "Скопировано"
                        : "Скопировать"}
                    </button>
                  )}

                  <span
                    className={[
                      "text-xs font-bold tabular-nums",
                      exceeded
                        ? "text-[#FF3830]"
                        : "text-[#0B0B0B]",
                    ].join(" ")}
                  >
                    {length} / {field.limit}
                  </span>
                </div>
              </div>

              <textarea
                value={value}
                onChange={(event) =>
                  updateField(field.key, event.target.value)
                }
                placeholder={field.placeholder}
                className="min-h-[130px] w-full resize-y bg-transparent px-5 py-5 text-base leading-relaxed text-[#3A3A3A] outline-none placeholder:text-[#AAAAAA] sm:min-h-[150px]"
              />

              <div className="px-5 pb-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className={[
                      "h-full rounded-full transition-all duration-300",
                      exceeded
                        ? "bg-[#FF3830]"
                        : length / field.limit >= 0.9
                          ? "bg-[#D7FF00]"
                          : "bg-[#0B0B0B]",
                    ].join(" ")}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                {exceeded && (
                  <p className="mt-2 text-xs font-medium text-[#FF3830]">
                    Превышение на {length - field.limit} симв.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PREVIEW */}

      {platform !== "custom" && (
        <SerpPreview
          platform={platform}
          title={values.title}
          description={values.description}
          text={values.text}
        />
      )}

      {/* STATS */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Символов"
          value={totalStats.chars}
          featured
        />

        <Stat
          label="Без пробелов"
          value={totalStats.charsWithoutSpaces}
        />

        <Stat
          label="Слов"
          value={totalStats.words}
        />

        <Stat
          label="Строк"
          value={totalStats.lines}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  featured = false,
}: {
  label: string;
  value: number;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "relative min-h-[115px] overflow-hidden rounded-[18px] border p-4 transition-all duration-300 sm:p-5",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)]",
        featured
          ? "border-[#FF3830]/10 bg-[#FF3830]/[0.055]"
          : "border-black/[0.08]",
      ].join(" ")}
    >
      <div className="text-xs font-medium text-[#888888]">
        {label}
      </div>

      <div
        className={[
          "mt-2 text-3xl font-bold tracking-[-0.04em] tabular-nums",
          featured
            ? "text-[#FF3830]"
            : "text-[#0B0B0B]",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}