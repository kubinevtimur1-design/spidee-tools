"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const WORDS = [
  "SEO",
  "digital",
  "performance",
  "контент",
  "продуктового",
  "интернет",
  "любого",
];

const DISPLAY_MS = 2800;
const TRANSITION_MS = 220;

function getSeparator(word: string) {
  return word === "любого" || word === "продуктового" ? " " : "-";
}

export default function HeroTitle() {
  const [wordIndex, setWordIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slotWidth, setSlotWidth] = useState<number | null>(null);

  const currentMeasureRef = useRef<HTMLSpanElement | null>(null);
  const nextMeasureRef = useRef<HTMLSpanElement | null>(null);

  const currentWord = WORDS[wordIndex];
  const nextWord = WORDS[(wordIndex + 1) % WORDS.length];

  const measureCurrentWord = useCallback(() => {
    const element = currentMeasureRef.current;

    if (!element) return;

    setSlotWidth(element.getBoundingClientRect().width);
  }, []);

  const measureNextWord = useCallback(() => {
    const element = nextMeasureRef.current;

    if (!element) return;

    setSlotWidth(element.getBoundingClientRect().width);
  }, []);

  /*
   * После каждой смены слова измеряем его реальную ширину.
   * Это работает с любым размером шрифта на текущем breakpoint.
   */
  useLayoutEffect(() => {
    measureCurrentWord();
  }, [currentWord, measureCurrentWord]);

  /*
   * При изменении ширины окна Tailwind может переключить
   * размер H1: 42 → 56 → 68 → 76 px.
   *
   * Поэтому после resize заново измеряем слово.
   */
  useEffect(() => {
    let frameId = 0;

    const handleResize = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        measureCurrentWord();
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [measureCurrentWord]);

  /*
   * Смена слов.
   *
   * DISPLAY_MS — время показа.
   * TRANSITION_MS — только длительность движения вверх.
   */
  useEffect(() => {
    let finishTimer: ReturnType<typeof window.setTimeout> | undefined;

    const interval = window.setInterval(() => {
      measureNextWord();
      setAnimating(true);

      finishTimer = window.setTimeout(() => {
        setWordIndex((current) => (current + 1) % WORDS.length);
        setAnimating(false);
      }, TRANSITION_MS);
    }, DISPLAY_MS);

    return () => {
      window.clearInterval(interval);

      if (finishTimer) {
        window.clearTimeout(finishTimer);
      }
    };
  }, [wordIndex, measureNextWord]);

  const visibleSeparator = getSeparator(
    animating ? nextWord : currentWord,
  );

  return (
    <>
      <h1 className="hero-title text-left text-[42px] font-bold leading-[0.94] tracking-[-0.055em] text-[#242424] sm:text-[56px] lg:text-[68px] xl:text-[76px]">
        Инструменты
        <br />

        <span className="second-line">
          <span className="for-word">для</span>{" "}

          {/*
           * На мобильном эта группа переносится только целиком:
           *
           * SEO-маркетолога
           * performance-маркетолога
           * любого маркетолога
           *
           * Браузер не сможет оставить "-маркетолога"
           * отдельно от динамического слова.
           */}
          <span className="animated-group">
            <span
              className="word-slot"
              style={
                slotWidth !== null
                  ? { width: `${slotWidth}px` }
                  : undefined
              }
            >
              <span
                className={`animated-word current-word ${
                  animating ? "current-word--leave" : ""
                }`}
              >
                <span className="marker-stroke" />
                <span className="marker-text">
                  {currentWord}
                </span>
              </span>

              <span
                className={`animated-word next-word ${
                  animating ? "next-word--enter" : ""
                }`}
              >
                <span className="marker-stroke" />
                <span className="marker-text">
                  {nextWord}
                </span>
              </span>
            </span>

            <span className="marketing-word">
              {visibleSeparator}маркетолога
            </span>
          </span>
        </span>

        {/*
         * Невидимые измерители.
         * Они наследуют точный font-size / font-weight /
         * letter-spacing от H1.
         */}
        <span className="measure-layer" aria-hidden="true">
          <span ref={currentMeasureRef}>
            {currentWord}
          </span>

          <span ref={nextMeasureRef}>
            {nextWord}
          </span>
        </span>
      </h1>

      <style jsx>{`
        .hero-title {
          position: relative;
        }

        /*
         * На мобильном вторая строка может переноситься.
         * Это защищает H1 от горизонтального overflow.
         */
        .second-line {
          white-space: normal;
        }

        .for-word {
          display: inline;
        }

        /*
         * Главное responsive-правило:
         *
         * динамическое слово и "маркетолога"
         * являются одной неразрывной группой.
         */
        .animated-group {
          display: inline-flex;
          align-items: baseline;

          white-space: nowrap;
          vertical-align: baseline;
        }

        /*
         * Окно показывает только одно динамическое слово.
         * Его ширина плавно принимает ширину следующего.
         */
.word-slot {
  position: relative;
  display: inline-block;
  flex: 0 0 auto;

  width: auto;
  height: 1em;

  overflow: hidden;

  vertical-align: baseline;

  transition: width 220ms
    cubic-bezier(0.22, 1, 0.36, 1);
}

.animated-word {
  position: absolute;
  left: 0;
  top: 0;

  display: inline-block;
  width: max-content;

  color: #242424;

  line-height: inherit;

  will-change: transform;
}

        /*
         * Текущее слово.
         */
        .current-word {
          transform: translate3d(0, 0, 0);
        }

        /*
         * Текущее слово уходит строго вверх.
         */
        .current-word--leave {
          transform: translate3d(0, -115%, 0);

          transition: transform ${TRANSITION_MS}ms
            cubic-bezier(0.76, 0, 0.24, 1);
        }

        /*
         * Следующее слово ждёт под видимой областью.
         */
        .next-word {
          transform: translate3d(0, 115%, 0);
        }

        /*
         * Следующее слово поднимается снизу
         * одновременно с уходом предыдущего.
         */
        .next-word--enter {
          transform: translate3d(0, 0, 0);

          transition: transform ${TRANSITION_MS}ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .marker-text {
          position: relative;
          z-index: 2;
        }

        /*
         * Маркер привязан непосредственно
         * к ширине конкретного слова.
         */
        .marker-stroke {
          position: absolute;

          z-index: 1;

          left: -0.09em;
          right: -0.1em;
          top: 54%;

          height: 0.78em;

          background: rgba(215, 255, 0, 0.82);

          transform:
            translateY(-50%)
            rotate(-2deg);

          clip-path: polygon(
            1% 13%,
            8% 6%,
            19% 10%,
            31% 4%,
            45% 8%,
            57% 3%,
            70% 7%,
            83% 2%,
            96% 8%,
            100% 20%,
            98% 83%,
            91% 91%,
            79% 87%,
            66% 94%,
            52% 88%,
            39% 95%,
            25% 89%,
            13% 94%,
            2% 85%
          );

          filter: saturate(115%);
        }

        .marker-stroke::after {
          content: "";

          position: absolute;

          inset: 15% -1% 8% 1%;

          background: rgba(215, 255, 0, 0.28);

          transform: rotate(0.8deg);

          clip-path: polygon(
            0 15%,
            15% 7%,
            30% 13%,
            48% 5%,
            65% 11%,
            82% 4%,
            100% 12%,
            98% 87%,
            79% 93%,
            60% 86%,
            42% 94%,
            21% 88%,
            2% 94%
          );
        }

        .marketing-word {
          flex: 0 0 auto;
          white-space: nowrap;
        }

        /*
         * Измерители полностью вне layout,
         * но сохраняют все свойства шрифта H1.
         */
        .measure-layer {
          position: absolute;

          top: 0;
          left: 0;

          visibility: hidden;

          pointer-events: none;

          white-space: nowrap;
        }

        .measure-layer > span {
          display: inline-block;
        }

        /*
         * Начиная с sm ширины уже достаточно,
         * поэтому всю вторую строку держим вместе.
         */
        @media (min-width: 640px) {
          .second-line {
            white-space: nowrap;
          }
        }

        /*
         * На очень узком экране разрешаем перенос
         * только ПЕРЕД группой динамического слова.
         *
         * Сама группа остаётся неразрывной.
         */
        @media (max-width: 639px) {
          .animated-group {
            max-width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .word-slot,
          .current-word--leave,
          .next-word--enter {
            transition-duration: 1ms;
          }
        }
      `}</style>
    </>
  );
}