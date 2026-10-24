"use client";

import { useEffect, useRef } from "react";

export default function HeroSlime() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;

    const mouse = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 45;
      ty = (e.clientY / innerHeight - 0.5) * 30;
    };

    const tick = () => {
      x += (tx - x) * 0.035;
      y += (ty - y) * 0.035;

      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", mouse);
    tick();

    return () => {
      window.removeEventListener("pointermove", mouse);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cloud-wrap">
      <div className="cloud">
        <i className="b b1" />
        <i className="b b2" />
        <i className="b b3" />
        <i className="b b4" />
      </div>

      <div className="grain" />

      <div className="word-clear-zone" />

      <style jsx>{`
        .cloud-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          background: white;
          perspective: 900px;
        }

        .cloud {
          position: absolute;
          width: 1100px;
          height: 600px;
          left: 50%;
          top: 50%;

          transform:
            translate(
              calc(-50% + var(--x, 0px)),
              calc(-50% + var(--y, 0px))
            )
            rotateX(2deg);

          transform-style: preserve-3d;
          filter: blur(55px) saturate(140%);
        }

        .b {
          position: absolute;
          display: block;
          border-radius: 50%;
          will-change: transform, border-radius, opacity;
          transform-style: preserve-3d;
        }

        .b1 {
          width: 62%;
          height: 70%;
          left: 2%;
          top: 4%;
          background: rgba(18, 102, 255, 0.72);
          animation: a 7s ease-in-out infinite alternate;
        }

        .b2 {
          width: 58%;
          height: 67%;
          right: 0;
          top: 8%;
          background: rgba(96, 174, 255, 0.58);
          animation: b 9s ease-in-out infinite alternate;
        }

        .b3 {
          width: 48%;
          height: 58%;
          left: 28%;
          bottom: 0;
          background: rgba(225, 235, 247, 0.92);
          animation: c 6s ease-in-out infinite alternate;
        }

        .b4 {
          width: 40%;
          height: 50%;
          left: 33%;
          top: 18%;
          background: rgba(255, 255, 255, 0.96);
          animation: d 8s ease-in-out infinite alternate;
        }

        /*
          МЯГКОЕ МАТОВОЕ ЗЕРНО

          ВАЖНО:
          оно больше не масштабируется через background-size.
          SVG генерирует шум сразу с нужным размером частиц.
        */
        .grain {
          position: absolute;
          inset: 0;
          z-index: 5;

          opacity: 0.11;

          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cfilter id='noise' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.055' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='.65'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='.65'/%3E%3C/svg%3E");

          background-repeat: repeat;
          background-size: 300px 300px;

          mix-blend-mode: soft-light;

          -webkit-mask-image: radial-gradient(
            ellipse 46% 42% at 50% 50%,
            black 0%,
            rgba(0, 0, 0, 0.9) 38%,
            rgba(0, 0, 0, 0.5) 60%,
            transparent 82%
          );

          mask-image: radial-gradient(
            ellipse 46% 42% at 50% 50%,
            black 0%,
            rgba(0, 0, 0, 0.9) 38%,
            rgba(0, 0, 0, 0.5) 60%,
            transparent 82%
          );
        }

        .word-clear-zone {
          position: absolute;

          left: 37%;
          top: 51%;

          width: 310px;
          height: 125px;

          transform: translate(-50%, -50%);

          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.9) 20%,
            rgba(247, 250, 255, 0.68) 42%,
            rgba(240, 246, 255, 0.3) 65%,
            transparent 100%
          );

          filter: blur(17px);
          z-index: 20;
        }

        @keyframes a {
          0% {
            transform:
              translate3d(-22%, -15%, -180px)
              scale(0.68)
              rotate(-16deg);

            border-radius:
              45% 55% 65% 35% /
              60% 40% 60% 40%;
          }

          50% {
            transform:
              translate3d(32%, 18%, 120px)
              scale(1.32)
              rotate(14deg);

            border-radius:
              65% 35% 40% 60% /
              35% 65% 45% 55%;
          }

          100% {
            transform:
              translate3d(-4%, 30%, -70px)
              scale(0.88)
              rotate(-8deg);

            border-radius:
              38% 62% 58% 42% /
              65% 35% 62% 38%;
          }
        }

        @keyframes b {
          0% {
            transform:
              translate3d(25%, -24%, 140px)
              scale(1.32)
              rotate(13deg);
          }

          50% {
            transform:
              translate3d(-36%, 27%, -200px)
              scale(0.62)
              rotate(-20deg);
          }

          100% {
            transform:
              translate3d(-8%, -12%, 90px)
              scale(1.38)
              rotate(16deg);
          }
        }

        @keyframes c {
          0% {
            transform:
              translate3d(-30%, 24%, -220px)
              scale(0.58);
          }

          50% {
            transform:
              translate3d(35%, -32%, 160px)
              scale(1.48);
          }

          100% {
            transform:
              translate3d(-12%, -20%, -80px)
              scale(0.86);
          }
        }

        @keyframes d {
          0% {
            transform:
              translate3d(28%, 18%, 180px)
              scale(0.55);
            opacity: 0.7;
          }

          50% {
            transform:
              translate3d(-38%, -22%, -170px)
              scale(1.55);
            opacity: 1;
          }

          100% {
            transform:
              translate3d(18%, 28%, 110px)
              scale(0.72);
            opacity: 0.8;
          }
        }

        @media (max-width: 900px) {
          .word-clear-zone {
            left: 50%;
            width: 260px;
            height: 110px;
          }
        }
      `}</style>
    </div>
  );
}