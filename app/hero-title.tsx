"use client";

import React, { useState, useEffect } from "react";

export default function HeroTitle() {
  const words = [
    "SEO",
    "digital",
    "performance",
    "контент",
    "продуктового",
    "интернет",
    "любого",
  ];

  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, [words.length]);

  const currentWord = words[wordIndex];

  const separator =
    currentWord === "любого" || currentWord === "продуктового"
      ? " "
      : "-";

  return (
    <h1 className="text-[23px] xs:text-2xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-tight sm:leading-[1.12]">
      Полезные инструменты <br />

      <span className="whitespace-nowrap">
        для{" "}
        <span
          className={`inline-block text-blue-600 transition-all duration-300 transform ${
            fade
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2"
          }`}
        >
          {currentWord}
        </span>
        {separator}маркетолога
      </span>
    </h1>
  );
}