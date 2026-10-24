"use client";

import { useMemo, useState } from "react";
import {
  DESCRIPTION_CHAR_PRESET,
  EXAMPLE_DESCRIPTION,
  EXAMPLE_TITLE,
  TITLE_CHAR_PRESET,
  snippetRole,
  type LimitMode,
} from "./serp-limits";
import SerpPreview from "./serp-preview";

function safeLimit(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;
  return value;
}

export default function CounterTool() {
  const [textInput, setTextInput] = useState("");
  const [selectedLimitMode, setSelectedLimitMode] = useState<LimitMode>("title");
  const [customLimit, setCustomLimit] = useState(100);
  const [copied, setCopied] = useState(false);

  const limit = safeLimit(customLimit);

  const stats = useMemo(() => {
    const totalChars = textInput.length;
    const charsWithoutSpaces = textInput.replace(/\s+/g, "").length;
    const wordsCount = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;
    const linesCount = textInput ? textInput.split(/\r\n|\r|\n/).length : 0;

    let targetLimit = TITLE_CHAR_PRESET;
    let label = "Заголовок";
    if (selectedLimitMode === "description") {
      targetLimit = DESCRIPTION_CHAR_PRESET;
      label = "Описание";
    } else if (selectedLimitMode === "custom") {
      targetLimit = limit;
      label = "Свой лимит";
    }

    const percentage = Math.min(Math.round((totalChars / targetLimit) * 100), 100);
    const isExceeded = totalChars > targetLimit;

    return {
      totalChars,
      charsWithoutSpaces,
      wordsCount,
      linesCount,
      targetLimit,
      label,
      percentage,
      isExceeded,
    };
  }, [textInput, selectedLimitMode, limit]);

  const fillExample = () => {
    const role = snippetRole(selectedLimitMode, limit);
    setTextInput(role === "title" ? EXAMPLE_TITLE : EXAMPLE_DESCRIPTION);
    setCopied(false);
  };

  const copyText = () => {
    const field = document.getElementById("snippet-source");
    if (field instanceof HTMLTextAreaElement) {
      const start = field.selectionStart ?? 0;
      const end = field.selectionEnd ?? 0;
      field.focus();
      field.select();
      let copiedOk = false;
      try {
        copiedOk = document.execCommand("copy");
      } catch {
        copiedOk = false;
      }
      field.setSelectionRange(start, end);
      if (copiedOk) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
        return;
      }
    }

    void navigator.clipboard.writeText(textInput).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => setCopied(false),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Что считаем">
          <ModeButton
            selected={selectedLimitMode === "title"}
            onSelect={() => setSelectedLimitMode("title")}
            label="Заголовок"
            hint={`Лимит ${TITLE_CHAR_PRESET} символов`}
          />
          <ModeButton
            selected={selectedLimitMode === "description"}
            onSelect={() => setSelectedLimitMode("description")}
            label="Описание"
            hint={`Лимит ${DESCRIPTION_CHAR_PRESET} символов`}
          />
          <ModeButton
            selected={selectedLimitMode === "custom"}
            onSelect={() => setSelectedLimitMode("custom")}
            label="Свой лимит"
            hint="Задать число символов"
          />

          {selectedLimitMode === "custom" && (
            <input
              type="number"
              value={customLimit}
              onChange={(event) => setCustomLimit(Number(event.target.value))}
              className="w-20 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-blue-500"
              aria-label="Свой лимит, символы"
              min={1}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fillExample}
            className="text-xs font-medium text-gray-600 hover:text-black"
          >
            Подставить пример
          </button>
          {textInput.length > 0 && (
            <>
              <button
                type="button"
                onClick={copyText}
                className="text-xs font-medium text-gray-600 hover:text-black"
              >
                {copied ? "Скопировано" : "Скопировать"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTextInput("");
                  setCopied(false);
                }}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Очистить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 p-4 sm:p-6 space-y-4">
        <textarea
          id="snippet-source"
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder="Напиши title или description…"
          aria-label="Текст для подсчёта и превью"
          className="w-full h-40 sm:h-48 bg-transparent text-gray-900 placeholder-gray-400 text-base leading-relaxed focus:outline-none resize-y"
        />

        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between items-center gap-3 text-xs">
            <span className="text-gray-500">{stats.label}</span>
            <span className={`font-medium tabular-nums ${stats.isExceeded ? "text-red-600" : "text-gray-900"}`}>
              {stats.totalChars} / {stats.targetLimit}
              {stats.isExceeded ? " — обрежется" : ""}
            </span>
          </div>

          <div
            className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"
            role="meter"
            aria-label="Длина текста"
            aria-valuemin={0}
            aria-valuemax={stats.targetLimit}
            aria-valuenow={Math.min(stats.totalChars, stats.targetLimit)}
          >
            <div
              className={`h-full transition-all duration-300 motion-reduce:transition-none ${
                stats.isExceeded ? "bg-red-500" : "bg-blue-600"
              }`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>

          {stats.isExceeded && (
            <p className="text-xs text-red-600 pt-1">Обрежется в выдаче.</p>
          )}
        </div>
      </div>

      <SerpPreview text={textInput} mode={selectedLimitMode} customLimit={limit} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Символов" value={stats.totalChars} />
        <Stat label="Без пробелов" value={stats.charsWithoutSpaces} />
        <Stat label="Слов" value={stats.wordsCount} />
        <Stat label="Строк" value={stats.linesCount} />
      </div>
    </div>
  );
}

function ModeButton({
  selected,
  onSelect,
  label,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title={hint}
      onClick={onSelect}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium motion-reduce:transition-none ${
        selected ? "bg-[#1d1d1f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
      }`}
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
      <div className="text-xs text-gray-400 font-normal">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value}</div>
    </div>
  );
}
