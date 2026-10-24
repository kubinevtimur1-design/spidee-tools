"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

type NavbarLogoProps = {
  onClick?: () => void;
};

const REST_X = "50%";
const REST_Y = "42%";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function NavbarLogo({ onClick }: NavbarLogoProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const reset = () => {
      const el = linkRef.current;
      if (!el) return;
      el.classList.remove("is-mixing");
      el.style.setProperty("--logo-x", REST_X);
      el.style.setProperty("--logo-y", REST_Y);
    };

    const sync = () => {
      reducedMotionRef.current = media.matches;
      if (media.matches) reset();
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const shiftToPointer = (el: HTMLAnchorElement, clientX: number, clientY: number) => {
    if (reducedMotionRef.current) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const ny = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    // Stay inside the blue stops so the mix reads as a tint, not a sweep.
    const x = 24 + nx * 52;
    const y = 28 + ny * 32;

    el.style.setProperty("--logo-x", `${x.toFixed(1)}%`);
    el.style.setProperty("--logo-y", `${y.toFixed(1)}%`);
  };

  return (
    <Link
      ref={linkRef}
      href="/"
      onClick={onClick}
      onMouseEnter={(event) => {
        if (prefersReducedMotion()) {
          reducedMotionRef.current = true;
          return;
        }
        reducedMotionRef.current = false;
        event.currentTarget.classList.add("is-mixing");
        shiftToPointer(event.currentTarget, event.clientX, event.clientY);
      }}
      onMouseMove={(event) => {
        shiftToPointer(event.currentTarget, event.clientX, event.clientY);
      }}
      onMouseLeave={(event) => {
        const el = event.currentTarget;
        el.classList.remove("is-mixing");
        el.style.setProperty("--logo-x", REST_X);
        el.style.setProperty("--logo-y", REST_Y);
      }}
      className="navbar-logo flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-black"
    >
      <span className="navbar-logo-emoji text-base leading-none">🕷️</span>
      <span className="navbar-logo-word">Spidy Tools</span>
    </Link>
  );
}
