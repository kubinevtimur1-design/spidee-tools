"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/metrika";
import { useToolUse } from "@/lib/use-tool-use";

const PAPER = "#F7F5F2";
const INK = "#242424";
const RED = "#FF3830";
const ACID = "#D7FF00";
const PREVIEW = 320;

type DotType =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

type CornerType =
  | "square"
  | "dot"
  | "extra-rounded"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded";

type Ecc = "L" | "M" | "Q" | "H";

type Preset = {
  id: string;
  name: string;
  note: string;
  dots: DotType;
  corners: CornerType;
  cornerDot: CornerType;
  fg: string;
  corner: string;
  bg: string;
};

type QrApi = {
  append: (el: HTMLElement) => void;
  update: (options: Record<string, unknown>) => void;
  getRawData: (extension?: "png" | "svg") => Promise<Blob | null>;
};

const PRESETS: Preset[] = [
  {
    id: "spidy",
    name: "Spidy",
    note: "Бумага и красные углы",
    dots: "rounded",
    corners: "extra-rounded",
    cornerDot: "dot",
    fg: INK,
    corner: RED,
    bg: PAPER,
  },
  {
    id: "classic",
    name: "Classic",
    note: "Лучше всего сканируется",
    dots: "square",
    corners: "square",
    cornerDot: "square",
    fg: "#111111",
    corner: "#111111",
    bg: "#FFFFFF",
  },
  {
    id: "acid",
    name: "Acid",
    note: "Кислотный фон",
    dots: "classy-rounded",
    corners: "extra-rounded",
    cornerDot: "dot",
    fg: INK,
    corner: "#161616",
    bg: ACID,
  },
  {
    id: "dots",
    name: "Dots",
    note: "Мягкие точки",
    dots: "dots",
    corners: "dot",
    cornerDot: "dot",
    fg: INK,
    corner: RED,
    bg: "#FFFFFF",
  },
  {
    id: "classy",
    name: "Classy",
    note: "Скруглённые модули",
    dots: "classy",
    corners: "extra-rounded",
    cornerDot: "dot",
    fg: "#1D1D1D",
    corner: RED,
    bg: PAPER,
  },
  {
    id: "night",
    name: "Night",
    note: "Тёмный фон",
    dots: "extra-rounded",
    corners: "extra-rounded",
    cornerDot: "dot",
    fg: PAPER,
    corner: RED,
    bg: INK,
  },
];

