"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroSlime() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX = (e.clientX - centerX) * 0.025;
      mouseY = (e.clientY - centerY) * 0.025;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
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
    <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none select-none overflow-hidden">
      {/* 
        Смещение вниз: лапки аккуратно опускаются ниже шапки сайта, 
        а голова остается точно под верхней строкой заголовка
      */}
      <div className="relative translate-y-16 sm:translate-y-20 flex items-center justify-center">
        
        {/* СЛОЙ 1: Синее свечение строго ЗА пауком (z-0) */}
        <div className="absolute z-0 w-[420px] h-[420px] sm:w-[580px] sm:h-[580px] rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* СЛОЙ 2: Паук поверх свечения (z-10) 
            - Размер скорректирован (520px / 680px), чтобы лапки не упирались в верхнюю панель
            - Прозрачность уменьшена до opacity-35
            - Маска начинает затухать уже с 20% и полностью уходит в 0% к 75%
        */}
        <div
          ref={containerRef}
          className="relative z-10 w-[500px] h-[500px] sm:w-[680px] sm:h-[680px] flex items-center justify-center will-change-transform opacity-85"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 75%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 75%)",
          }}
        >
          <Image
            src="/hero-glass.png"
            alt="Фоновый стеклянный паук"
            fill
            priority
            sizes="(max-width: 768px) 500px, 680px"
            className="object-contain animate-pulse-slow"
          />
        </div>
      </div>
    </div>
  );
}