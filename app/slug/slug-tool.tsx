"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/metrika";
import { useToolUse } from "@/lib/use-tool-use";
import {
  EXAMPLE_HEADLINE,
  EXAMPLE_SLUG,
  SLUG_SOFT_LIMIT,
  toSlug,
} from "./slug";

async function writeClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function SlugTool() {
  const [title, setTitle] = useState("");
  const [preserveCase, setPreserveCase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const slug = useMemo(
    () => toSlug(title, { preserveCase }),
    [title, preserveCase],
  );
  const long = slug.length > SLUG_SOFT_LIMIT;
  const hasTitle = title.trim().length > 0;

  useToolUse("slug", slug);

  const updateTitle = (value: string) => {
    setTitle(value);
    setCopied(false);
    setCopyError(false);
  };

  const fillExample = () => {
    updateTitle(EXAMPLE_HEADLINE);
  };

  const copySlug = async () => {
    if (!slug) return;
    const ok = await writeClipboard(slug);
    if (!ok) {
      setCopied(false);
      setCopyError(true);
      return;
    }
    setCopyError(false);
    setCopied(true);
    track("copy_result");
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          aria-pressed={preserveCase}
          onClick={() => {
            setPreserveCase((current) => !current);
            setCopied(false);
            setCopyError(false);
          }}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium motion-reduce:transition-none ${
            preserveCase
              ? "bg-[#1d1d1f] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
          }`}
        >
          Сохранять регистр
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fillExample}
            className="text-xs font-medium text-gray-600 hover:text-black"
          >
            Подставить пример
          </button>
          {title.length > 0 && (
            <button
              type="button"
              onClick={() => updateTitle("")}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6">
        <label htmlFor="slug-source" className="sr-only">
          Заголовок
        </label>
        <textarea
          id="slug-source"
          value={title}
          onChange={(event) => updateTitle(event.target.value)}
          placeholder="Вставь заголовок страницы…"
          aria-label="Заголовок"
          className="h-32 w-full resize-y bg-transparent text-base leading-relaxed text-gray-900 placeholder-gray-400 focus:outline-none sm:h-40"
        />
        <p className="border-t border-gray-100 pt-4 text-xs leading-5 text-gray-400">
          ё→yo, ж→zh, х→h, й→j. ъ и ь убираем, пробелы становятся дефисами.
        </p>
      </div>

      <div className="space-y-3 rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-400">ЧПУ</div>
            {slug ? (
              <p
                className="mt-2 break-all font-mono text-base text-gray-900 sm:text-lg"
                aria-live="polite"
              >
                {slug}
              </p>
            ) : hasTitle ? (
              <p className="mt-2 text-sm text-gray-500" aria-live="polite">
                Из этих символов адрес не собрать. Добавь слова.
              </p>
            ) : (
              <div aria-live="polite">
                <p className="mt-2 text-sm text-gray-500">
                  Вставь заголовок — slug появится сразу.
                </p>
                <p className="mt-3 text-xs leading-5 text-gray-400">
                  Например, «{EXAMPLE_HEADLINE}»
                </p>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  {EXAMPLE_SLUG}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void copySlug()}
            disabled={!slug}
            className="shrink-0 rounded-full bg-[#1d1d1f] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 motion-reduce:transition-none"
          >
            {copied ? "Скопировано" : "Скопировать"}
          </button>
        </div>

        <span className="sr-only" aria-live="polite">
          {copied ? "Скопировано" : copyError ? "Не вышло скопировать" : ""}
        </span>

        {slug && (
          <p className="text-xs text-gray-500">
            <span className="font-medium tabular-nums text-gray-900">
              {slug.length}
            </span>
            {" симв."}
            {long
              ? ` Длинновато для адреса — лучше до ${SLUG_SOFT_LIMIT}.`
              : ""}
          </p>
        )}

        {copyError && (
          <p role="alert" className="text-xs text-red-600">
            Не вышло скопировать. Выдели slug и скопируй вручную.
          </p>
        )}
      </div>
    </div>
  );
}
