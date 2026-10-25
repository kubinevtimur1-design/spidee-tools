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
    <h1 className="text-left text-[42px] font-bold leading-[0.94] tracking-[-0.055em] text-[#0B0B0B] sm:text-[56px] lg:text-[68px] xl:text-[76px]">
      Полезные инструменты
      <br />

      <span className="whitespace-nowrap">
        для{" "}
        <span
          className={`inline-block text-[#FF3830] transition-all duration-300 ease-out ${
            visible
              ? "translate-y-0 opacity-100"
              : "-translate-y-3 opacity-0"
          }`}
        >
          {currentWord}
        </span>
        {separator}маркетолога
      </span>
    </h1>
  );
}