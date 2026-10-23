"use client";

import React, { useEffect, useRef } from "react";

export default function HeroSlime() {
  const blobRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Смещение относительно центра экрана
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX = (e.clientX - centerX) * 0.12;
      mouseY = (e.clientY - centerY) * 0.12;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      // Мягкая физическая задержка движения за курсором
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl h-80 flex items-center justify-center select-none">
      {/* Интерактивная капсула-флюид */}
      <div
        ref={blobRef}
        className="relative w-72 h-72 sm:w-96 sm:h-96 transition-transform duration-75 ease-out will-change-transform"
      >
        {/* Базовое мягкое свечение ауры */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-300/30 via-indigo-200/25 to-sky-200/35 blur-3xl opacity-80" />

        {/* Органическая колышущаяся масса с переливами */}
        <div
          className="absolute inset-4 rounded-[40%_60%_70%_30%/40%_50%_60%_55%] bg-gradient-to-br from-white/70 via-blue-100/40 to-indigo-100/30 backdrop-blur-md border border-white/60 shadow-[inset_0_0_40px_rgba(255,255,255,0.8),0_20px_50px_rgba(59,130,246,0.08)] animate-morph"
        />

        {/* Внутренний блик света */}
        <div className="absolute top-8 left-12 w-28 h-16 rounded-full bg-white/40 blur-lg rotate-[-20deg]" />
      </div>
    </div>
  );
}