const DOT_OPTIONS: { value: DotType; label: string }[] = [
  { value: "square", label: "Квадрат" },
  { value: "rounded", label: "Скругление" },
  { value: "extra-rounded", label: "Сильное скругление" },
  { value: "dots", label: "Точки" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
];

const CORNER_OPTIONS: { value: CornerType; label: string }[] = [
  { value: "square", label: "Квадрат" },
  { value: "rounded", label: "Скругление" },
  { value: "extra-rounded", label: "Капсула" },
  { value: "dot", label: "Круг" },
  { value: "dots", label: "Точки" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
];

function luminance(hex: string) {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return 0;

  const channels = [0, 2, 4].map((index) => {
    const value = parseInt(raw.slice(index, index + 2), 16) / 255;

    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

function contrast(a: string, b: string) {
  const left = luminance(a);
  const right = luminance(b);
  const [hi, lo] = left > right ? [left, right] : [right, left];

  return (hi + 0.05) / (lo + 0.05);
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function DecorativeQr() {
  const cells = [
    0, 1, 2, 3, 4, 6, 7, 8, 9, 10,
    12, 16, 18, 22, 24, 26, 28, 30,
    32, 34, 36, 38, 40, 42, 44, 46,
    48, 50, 52, 54, 56, 58, 60, 62,
    64, 66, 68, 70, 72, 74, 76, 78,
    80, 82, 84, 86, 88, 90, 92, 94,
    96, 98, 100, 102, 104, 106, 108,
    110, 112, 114, 116, 118, 120,
  ];

  return (
    <div className="decorative-qr" aria-hidden="true">
      <div className="decorative-qr-grid">
        {Array.from({ length: 121 }).map((_, index) => (
          <span
            key={index}
            className={cells.includes(index) ? "is-filled" : ""}
          />
        ))}
      </div>

      <span className="decorative-qr-star">*</span>
    </div>
  );
}

export default function QrStudio() {
  const search = useSearchParams();

  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<QrApi | null>(null);
  const optionsRef = useRef<Record<string, unknown>>({});
  const busyRef = useRef(false);
  const seededRef = useRef(false);

  const [data, setData] = useState("https://spidytools.ru");
  const [dots, setDots] = useState<DotType>("rounded");
  const [corners, setCorners] =
    useState<CornerType>("extra-rounded");
  const [cornerDot, setCornerDot] =
    useState<CornerType>("dot");

  const [fg, setFg] = useState(INK);
  const [cornerColor, setCornerColor] = useState(RED);
  const [bg, setBg] = useState(PAPER);

  const [ecc, setEcc] = useState<Ecc>("Q");
  const [margin, setMargin] = useState(16);
  const [pngSize, setPngSize] = useState(2048);

  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [working, setWorking] = useState<
    "png" | "svg" | "copy" | null
  >(null);

  const payload = data.trim();
  useToolUse("qr", payload);
  const ratio = contrast(fg, bg);
  const lowContrast = ratio < 3;

  const activePreset =
    PRESETS.find(
      (preset) =>
        preset.dots === dots &&
        preset.corners === corners &&
        preset.cornerDot === cornerDot &&
        preset.fg.toLowerCase() === fg.toLowerCase() &&
        preset.corner.toLowerCase() ===
          cornerColor.toLowerCase() &&
        preset.bg.toLowerCase() === bg.toLowerCase(),
    )?.id ?? null;

  const options = useMemo(
    () => ({
      width: PREVIEW,
      height: PREVIEW,
      type: "svg",
      shape: "square",
      data: payload || "https://spidytools.ru",
      margin,
      qrOptions: {
        errorCorrectionLevel: ecc,
      },
      dotsOptions: {
        type: dots,
        color: fg,
      },
      cornersSquareOptions: {
        type: corners,
        color: cornerColor,
      },
      cornersDotOptions: {
        type: cornerDot,
        color: cornerColor,
      },
      backgroundOptions: {
        color: bg,
      },
    }),
    [
      payload,
      margin,
      ecc,
      dots,
      fg,
      corners,
      cornerDot,
      cornerColor,
      bg,
    ],
  );

  optionsRef.current = options;

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    const fromQuery = search.get("data");
    if (fromQuery) setData(fromQuery.slice(0, 2000));
  }, [search]);

  useEffect(() => {
    let dead = false;

    (async () => {
      const { default: QRCodeStyling } = await import(
        "qr-code-styling"
      );

      if (dead || !hostRef.current) return;

      const qr = new QRCodeStyling(
        optionsRef.current,
      ) as QrApi;

      hostRef.current.innerHTML = "";
      qr.append(hostRef.current);

      apiRef.current = qr;
      setReady(true);
    })();

    return () => {
      dead = true;
      apiRef.current = null;

      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    apiRef.current?.update(options);
  }, [options]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(
      () => setNotice(null),
      1800,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);

  function applyPreset(preset: Preset) {
    setDots(preset.dots);
    setCorners(preset.corners);
    setCornerDot(preset.cornerDot);
    setFg(preset.fg);
    setCornerColor(preset.corner);
    setBg(preset.bg);
  }

  async function renderBlob(
    extension: "png" | "svg",
    size = PREVIEW,
  ) {
    const qr = apiRef.current;

    if (!qr || !payload || busyRef.current) {
      return null;
    }

    busyRef.current = true;

    const exportMargin =
      extension === "svg"
        ? margin
        : Math.max(
            24,
            Math.round(margin * (size / PREVIEW)),
          );

    try {
      qr.update({
        ...optionsRef.current,
        data: payload,
        width: extension === "svg" ? 1024 : size,
        height: extension === "svg" ? 1024 : size,
        margin: exportMargin,
      });

      await new Promise((resolve) =>
        requestAnimationFrame(resolve),
      );

      return await qr.getRawData(extension);
    } finally {
      qr.update(optionsRef.current);
      busyRef.current = false;
    }
  }

  async function download(extension: "png" | "svg") {
    if (!payload) return;

    setWorking(extension);

    try {
      const blob = await renderBlob(
        extension,
        extension === "png" ? pngSize : PREVIEW,
      );

      if (!blob) {
        setNotice("Не удалось собрать файл");
        return;
      }

      saveBlob(
        blob,
        extension === "svg"
          ? "spidy-qr.svg"
          : "spidy-qr.png",
      );
      track("export_file");

      setNotice(
        extension === "svg"
          ? "SVG скачан"
          : "PNG скачан",
      );
    } catch {
      setNotice("Не удалось скачать файл");
    } finally {
      setWorking(null);
    }
  }

  async function copyPng() {
    if (!payload) return;

    setWorking("copy");

    try {
      const blob = await renderBlob("png", 1024);

      if (!blob) {
        throw new Error("empty");
      }

      const png = new Blob(
        [await blob.arrayBuffer()],
        {
          type: "image/png",
        },
      );

      if (
        !("ClipboardItem" in window) ||
        !navigator.clipboard?.write
      ) {
        saveBlob(png, "spidy-qr.png");
        track("export_file");
        setNotice(
          "Браузер не копирует картинки — PNG скачан",
        );
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": png,
        }),
      ]);
      track("export_file");

      setNotice("PNG скопирован");
    } catch {
      setNotice("Не удалось скопировать PNG");
    } finally {
      setWorking(null);
    }
  }

  return (
    <main className="qr-page min-h-screen bg-[#F7F5F2] text-[#242424]">
      <DecorativeQr />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-32 sm:pt-14">
        <div className="mb-7 text-[13px] text-black/40 sm:mb-9">
          <a
            href="/"
            className="transition-colors hover:text-black/70"
          >
            Главная
          </a>

          <span className="mx-2 text-black/20">/</span>

          Генератор QR
        </div>

        <header className="qr-hero">
          <div className="qr-hero-title">
            <span className="hero-star" aria-hidden="true">
              *
            </span>

            <h1>
              Генератор
              <br />
              QR-кода
            </h1>
          </div>

          <p>
            Вставь ссылку и получи QR. Бесплатно и без
            регистрации.
          </p>

          <a className="qr-crosslink" href="/utm-generator/">
            Нужна ссылка с метками? → UTM-генератор
          </a>
        </header>

        <div className="studio-layout">
          <section className="settings-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  Настройки
                </span>
                <h2>Что закодировать</h2>
              </div>

              <span className="panel-number">
                01
              </span>
            </div>

            <div className="settings-card">
              <label
                className="field-group"
                htmlFor="qr-data"
              >
                <span className="field-label">
                  Ссылка или текст
                </span>

                <textarea
                  id="qr-data"
                  value={data}
                  onChange={(event) =>
                    setData(
                      event.target.value.slice(0, 2000),
                    )
                  }
                  rows={4}
                  placeholder="https://spidytools.ru"
                  className="text-field"
                />
              </label>

              <div className="field-meta">
                <span>{data.length} / 2000</span>

                <a href="/utm-generator/">
                  Собрать UTM-ссылку
                </a>
              </div>

              <div className="settings-divider" />

              <div>
                <span className="field-label">
                  Стиль
                </span>

                <div className="preset-grid">
                  {PRESETS.map((preset) => {
                    const active =
                      activePreset === preset.id;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          applyPreset(preset)
                        }
                        className="preset-card"
                        aria-pressed={active}
                      >
                        <span
                          className="preset-preview"
                          style={{
                            background: preset.bg,
                          }}
                          aria-hidden="true"
                        >
                          <i
                            style={{
                              background: preset.fg,
                            }}
                          />
                          <i
                            style={{
                              background:
                                preset.corner,
                            }}
                          />
                          <i
                            style={{
                              background: preset.fg,
                            }}
                          />
                          <i
                            style={{
                              background:
                                preset.corner,
                            }}
                          />
                        </span>

                        <span className="preset-copy">
                          <strong>
                            {preset.name}
                          </strong>

                          <small>
                            {preset.note}
                          </small>
                        </span>

                        {active && (
                          <span
                            className="preset-check"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="settings-divider" />

              <div className="color-grid">
                <ColorField
                  label="Модули"
                  value={fg}
                  onChange={setFg}
                />

                <ColorField
                  label="Углы"
                  value={cornerColor}
                  onChange={setCornerColor}
                />

                <ColorField
                  label="Фон"
                  value={bg}
                  onChange={setBg}
                />
              </div>

              <div className="select-grid">
                <SelectField
                  label="Форма точек"
                  value={dots}
                  options={DOT_OPTIONS}
                  onChange={(value) =>
                    setDots(value as DotType)
                  }
                />

                <SelectField
                  label="Форма углов"
                  value={corners}
                  options={CORNER_OPTIONS}
                  onChange={(value) =>
                    setCorners(value as CornerType)
                  }
                />
              </div>

              <div className="advanced-grid">
                <SelectField
                  label="Центр угла"
                  value={cornerDot}
                  options={CORNER_OPTIONS}
                  onChange={(value) =>
                    setCornerDot(
                      value as CornerType,
                    )
                  }
                />

                <SelectField
                  label="Коррекция"
                  value={ecc}
                  options={[
                    {
                      value: "L",
                      label: "L · 7%",
                    },
                    {
                      value: "M",
                      label: "M · 15%",
                    },
                    {
                      value: "Q",
                      label: "Q · 25%",
                    },
                    {
                      value: "H",
                      label: "H · 30%",
                    },
                  ]}
                  onChange={(value) =>
                    setEcc(value as Ecc)
                  }
                />

                <label className="range-field">
                  <span className="field-label">
                    Поле
                    <span>{margin}px</span>
                  </span>

                  <input
                    type="range"
                    min={0}
                    max={48}
                    step={4}
                    value={margin}
                    onChange={(event) =>
                      setMargin(
                        Number(event.target.value),
                      )
                    }
                    className="qr-range"
                    aria-label="Тихое поле вокруг кода"
                  />
                </label>
              </div>

              {lowContrast && (
                <div className="contrast-warning">
                  <span
                    className="warning-star"
                    aria-hidden="true"
                  >
                    *
                  </span>

                  <p>
                    Контраст слабый{" "}
                    <strong>
                      {ratio.toFixed(1)}:1
                    </strong>
                    . Для уверенного сканирования
                    увеличь разницу между цветом
                    модулей и фоном.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="preview-section">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  Результат
                </span>
                <h2>Готовый код</h2>
              </div>

              <span className="panel-number">
                02
              </span>
            </div>

            <div className="preview-card">
              <div className="preview-top">
                <div className="preview-status">
                  <span
                    className={
                      ready
                        ? "status-dot is-ready"
                        : "status-dot"
                    }
                  />

                  {ready ? "Готов" : "Собираем"}
                </div>

                <span className="preset-name">
                  {activePreset ?? "Custom"}
                </span>
              </div>

              <div className="preview-body">
                <span
                  className="preview-star"
                  aria-hidden="true"
                >
                  *
                </span>

                <div
                  className="qr-preview"
                  style={{
                    background: bg,
                  }}
                >
                  <div
                    ref={hostRef}
                    className="qr-host"
                  />

                  {!ready && (
                    <div className="qr-loading">
                      Собираем
                    </div>
                  )}
                </div>

                {!payload && (
                  <p className="empty-message">
                    Введи текст или ссылку, чтобы
                    скачать QR-код.
                  </p>
                )}

                <p
                  className="sr-only"
                  aria-live="polite"
                >
                  {notice}
                </p>

                {notice && (
                  <div className="qr-notice">
                    {notice}
                  </div>
                )}
              </div>

              <div className="export-actions">
                <button
                  type="button"
                  className="action action-primary"
                  disabled={
                    !payload ||
                    !ready ||
                    working !== null
                  }
                  onClick={() => download("svg")}
                >
                  <span>
                    {working === "svg"
                      ? "Собираем..."
                      : "Скачать SVG"}
                  </span>

                  <span aria-hidden="true">↓</span>
                </button>

                <button
                  type="button"
                  className="action action-primary"
                  disabled={
                    !payload ||
                    !ready ||
                    working !== null
                  }
                  onClick={() => download("png")}
                >
                  <span>
                    {working === "png"
                      ? "Собираем..."
                      : "Скачать PNG"}
                  </span>

                  <span aria-hidden="true">↓</span>
                </button>

                <button
                  type="button"
                  className="action action-secondary"
                  disabled={
                    !payload ||
                    !ready ||
                    working !== null
                  }
                  onClick={copyPng}
                >
                  <span>
                    {working === "copy"
                      ? "Копируем..."
                      : "Копировать PNG"}
                  </span>

                  <CopyIcon />
                </button>
              </div>

              <div className="png-size-row">
                <div>
                  <strong>Размер PNG</strong>
                  <span>
                    SVG масштабируется без потери
                    качества
                  </span>
                </div>

                <select
                  id="png-size"
                  value={pngSize}
                  onChange={(event) =>
                    setPngSize(
                      Number(event.target.value),
                    )
                  }
                  className="png-size-select"
                >
                  <option value={1024}>
                    1024 px
                  </option>
                  <option value={2048}>
                    2048 px
                  </option>
                  <option value={4096}>
                    4096 px
                  </option>
                </select>
              </div>
            </div>

            <p className="preview-note">
              Для печати лучше использовать SVG.
              Перед публикацией проверь QR-код камерой,
              особенно если менял цвета.
            </p>
          </section>
        </div>

        <section className="guide-section">
          <div className="guide-heading">
            <span className="eyebrow">
              Как пользоваться
            </span>

            <h2>
              Четыре шага —
              <br />
              и готово.
            </h2>
          </div>

          <div className="guide-list">
            <GuideItem
              number="01"
              title="Вставь данные"
              text="Ссылку, обычный текст, телефон или email."
            />

            <GuideItem
              number="02"
              title="Выбери стиль"
              text="Можно использовать готовый пресет или настроить цвета и форму вручную."
            />

            <GuideItem
              number="03"
              title="Проверь камерой"
              text="Особенно если менял фон и цвета. Высокий контраст считывается надёжнее."
            />

            <GuideItem
              number="04"
              title="Скачай"
              text="SVG — для макетов и печати. PNG — для презентаций, сайтов и сообщений."
            />
          </div>
        </section>

        <section className="faq-section">
          <div className="faq-heading">
            <span className="eyebrow">
              Вопросы
            </span>

            <h2>Если что-то непонятно</h2>
          </div>

          <div className="faq-grid">
            <Faq
              q="Можно ли красить QR-код?"
              a="Да. Главное — сохранить хороший контраст между модулями и фоном и не прятать три угловых маркера."
            />

            <Faq
              q="Что выбрать для печати?"
              a="SVG и уровень коррекции Q или H. Вектор можно масштабировать без потери качества."
            />

            <Faq
              q="Почему QR-код не читается?"
              a="Чаще всего мешают близкие цвета или слишком маленькое поле вокруг кода. Для проверки можно вернуться к пресету Classic."
            />
          </div>
        </section>
      </div>

      <style jsx global>{`
        .qr-page {
          --paper: #f7f5f2;
          --ink: #242424;
          --red: #ff3830;
          --acid: #d7ff00;

          position: relative;
          overflow: hidden;
        }

        .decorative-qr {
          position: absolute;
          z-index: 0;
          top: 78px;
          right: -55px;
          width: min(36vw, 430px);
          aspect-ratio: 1;
          opacity: 0.055;
          pointer-events: none;
          transform: rotate(7deg);
          mask-image: linear-gradient(
            135deg,
            #000 20%,
            rgba(0, 0, 0, 0.65) 58%,
            transparent 88%
          );
          -webkit-mask-image: linear-gradient(
            135deg,
            #000 20%,
            rgba(0, 0, 0, 0.65) 58%,
            transparent 88%
          );
        }

        .decorative-qr-grid {
          display: grid;
          width: 100%;
          height: 100%;
          grid-template-columns: repeat(11, 1fr);
          grid-template-rows: repeat(11, 1fr);
          gap: 5px;
        }

        .decorative-qr-grid span {
          border-radius: 4px;
        }

        .decorative-qr-grid .is-filled {
          background: var(--ink);
        }

        .decorative-qr-star {
          position: absolute;
          top: 23%;
          left: 36%;
          color: var(--red);
          font-size: 90px;
          font-weight: 800;
          line-height: 1;
        }

        .qr-hero {
          position: relative;
          max-width: 900px;
          margin-bottom: 68px;
        }

        .qr-hero-title {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .hero-star {
          flex: 0 0 auto;
          margin-top: -0.05em;
          color: var(--red);
          font-size: clamp(68px, 8vw, 108px);
          font-weight: 700;
          line-height: 0.9;
          letter-spacing: -0.08em;
          transform: rotate(-7deg);
        }

        .qr-hero h1 {
          max-width: 820px;
          color: var(--ink);
          font-size: clamp(48px, 7.3vw, 94px);
          font-weight: 700;
          line-height: 0.9;
          letter-spacing: -0.065em;
        }

        .qr-hero > p {
          max-width: 610px;
          margin-top: 24px;
          margin-left: 78px;
          color: rgba(36, 36, 36, 0.52);
          font-size: clamp(16px, 1.55vw, 19px);
          line-height: 1.5;
          letter-spacing: -0.025em;
        }

        .qr-crosslink {
          position: relative;
          z-index: 0;
          display: inline-block;
          margin-top: 14px;
          margin-left: 78px;
          color: rgba(36, 36, 36, 0.52);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.02em;
          text-decoration: none;
          transition: color 160ms ease;
        }

        .qr-crosslink::after {
          content: "";
          position: absolute;
          z-index: -1;
          right: -0.1em;
          bottom: -0.05em;
          left: -0.1em;
          height: 0.45em;
          background: var(--acid);
          opacity: 0;
          transform: rotate(-1deg) scaleX(0.75);
          transform-origin: left;
          transition:
            opacity 160ms ease,
            transform 180ms ease;
        }

        .qr-crosslink:hover {
          color: var(--ink);
        }

        .qr-crosslink:hover::after {
          opacity: 0.9;
          transform: rotate(-1deg) scaleX(1);
        }

        .studio-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr)
            minmax(340px, 0.88fr);
          align-items: start;
          gap: 32px;
        }

        .preview-section {
          position: sticky;
          top: 88px;
        }

        .panel-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 13px;
          padding: 0 3px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 4px;
          color: rgba(36, 36, 36, 0.34);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .panel-heading h2 {
          color: var(--ink);
          font-size: 25px;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        .panel-number {
          color: rgba(36, 36, 36, 0.18);
          font-size: 12px;
          font-weight: 700;
        }

        .settings-card,
        .preview-card {
          border: 1px solid rgba(36, 36, 36, 0.1);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.38);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.78),
            0 18px 55px rgba(36, 36, 36, 0.035);
        }

        .settings-card {
          padding: 22px;
        }

        .field-group {
          display: block;
        }

        .field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
          color: rgba(36, 36, 36, 0.56);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .field-label > span {
          color: rgba(36, 36, 36, 0.34);
          font-weight: 600;
        }

        .text-field {
          width: 100%;
          min-height: 112px;
          resize: vertical;
          border: 1px solid rgba(36, 36, 36, 0.11);
          border-radius: 12px;
          background: rgba(247, 245, 242, 0.72);
          padding: 13px 14px;
          color: var(--ink);
          font-size: 14px;
          font-weight: 450;
          line-height: 1.55;
          letter-spacing: -0.015em;
          outline: none;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .text-field::placeholder {
          color: rgba(36, 36, 36, 0.27);
        }

        .text-field:focus {
          border-color: rgba(36, 36, 36, 0.28);
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 0 0 3px rgba(215, 255, 0, 0.28);
        }

        .field-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 7px;
          padding: 0 2px;
          color: rgba(36, 36, 36, 0.32);
          font-size: 10px;
          font-weight: 600;
        }

        .field-meta a {
          position: relative;
          z-index: 0;
          color: rgba(36, 36, 36, 0.52);
          text-decoration: none;
          transition: color 160ms ease;
        }

        .field-meta a::after {
          content: "";
          position: absolute;
          z-index: -1;
          right: -0.1em;
          bottom: -0.05em;
          left: -0.1em;
          height: 0.45em;
          background: var(--acid);
          opacity: 0;
          transform: rotate(-1deg) scaleX(0.75);
          transform-origin: left;
          transition:
            opacity 160ms ease,
            transform 180ms ease;
        }

        .field-meta a:hover {
          color: var(--ink);
        }

        .field-meta a:hover::after {
          opacity: 0.9;
          transform: rotate(-1deg) scaleX(1);
        }

        .settings-divider {
          height: 1px;
          margin: 22px 0;
          background: rgba(36, 36, 36, 0.075);
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .preset-card {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 68px;
          align-items: center;
          gap: 9px;
          padding: 9px;
          border: 1px solid rgba(36, 36, 36, 0.09);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.48);
          color: var(--ink);
          cursor: pointer;
          text-align: left;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .preset-card:hover {
          border-color: rgba(36, 36, 36, 0.18);
          background: rgba(255, 255, 255, 0.78);
          transform: translateY(-1px);
        }

        .preset-card[aria-pressed="true"] {
          border-color: rgba(36, 36, 36, 0.22);
          background: rgba(215, 255, 0, 0.3);
          box-shadow: inset 0 0 0 1px
            rgba(36, 36, 36, 0.04);
        }

        .preset-preview {
          display: grid;
          width: 36px;
          height: 36px;
          flex: 0 0 auto;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 3px;
          padding: 5px;
          border: 1px solid rgba(36, 36, 36, 0.09);
          border-radius: 8px;
        }

        .preset-preview i {
          display: block;
          border-radius: 2px;
        }

        .preset-preview i:nth-child(2),
        .preset-preview i:nth-child(3) {
          border-radius: 50%;
        }

        .preset-copy {
          min-width: 0;
        }

        .preset-copy strong {
          display: block;
          overflow: hidden;
          color: var(--ink);
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .preset-copy small {
          display: block;
          overflow: hidden;
          margin-top: 3px;
          color: rgba(36, 36, 36, 0.38);
          font-size: 9px;
          font-weight: 500;
          line-height: 1.2;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .preset-check {
          position: absolute;
          top: 6px;
          right: 7px;
          color: var(--red);
          font-size: 10px;
          font-weight: 800;
        }

        .color-grid,
        .advanced-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .select-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 15px;
        }

        .advanced-grid {
          margin-top: 15px;
        }

        .color-control {
          display: flex;
          height: 43px;
          align-items: center;
          gap: 8px;
          padding: 5px 9px 5px 5px;
          border: 1px solid rgba(36, 36, 36, 0.1);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.48);
        }

        .qr-page input[type="color"] {
          width: 31px;
          height: 31px;
          flex: 0 0 auto;
          padding: 0;
          overflow: hidden;
          border: 0;
          border-radius: 7px;
          background: transparent;
          cursor: pointer;
        }

        .qr-page input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        .qr-page input[type="color"]::-webkit-color-swatch {
          border: 0;
          border-radius: 7px;
        }

        .color-value {
          min-width: 0;
          overflow: hidden;
          color: rgba(36, 36, 36, 0.52);
          font-size: 10px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-control,
        .png-size-select {
          width: 100%;
          height: 43px;
          border: 1px solid rgba(36, 36, 36, 0.1);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.48);
          padding: 0 10px;
          color: var(--ink);
          font-size: 11px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition:
            border-color 160ms ease,
            background 160ms ease;
        }

        .select-control:hover,
        .select-control:focus,
        .png-size-select:hover,
        .png-size-select:focus {
          border-color: rgba(36, 36, 36, 0.22);
          background: rgba(255, 255, 255, 0.78);
        }

        .range-field {
          display: block;
        }

        .qr-range {
          width: 100%;
          height: 43px;
          margin: 0;
          accent-color: var(--red);
          cursor: pointer;
        }

        .contrast-warning {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 17px;
          padding: 11px 12px;
          border: 1px solid rgba(255, 56, 48, 0.18);
          border-radius: 10px;
          background: rgba(255, 56, 48, 0.055);
          color: rgba(36, 36, 36, 0.62);
          font-size: 11px;
          line-height: 1.45;
        }

        .warning-star {
          flex: 0 0 auto;
          color: var(--red);
          font-size: 20px;
          font-weight: 800;
          line-height: 0.9;
        }

        .contrast-warning strong {
          color: var(--ink);
        }

        .preview-card {
          overflow: hidden;
        }

        .preview-top {
          display: flex;
          min-height: 48px;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 16px;
          border-bottom: 1px solid
            rgba(36, 36, 36, 0.075);
        }

        .preview-status {
          display: flex;
          align-items: center;
          gap: 7px;
          color: rgba(36, 36, 36, 0.5);
          font-size: 10px;
          font-weight: 650;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(36, 36, 36, 0.2);
        }

        .status-dot.is-ready {
          background: var(--acid);
          box-shadow: 0 0 0 2px
            rgba(36, 36, 36, 0.08);
        }

        .preset-name {
          color: rgba(36, 36, 36, 0.28);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .preview-body {
          position: relative;
          padding: 28px 28px 24px;
        }

        .preview-star {
          position: absolute;
          top: 12px;
          right: 17px;
          color: var(--red);
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
          pointer-events: none;
          transform: rotate(8deg);
        }

        .qr-preview {
          position: relative;
          display: flex;
          width: min(100%, 330px);
          aspect-ratio: 1;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          padding: 13px;
          border: 1px solid rgba(36, 36, 36, 0.1);
          border-radius: 16px;
          box-shadow: 0 14px 40px
            rgba(36, 36, 36, 0.045);
          transition: background 160ms ease;
        }

        .qr-host {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
        }

        .qr-host svg {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .qr-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: inherit;
          background: var(--paper);
          color: rgba(36, 36, 36, 0.35);
          font-size: 10px;
          font-weight: 700;
        }

        .empty-message {
          margin-top: 12px;
          color: rgba(36, 36, 36, 0.4);
          font-size: 10px;
          text-align: center;
        }

        .qr-notice {
          position: absolute;
          z-index: 10;
          bottom: 35px;
          left: 50%;
          max-width: calc(100% - 32px);
          padding: 7px 10px;
          border-radius: 8px;
          background: var(--ink);
          color: white;
          font-size: 10px;
          font-weight: 650;
          line-height: 1.35;
          text-align: center;
          transform: translateX(-50%);
          animation: notice-in 160ms ease-out;
        }

        @keyframes notice-in {
          from {
            opacity: 0;
            transform: translate(-50%, 5px);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .export-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 0 14px 14px;
        }

        .action {
          display: flex;
          min-height: 44px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 13px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 160ms ease,
            background 160ms ease,
            color 160ms ease,
            border-color 160ms ease;
        }

        .action:disabled {
          cursor: not-allowed;
          opacity: 0.32;
        }

        .action:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .action-primary {
          border: 1px solid var(--ink);
          background: var(--ink);
          color: white;
        }

        .action-primary > span:last-child {
          color: var(--acid);
          font-size: 16px;
        }

        .action-primary:not(:disabled):hover {
          border-color: var(--red);
          background: var(--red);
        }

        .action-primary:not(:disabled):hover
          > span:last-child {
          color: white;
        }

        .action-secondary {
          grid-column: 1 / -1;
          border: 1px solid rgba(36, 36, 36, 0.11);
          background: rgba(255, 255, 255, 0.5);
          color: var(--ink);
        }

        .action-secondary:not(:disabled):hover {
          border-color: rgba(36, 36, 36, 0.2);
          background: rgba(255, 255, 255, 0.82);
        }

        .action-secondary svg {
          width: 15px;
          height: 15px;
          color: rgba(36, 36, 36, 0.45);
        }

        .png-size-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 14px;
          border-top: 1px solid
            rgba(36, 36, 36, 0.075);
        }

        .png-size-row > div {
          min-width: 0;
        }

        .png-size-row strong {
          display: block;
          color: rgba(36, 36, 36, 0.62);
          font-size: 10px;
          font-weight: 700;
        }

        .png-size-row span {
          display: block;
          margin-top: 2px;
          color: rgba(36, 36, 36, 0.28);
          font-size: 9px;
        }

        .png-size-select {
          width: 102px;
          height: 35px;
          flex: 0 0 auto;
        }

        .preview-note {
          max-width: 420px;
          margin: 12px 4px 0;
          color: rgba(36, 36, 36, 0.34);
          font-size: 10px;
          line-height: 1.5;
        }

        .guide-section {
          display: grid;
          grid-template-columns: 0.72fr 1.28fr;
          gap: 60px;
          margin-top: 105px;
          padding-top: 44px;
          border-top: 1px solid
            rgba(36, 36, 36, 0.08);
        }

        .guide-heading h2 {
          max-width: 380px;
          color: var(--ink);
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .guide-list {
          border-top: 1px solid
            rgba(36, 36, 36, 0.08);
        }

        .guide-item {
          display: grid;
          grid-template-columns: 42px 155px 1fr;
          gap: 15px;
          padding: 17px 0;
          border-bottom: 1px solid
            rgba(36, 36, 36, 0.08);
        }

        .guide-number {
          color: var(--red);
          font-size: 10px;
          font-weight: 700;
        }

        .guide-item h3 {
          color: var(--ink);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .guide-item p {
          color: rgba(36, 36, 36, 0.48);
          font-size: 12px;
          line-height: 1.5;
        }

        .faq-section {
          margin-top: 90px;
        }

        .faq-heading {
          margin-bottom: 19px;
        }

        .faq-heading h2 {
          color: var(--ink);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.045em;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .faq-card {
          min-height: 155px;
          padding: 18px;
          border: 1px solid rgba(36, 36, 36, 0.09);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.34);
          transition:
            background 180ms ease,
            transform 180ms ease;
        }

        .faq-card:hover {
          background: rgba(255, 255, 255, 0.62);
          transform: translateY(-2px);
        }

        .faq-card-star {
          display: block;
          height: 27px;
          color: var(--red);
          font-size: 31px;
          font-weight: 800;
          line-height: 0.8;
        }

        .faq-card h3 {
          margin-top: 7px;
          color: var(--ink);
          font-size: 13px;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .faq-card p {
          margin-top: 8px;
          color: rgba(36, 36, 36, 0.46);
          font-size: 11px;
          line-height: 1.55;
        }

        @media (max-width: 900px) {
          .studio-layout {
            grid-template-columns: 1fr;
          }

          .preview-section {
            position: static;
          }

          .guide-section {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }

          .faq-card {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .decorative-qr {
            display: none;
          }

          .qr-hero {
            margin-bottom: 48px;
          }

          .qr-hero-title {
            gap: 8px;
            min-width: 0;
          }

          .hero-star {
            margin-top: -0.01em;
            font-size: clamp(46px, 13vw, 72px);
          }

          .qr-hero h1 {
            min-width: 0;
            font-size: clamp(40px, 12vw, 68px);
          }

          .qr-hero > p {
            margin-top: 19px;
            margin-left: 2px;
            font-size: 15px;
          }

          .qr-crosslink {
            margin-top: 12px;
            margin-left: 2px;
          }

          .settings-card {
            padding: 15px;
          }

          .preset-grid {
            grid-template-columns: 1fr 1fr;
          }

          .color-grid {
            grid-template-columns: 1fr;
          }

          .select-grid,
          .advanced-grid {
            grid-template-columns: 1fr;
          }

          .text-field,
          .select-control,
          .png-size-select {
            font-size: 16px;
          }

          .preview-body {
            padding: 24px 16px 20px;
          }

          .export-actions {
            grid-template-columns: 1fr;
          }

          .action-secondary {
            grid-column: auto;
          }

          .guide-section {
            margin-top: 72px;
          }

          .guide-item {
            grid-template-columns: 32px 1fr;
            gap: 7px 12px;
          }

          .guide-item p {
            grid-column: 2;
          }

          .faq-section {
            margin-top: 70px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .preset-card,
          .text-field,
          .action,
          .faq-card,
          .field-meta a::after,
          .qr-crosslink,
          .qr-crosslink::after {
            transition: none !important;
          }

          .qr-notice {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="field-label">
        {label}
      </span>

      <span className="color-control">
        <input
          type="color"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value.toUpperCase(),
            )
          }
          aria-label={label}
        />

        <span className="color-value">
          {value}
        </span>
      </span>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="field-label">
        {label}
      </span>

      <select
        className="select-control"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label={label}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function GuideItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="guide-item">
      <span className="guide-number">
        {number}
      </span>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

function Faq({
  q,
  a,
}: {
  q: string;
  a: string;
}) {
  return (
    <article className="faq-card">
      <span
        className="faq-card-star"
        aria-hidden="true"
      >
        *
      </span>

      <h3>{q}</h3>
      <p>{a}</p>
    </article>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}