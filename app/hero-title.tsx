"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "SEO",
  "digital",
  "performance",
  "контент",
  "продуктового",
  "интернет",
  "любого",
];

export default function HeroTitle() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false);

      window.setTimeout(() => {
        setWordIndex((current) => (current + 1) % WORDS.length);
        setVisible(true);
      }, 300);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  const currentWord = WORDS[wordIndex];

  const separator =
    currentWord === "любого" || currentWord === "продуктового"
      ? " "
      : "-";

  return (
    <>
      <h1 className="text-left text-[42px] font-bold leading-[0.94] tracking-[-0.055em] text-[#0B0B0B] sm:text-[56px] lg:text-[68px] xl:text-[76px]">
        Полезные инструменты
        <br />

        <span className="whitespace-nowrap">
          для{" "}
          <span
            className={`marker-word ${
              visible
                ? "translate-y-0 opacity-100"
                : "-translate-y-3 opacity-0"
            }`}
          >
            <span className="marker-stroke" />
            <span className="marker-text">{currentWord}</span>
          </span>
          {separator}маркетолога
        </span>
      </h1>

      <style jsx>{`
        .marker-word {
          position: relative;
          display: inline-block;
          color: #0b0b0b;
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        }

        .marker-text {
          position: relative;
          z-index: 2;
        }

        .marker-stroke {
          position: absolute;
          z-index: 1;

          left: -0.09em;
          right: -0.1em;
          top: 54%;

          height: 0.78em;

          background: rgba(215, 255, 0, 0.82);

          transform: translateY(-50%) rotate(-2deg);

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
      `}</style>
    </>
  );
}