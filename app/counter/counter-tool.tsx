"use client";

import React, { useState, useMemo } from "react";

export default function CounterTool() {
  const [textInput, setTextInput] = useState("");
  const [selectedLimitMode, setSelectedLimitMode] = useState<"title" | "description" | "custom">("title");
  const [customLimit, setCustomLimit] = useState(100);

  // Расчет метрик текста
  const stats = useMemo(() => {
    const totalChars = textInput.length;
    const charsWithoutSpaces = textInput.replace(/\s+/g, "").length;
    const wordsCount = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;
    const linesCount = textInput ? textInput.split(/\r\n|\r|\n/).length : 0;

    let targetLimit = 60;
    let label = "Title (Google / Яндекс)";
    if (selectedLimitMode === "description") {
      targetLimit = 160;
      label = "Meta Description";
    } else if (selectedLimitMode === "custom") {
      targetLimit = customLimit || 1;
      label = `Пользовательский (${targetLimit} симв.)`;
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
  }, [textInput, selectedLimitMode, customLimit]);

  const clearText = () => setTextInput("");

  return (
    <div className="space-y-6">
      {/* Кнопки выбора лимитов */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedLimitMode("title")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedLimitMode === "title"
                ? "bg-[#1d1d1f] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Title (~60 симв.)
          </button>
          <button
            onClick={() => setSelectedLimitMode("description")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedLimitMode === "description"
                ? "bg-[#1d1d1f] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Description (~160 симв.)
          </button>
          <button
            onClick={() => setSelectedLimitMode("custom")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedLimitMode === "custom"
                ? "bg-[#1d1d1f] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Свой лимит
          </button>

          {selectedLimitMode === "custom" && (
            <input
              type="number"
              value={customLimit}
              onChange={(e) => setCustomLimit(Number(e.target.value))}
              className="w-24 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-blue-500"
              placeholder="Символов"
              min={1}
            />
          )}
        </div>

        {textInput.length > 0 && (
          <button
            onClick={clearText}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Очистить поле
          </button>
        )}
      </div>

      {/* Поле ввода текста (без тени) */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-4 sm:p-6 space-y-4">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Вставьте заголовок, сниппет или статью для анализа длины..."
          className="w-full h-48 bg-transparent text-gray-900 placeholder-gray-400 text-base leading-relaxed focus:outline-none resize-y"
        />

        {/* Шкала заполнения лимита */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">
              Лимит: <strong className="text-gray-800 font-medium">{stats.label}</strong>
            </span>
            <span
              className={`font-medium ${
                stats.isExceeded ? "text-red-600" : "text-gray-900"
              }`}
            >
              {stats.totalChars} / {stats.targetLimit} симв.
              {stats.isExceeded && ` (превышение на +${stats.totalChars - stats.targetLimit})`}
            </span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                stats.isExceeded ? "bg-red-500" : "bg-blue-600"
              }`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>

          {stats.isExceeded && (
            <p className="text-xs text-red-500 pt-1">
              Текст длиннее рекомендованного лимита. Поисковые системы, скорее всего, обрежут его в выдаче.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
          <div className="text-xs text-gray-400 font-normal">Символов всего</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalChars}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
          <div className="text-xs text-gray-400 font-normal">Без пробелов</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.charsWithoutSpaces}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
          <div className="text-xs text-gray-400 font-normal">Слов</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.wordsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
          <div className="text-xs text-gray-400 font-normal">Строк</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.linesCount}</div>
        </div>
      </div>
    </div>
  );
}