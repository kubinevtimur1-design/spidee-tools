"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { track } from "@/lib/metrika";
import { useToolUse } from "@/lib/use-tool-use";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

const SPIDY_RED = "#FF3830";
const PAPER = "#F7F5F2";
const DEEP_BLACK = "#0B0B0B";
const TEXT = "#3A3A3A";

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

  useToolUse("faq", validItems.length > 0 ? code : "");

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    track("copy_result");
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
      className="min-h-screen"
      style={{
        background: PAPER,
        color: TEXT,
      }}
    >
      {/* HERO */}

      <section className="relative overflow-hidden border-b border-[#D1D1D1]">
        <FlyingStar />

        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          {/* BREADCRUMBS */}

          <nav
            aria-label="Хлебные крошки"
            className="relative z-20 mb-8 flex items-center gap-2 text-xs font-medium text-[#999999]"
          >
            <Link
              href="/"
              className="transition-colors duration-200 hover:text-[#0B0B0B]"
            >
              Главная
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-[#555555]">
              FAQ Schema
            </span>
          </nav>

          {/* BACKGROUND SCHEMA PATTERN */}

          <div
            className="pointer-events-none absolute -right-10 top-0 hidden h-full w-[58%] select-none overflow-hidden sm:block"
            aria-hidden="true"
          >
            <pre
              className="rotate-[-5deg] whitespace-pre font-mono font-bold leading-[1.35]"
              style={{
                color: DEEP_BLACK,
                opacity: 0.04,
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

          {/* HERO CONTENT */}

          <div className="relative z-10">
            <h1 className="max-w-4xl text-5xl font-bold uppercase leading-[0.88] tracking-[-0.06em] text-[#3A3A3A] sm:text-7xl lg:text-8xl">
              FAQ
              <br />
              SCHEMA
            </h1>

            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-base font-normal leading-6 text-[#777777] sm:text-lg">
                Генератор JSON-LD разметки для блока FAQ.
                Добавляй вопросы и ответы — готовый код собирается
                автоматически.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKSPACE */}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* FAQ EDITOR */}

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#777777]">
                  01 / Content
                </span>

                <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[#0B0B0B]">
                  Вопросы и ответы
                </h2>
              </div>

              <div className="text-sm font-medium text-[#999999]">
                {validItems.length} готово
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  className="relative rounded-[18px] border border-black/[0.08] bg-[#F7F5F2] p-4 transition-all duration-300 hover:border-black/[0.16] hover:shadow-[0_16px_35px_rgba(0,0,0,0.04)] sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                        style={{
                          background: `${SPIDY_RED}12`,
                          color: SPIDY_RED,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                        FAQ Item
                      </span>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.1] text-lg font-medium text-[#555555] transition-all duration-200 hover:border-black hover:bg-[#0B0B0B] hover:text-white"
                        aria-label="Удалить вопрос"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#555555]">
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
                      className="w-full rounded-xl border border-black/[0.1] bg-white/50 px-4 py-3 text-sm font-medium text-[#3A3A3A] outline-none transition-all duration-200 placeholder:text-[#AAAAAA] focus:border-black/[0.25] focus:bg-white"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#555555]">
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
                      className="w-full resize-y rounded-xl border border-black/[0.1] bg-white/50 px-4 py-3 text-sm font-medium leading-6 text-[#3A3A3A] outline-none transition-all duration-200 placeholder:text-[#AAAAAA] focus:border-black/[0.25] focus:bg-white"
                    />
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-[14px] border border-dashed border-black/[0.2] px-5 py-4 text-sm font-bold uppercase text-[#555555] transition-all duration-200 hover:border-black hover:bg-[#0B0B0B] hover:text-white"
            >
              <span className="text-xl">+</span>
              Добавить вопрос
            </button>
          </section>

          {/* RESULT */}

          <section className="lg:sticky lg:top-20 lg:self-start">
            <div className="mb-5">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#777777]">
                02 / Result
              </span>

              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[#0B0B0B]">
                Готовая разметка
              </h2>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-black/[0.1] bg-[#0B0B0B] shadow-[0_16px_35px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
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
                      className="mb-3 text-6xl font-bold"
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

              <div className="border-t border-white/10 p-3">
                <button
                  type="button"
                  onClick={copyCode}
                  disabled={validItems.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
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

            <div className="mt-6 rounded-[18px] border border-black/[0.08] bg-[#F7F5F2] p-5">
              <div className="flex gap-4">
                <div
                  className="text-4xl font-bold leading-none"
                  style={{ color: SPIDY_RED }}
                >
                  !
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase text-[#0B0B0B]">
                    Как использовать
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#777777]">
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
              className="mt-4 text-xs font-medium uppercase text-[#999999] underline decoration-1 underline-offset-4 transition hover:text-[#0B0B0B]"
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
/* FLYING STAR                                      */
/* ------------------------------------------------ */

function FlyingStar() {
  const starRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const STAR_SIZE = 72;

  /*
    Скорость обычного спокойного полёта.
    После броска звезда постепенно возвращается
    именно к этой скорости, но не останавливается.
  */
  const CRUISE_SPEED = 1.15;
  const MAX_THROW_SPEED = 12;
  const DRAG = 0.985;

  const physics = useRef({
    x: 0,
    y: 0,

    vx: 1,
    vy: 0.6,

    initialized: false,
    dragging: false,
    pointerId: -1,

    offsetX: 0,
    offsetY: 0,

    lastX: 0,
    lastY: 0,
    lastTime: 0,

    /*
      Небольшое случайное изменение направления,
      чтобы спокойный полёт не был вечной
      идеально прямой диагональю.
    */
    wanderAngle: 0,
    lastWanderTime: 0,
  });

  const render = () => {
    const star = starRef.current;
    if (!star) return;

    const state = physics.current;

    star.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
  };

  useEffect(() => {
    const star = starRef.current;
    if (!star) return;

    const container = star.parentElement;
    if (!container) return;

    const state = physics.current;

    const initialize = () => {
      const rect = container.getBoundingClientRect();

      if (!state.initialized) {
        state.x = Math.max(
          0,
          Math.min(
            rect.width - STAR_SIZE,
            rect.width * 0.68
          )
        );

        state.y = Math.max(
          0,
          Math.min(
            rect.height - STAR_SIZE,
            rect.height * 0.3
          )
        );

        const angle =
          -0.8 + Math.random() * 1.6;

        state.vx =
          Math.cos(angle) * CRUISE_SPEED;

        state.vy =
          Math.sin(angle) * CRUISE_SPEED;

        state.wanderAngle = angle;
        state.lastWanderTime = performance.now();
        state.initialized = true;
      }

      state.x = Math.max(
        0,
        Math.min(
          state.x,
          Math.max(0, rect.width - STAR_SIZE)
        )
      );

      state.y = Math.max(
        0,
        Math.min(
          state.y,
          Math.max(0, rect.height - STAR_SIZE)
        )
      );

      render();
    };

    initialize();

    const animate = (time: number) => {
      const rect = container.getBoundingClientRect();

      if (!state.dragging) {
        let speed = Math.hypot(
          state.vx,
          state.vy
        );

        /*
          Если звезду бросили быстрее обычной скорости,
          постепенно гасим импульс.
        */
        if (speed > CRUISE_SPEED) {
          state.vx *= DRAG;
          state.vy *= DRAG;

          speed = Math.hypot(
            state.vx,
            state.vy
          );

          /*
            Не даём трению опустить скорость
            ниже спокойной.
          */
          if (speed < CRUISE_SPEED) {
            const angle = Math.atan2(
              state.vy,
              state.vx
            );

            state.vx =
              Math.cos(angle) * CRUISE_SPEED;

            state.vy =
              Math.sin(angle) * CRUISE_SPEED;
          }
        }

        /*
          Если скорость почему-то оказалась ниже
          базовой — плавно возвращаем её.
        */
        if (speed < CRUISE_SPEED) {
          const angle =
            speed > 0.01
              ? Math.atan2(state.vy, state.vx)
              : state.wanderAngle;

          state.vx =
            Math.cos(angle) * CRUISE_SPEED;

          state.vy =
            Math.sin(angle) * CRUISE_SPEED;
        }

        /*
          В спокойном режиме слегка меняем направление.
          Изменение очень небольшое, поэтому движение
          остаётся плавным.
        */
        const currentSpeed = Math.hypot(
          state.vx,
          state.vy
        );

        if (
          currentSpeed <= CRUISE_SPEED * 1.15 &&
          time - state.lastWanderTime > 700
        ) {
          const currentAngle = Math.atan2(
            state.vy,
            state.vx
          );

          const randomTurn =
            (Math.random() - 0.5) * 0.32;

          state.wanderAngle =
            currentAngle + randomTurn;

          state.lastWanderTime = time;
        }

        /*
          Очень плавно направляем вектор
          в сторону wanderAngle.
        */
        if (
          currentSpeed <= CRUISE_SPEED * 1.15
        ) {
          const targetVX =
            Math.cos(state.wanderAngle) *
            CRUISE_SPEED;

          const targetVY =
            Math.sin(state.wanderAngle) *
            CRUISE_SPEED;

          state.vx +=
            (targetVX - state.vx) * 0.008;

          state.vy +=
            (targetVY - state.vy) * 0.008;
        }

        state.x += state.vx;
        state.y += state.vy;

        const maxX = Math.max(
          0,
          rect.width - STAR_SIZE
        );

        const maxY = Math.max(
          0,
          rect.height - STAR_SIZE
        );

        /*
          Отскоки от стен.
        */

        if (state.x <= 0) {
          state.x = 0;
          state.vx = Math.abs(state.vx);
          state.wanderAngle = Math.atan2(
            state.vy,
            state.vx
          );
        } else if (state.x >= maxX) {
          state.x = maxX;
          state.vx = -Math.abs(state.vx);
          state.wanderAngle = Math.atan2(
            state.vy,
            state.vx
          );
        }

        if (state.y <= 0) {
          state.y = 0;
          state.vy = Math.abs(state.vy);
          state.wanderAngle = Math.atan2(
            state.vy,
            state.vx
          );
        } else if (state.y >= maxY) {
          state.y = maxY;
          state.vy = -Math.abs(state.vy);
          state.wanderAngle = Math.atan2(
            state.vy,
            state.vx
          );
        }

        render();
      }

      frameRef.current =
        requestAnimationFrame(animate);
    };

    frameRef.current =
      requestAnimationFrame(animate);

    const handleResize = () => {
      initialize();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const star = starRef.current;
    if (!star) return;

    event.preventDefault();

    const state = physics.current;
    const rect = star.getBoundingClientRect();

    state.dragging = true;
    state.pointerId = event.pointerId;

    state.offsetX =
      event.clientX - rect.left;

    state.offsetY =
      event.clientY - rect.top;

    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.lastTime = performance.now();

    /*
      При захвате убираем старый импульс.
      Новая скорость будет определяться движением мыши.
    */
    state.vx = 0;
    state.vy = 0;

    star.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const star = starRef.current;
    if (!star) return;

    const state = physics.current;

    if (
      !state.dragging ||
      state.pointerId !== event.pointerId
    ) {
      return;
    }

    const container = star.parentElement;
    if (!container) return;

    const containerRect =
      container.getBoundingClientRect();

    const now = performance.now();

    const deltaTime = Math.max(
      8,
      now - state.lastTime
    );

    /*
      Скорость движения курсора становится
      скоростью будущего броска.
    */
    const mouseVX =
      ((event.clientX - state.lastX) /
        deltaTime) *
      16.67;

    const mouseVY =
      ((event.clientY - state.lastY) /
        deltaTime) *
      16.67;

    const maxX = Math.max(
      0,
      containerRect.width - STAR_SIZE
    );

    const maxY = Math.max(
      0,
      containerRect.height - STAR_SIZE
    );

    state.x = Math.max(
      0,
      Math.min(
        maxX,
        event.clientX -
          containerRect.left -
          state.offsetX
      )
    );

    state.y = Math.max(
      0,
      Math.min(
        maxY,
        event.clientY -
          containerRect.top -
          state.offsetY
      )
    );

    state.vx = mouseVX;
    state.vy = mouseVY;

    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.lastTime = now;

    render();
  };

  const release = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const star = starRef.current;
    if (!star) return;

    const state = physics.current;

    if (
      !state.dragging ||
      state.pointerId !== event.pointerId
    ) {
      return;
    }

    state.dragging = false;

    if (
      star.hasPointerCapture(event.pointerId)
    ) {
      star.releasePointerCapture(
        event.pointerId
      );
    }

    /*
      Ограничиваем максимальную скорость броска.
    */
    let speed = Math.hypot(
      state.vx,
      state.vy
    );

    if (speed > MAX_THROW_SPEED) {
      const scale =
        MAX_THROW_SPEED / speed;

      state.vx *= scale;
      state.vy *= scale;

      speed = MAX_THROW_SPEED;
    }

    /*
      Если пользователь просто передвинул звезду
      и отпустил без сильного броска —
      она сразу возвращается к спокойному полёту.
    */
    if (speed < CRUISE_SPEED) {
      let angle: number;

      if (speed > 0.05) {
        angle = Math.atan2(
          state.vy,
          state.vx
        );
      } else {
        angle =
          Math.random() * Math.PI * 2;
      }

      state.vx =
        Math.cos(angle) * CRUISE_SPEED;

      state.vy =
        Math.sin(angle) * CRUISE_SPEED;

      state.wanderAngle = angle;
    } else {
      state.wanderAngle = Math.atan2(
        state.vy,
        state.vx
      );
    }

    state.lastWanderTime =
      performance.now();
  };

  return (
    <div
      ref={starRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      className="absolute left-0 top-0 z-30 flex h-[72px] w-[72px] cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing"
      style={{
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      <span
        className="inline-block text-[72px] font-bold leading-none"
        style={{
          color: SPIDY_RED,
          animation:
            "spidy-spin 10s linear infinite",
          transformOrigin: "center",
        }}
      >
        *
      </span>
    </div>
  );
}