"use client";

import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

const SPIDY_RED = "#FF3830";
const PAPER = "#F7F5F2";
const DEEP_BLACK = "#0B0B0B";

export default function FAQSchemaGeneratorPage() {
  const [items, setItems] = useState<FAQItem[]>([
    {
      id: 1,
      question: "",
      answer: "",
    },
    {
      id: 2,
      question: "",
      answer: "",
    },
  ]);

  const [copied, setCopied] = useState(false);

  const updateItem = (
    id: number,
    field: "question" | "answer",
    value: string
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    setCopied(false);
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: Date.now(),
        question: "",
        answer: "",
      },
    ]);
  };

  const removeItem = (id: number) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const validItems = useMemo(
    () =>
      items.filter(
        (item) => item.question.trim() && item.answer.trim()
      ),
    [items]
  );

  const schema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: validItems.map((item) => ({
        "@type": "Question",
        name: item.question.trim(),
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer.trim(),
        },
      })),
    };
  }, [validItems]);

  const json = useMemo(
    () => JSON.stringify(schema, null, 2),
    [schema]
  );

  const code = `<script type="application/ld+json">\n${json}\n</script>`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  const clearAll = () => {
    setItems([
      {
        id: Date.now(),
        question: "",
        answer: "",
      },
    ]);

    setCopied(false);
  };

  return (
    <main
      className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"
      style={{
        background: PAPER,
        color: DEEP_BLACK,
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* HERO */}

        {/* HERO */}

{/* HERO */}

<section className="relative mb-12 overflow-hidden border-b border-[#D1D1D1] pb-10">
  {/* BACKGROUND SCHEMA PATTERN */}

  <div
    className="pointer-events-none absolute -right-10 -top-8 hidden h-[125%] w-[58%] select-none overflow-hidden sm:block"
    aria-hidden="true"
  >
    <pre
      className="rotate-[-5deg] whitespace-pre font-mono font-bold leading-[1.35]"
      style={{
        color: DEEP_BLACK,
        opacity: 0.055,
        fontSize: "clamp(11px, 1.15vw, 17px)",
      }}
    >{`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Что такое FAQ Schema?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FAQ Schema — это структурированные данные для вопросов и ответов."
      }
    },
    {
      "@type": "Question",
      "name": "Как добавить FAQ разметку?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Добавьте вопросы и ответы и скопируйте готовый JSON-LD."
      }
    },
    {
      "@type": "Question",
      "name": "Какой формат используется?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Генератор создаёт разметку в формате JSON-LD."
      }
    }
  ]
}`}</pre>
  </div>

  {/* FOREGROUND */}

  <div className="relative z-10">
    <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
      FAQ
      <br />

      <span className="inline-flex items-center">
        SCHEMA
        <DraggableStar />
      </span>
    </h1>

    <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <p className="max-w-xl text-base font-medium leading-6 sm:text-lg">
        Генератор JSON-LD разметки для блока FAQ.
        Добавляй вопросы и ответы — готовый код собирается
        автоматически.
      </p>
    </div>
  </div>
</section>

        {/* WORKSPACE */}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* FAQ EDITOR */}

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  01 / Content
                </span>

                <h2 className="mt-1 text-2xl font-black uppercase tracking-tight">
                  Вопросы и ответы
                </h2>
              </div>

              <div className="text-sm font-bold text-gray-400">
                {validItems.length} готово
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  className="relative border-2 border-black bg-white p-4 sm:p-5"
                  style={{
                    boxShadow: "5px 5px 0 #0B0B0B",
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center text-sm font-black"
                        style={{
                          background: SPIDY_RED,
                          color: DEEP_BLACK,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-xs font-black uppercase tracking-wider">
                        FAQ Item
                      </span>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center border border-black text-lg font-bold transition hover:bg-black hover:text-white"
                        aria-label="Удалить вопрос"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide">
                      Вопрос
                    </label>

                    <input
                      type="text"
                      value={item.question}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "question",
                          event.target.value
                        )
                      }
                      placeholder="Например: Что такое UTM-метка?"
                      className="w-full border-2 border-black bg-[#F7F5F2] px-4 py-3 text-sm font-medium outline-none transition focus:bg-white"
                      style={{
                        boxShadow: item.question
                          ? `3px 3px 0 ${SPIDY_RED}`
                          : "none",
                      }}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide">
                      Ответ
                    </label>

                    <textarea
                      value={item.answer}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "answer",
                          event.target.value
                        )
                      }
                      placeholder="Введите ответ на вопрос..."
                      rows={4}
                      className="w-full resize-y border-2 border-black bg-[#F7F5F2] px-4 py-3 text-sm font-medium leading-6 outline-none transition focus:bg-white"
                      style={{
                        boxShadow: item.answer
                          ? `3px 3px 0 ${SPIDY_RED}`
                          : "none",
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-5 flex w-full items-center justify-center gap-3 border-2 border-dashed border-black px-5 py-4 text-sm font-black uppercase transition hover:bg-black hover:text-white"
            >
              <span className="text-xl">+</span>
              Добавить вопрос
            </button>
          </section>

          {/* RESULT */}

          <section className="lg:sticky lg:top-20 lg:self-start">
            <div className="mb-5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                02 / Result
              </span>

              <h2 className="mt-1 text-2xl font-black uppercase tracking-tight">
                Готовая разметка
              </h2>
            </div>

            <div
              className="overflow-hidden border-2 border-black"
              style={{
                background: DEEP_BLACK,
                boxShadow: `7px 7px 0 ${SPIDY_RED}`,
              }}
            >
              <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: SPIDY_RED }}
                  />

                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    JSON-LD
                  </span>
                </div>

                <span className="text-[11px] font-medium text-white/40">
                  FAQPage
                </span>
              </div>

              <div className="max-h-[520px] overflow-auto p-4 sm:p-5">
                {validItems.length > 0 ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-white/80 sm:text-xs">
                    {code}
                  </pre>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center text-center">
                    <div
                      className="mb-3 text-6xl font-black"
                      style={{ color: SPIDY_RED }}
                    >
                      *
                    </div>

                    <p className="text-sm font-bold text-white">
                      Пока пусто
                    </p>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-white/40">
                      Заполни хотя бы один вопрос и ответ — JSON-LD
                      появится здесь автоматически.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/20 p-3">
                <button
                  type="button"
                  onClick={copyCode}
                  disabled={validItems.length === 0}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-black uppercase transition disabled:cursor-not-allowed disabled:opacity-30"
                  style={{
                    background: SPIDY_RED,
                    color: DEEP_BLACK,
                  }}
                >
                  {copied
                    ? "✓ Скопировано"
                    : "Копировать код →"}
                </button>
              </div>
            </div>

            {/* INFO */}

            <div className="mt-6 border-2 border-black bg-white p-5">
              <div className="flex gap-4">
                <div
                  className="text-4xl font-black leading-none"
                  style={{ color: SPIDY_RED }}
                >
                  !
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase">
                    Как использовать
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Скопируй этот код и вставь его в HTML страницы,
                    на которой опубликованы соответствующие вопросы и
                    ответы.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-xs font-bold uppercase text-gray-400 underline decoration-1 underline-offset-4 transition hover:text-black"
            >
              Очистить всё
            </button>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spidy-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

/* ------------------------------------------------ */
/* DRAGGABLE STAR                                   */
/* ------------------------------------------------ */

function DraggableStar() {
  const starRef = useRef<HTMLSpanElement>(null);

  const dragRef = useRef({
    dragging: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
  });

  const returnAnimationRef = useRef<Animation | null>(null);

  const setPosition = (x: number, y: number) => {
    const star = starRef.current;
    if (!star) return;

    star.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLSpanElement>
  ) => {
    const star = starRef.current;
    if (!star) return;

    event.preventDefault();

    returnAnimationRef.current?.cancel();
    returnAnimationRef.current = null;

    dragRef.current.dragging = true;
    dragRef.current.pointerId = event.pointerId;
    dragRef.current.startX =
      event.clientX - dragRef.current.x;
    dragRef.current.startY =
      event.clientY - dragRef.current.y;

    star.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLSpanElement>
  ) => {
    const drag = dragRef.current;

    if (
      !drag.dragging ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    drag.x = event.clientX - drag.startX;
    drag.y = event.clientY - drag.startY;

    setPosition(drag.x, drag.y);
  };

  const releaseStar = (
    event: ReactPointerEvent<HTMLSpanElement>
  ) => {
    const star = starRef.current;
    const drag = dragRef.current;

    if (
      !star ||
      !drag.dragging ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    drag.dragging = false;

    if (star.hasPointerCapture(event.pointerId)) {
      star.releasePointerCapture(event.pointerId);
    }

    const startX = drag.x;
    const startY = drag.y;

    const animation = star.animate(
      [
        {
          transform: `translate3d(${startX}px, ${startY}px, 0)`,
          offset: 0,
        },
        {
          transform: "translate3d(0, 0, 0)",
          offset: 0.72,
        },
        {
          transform: `translate3d(${
            startX * -0.035
          }px, ${startY * -0.035}px, 0)`,
          offset: 0.84,
        },
        {
          transform: `translate3d(${
            startX * 0.012
          }px, ${startY * 0.012}px, 0)`,
          offset: 0.93,
        },
        {
          transform: "translate3d(0, 0, 0)",
          offset: 1,
        },
      ],
      {
        duration: 700,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      }
    );

    returnAnimationRef.current = animation;

    animation.onfinish = () => {
      drag.x = 0;
      drag.y = 0;

      star.style.transform = "translate3d(0, 0, 0)";

      animation.cancel();
      returnAnimationRef.current = null;
    };
  };

  return (
    <span
      className="relative ml-[0.08em] inline-block h-[0.9em] w-[0.9em] shrink-0 align-baseline"
      aria-hidden="true"
    >
      {/* Слой только для перемещения */}

      <span
        ref={starRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releaseStar}
        onPointerCancel={releaseStar}
        className="absolute inset-0 z-50 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
        }}
      >
        {/* Центрирование */}

        <span className="absolute inset-0 flex items-center justify-center">
          {/* Вращается непосредственно сам символ */}

          <span
            className="inline-block leading-none"
            style={{
              color: SPIDY_RED,
              fontSize: "1.15em",
              animation: "spidy-spin 10s linear infinite",
              transformOrigin: "center center",
            }}
          >
            *
          </span>
        </span>
      </span>
    </span>
  );
}