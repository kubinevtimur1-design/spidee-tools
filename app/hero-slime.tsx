"use client";

import { useEffect, useRef } from "react";

export default function HeroSlime() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

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

      <div className="matte-haze" />
      <div className="grain grain-large" />
      <div className="grain grain-fine" />
      <div className="word-clear-zone" />

      <style jsx>{`
        .cloud-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          background: #ffffff;
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

          /*
            Чуть меньше насыщенности и больше рассеивания:
            синий перестает выглядеть неоновым.
          */
          filter: blur(62px) saturate(112%) contrast(96%);
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

          background: rgba(25, 105, 238, 0.7);

          animation: a 7s ease-in-out infinite alternate;
        }

        .b2 {
          width: 58%;
          height: 67%;
          right: 0;
          top: 8%;

          background: rgba(105, 176, 244, 0.6);

          animation: b 9s ease-in-out infinite alternate;
        }

        .b3 {
          width: 48%;
          height: 58%;
          left: 28%;
          bottom: 0;

          background: rgba(218, 230, 242, 0.94);

          animation: c 6s ease-in-out infinite alternate;
        }

        .b4 {
          width: 40%;
          height: 50%;
          left: 33%;
          top: 18%;

          background: rgba(255, 255, 255, 0.97);

          animation: d 8s ease-in-out infinite alternate;
        }

        /*
          Молочная дымка поверх цвета.

          Она немного "съедает" цифровую чистоту градиента
          и делает поверхность визуально матовой.
        */
        .matte-haze {
          position: absolute;
          inset: 0;
          z-index: 3;

          background:
            radial-gradient(
              ellipse 33% 30% at 31% 40%,
              rgba(255, 255, 255, 0.22),
              transparent 75%
            ),
            radial-gradient(
              ellipse 38% 34% at 68% 57%,
              rgba(238, 244, 250, 0.2),
              transparent 78%
            ),
            radial-gradient(
              ellipse 42% 36% at 50% 50%,
              rgba(255, 255, 255, 0.1),
              transparent 82%
            );

          filter: blur(16px);
        }

        /*
          Крупная органическая фактура.

          Здесь нет растягивания маленького noise SVG,
          поэтому не должно быть тех пиксельных пятен,
          которые были в прошлой версии.
        */
        .grain-large {
          position: absolute;
          inset: -10%;
          z-index: 5;

          opacity: 0.16;

          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='420' viewBox='0 0 420 420'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.018' numOctaves='3' seed='19' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='1.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.85'/%3E%3C/svg%3E");

          background-repeat: repeat;
          background-size: 420px 420px;

          mix-blend-mode: soft-light;

          -webkit-mask-image: radial-gradient(
            ellipse 48% 43% at 50% 50%,
            black 0%,
            rgba(0, 0, 0, 0.9) 42%,
            rgba(0, 0, 0, 0.48) 66%,
            transparent 88%
          );

          mask-image: radial-gradient(
            ellipse 48% 43% at 50% 50%,
            black 0%,
            rgba(0, 0, 0, 0.9) 42%,
            rgba(0, 0, 0, 0.48) 66%,
            transparent 88%
          );
        }

        /*
          Второй слой — очень мелкое бумажное зерно.

          Он нужен не для заметной "ряби", а чтобы большие
          гладкие области перестали выглядеть идеально цифровыми.
        */
        .grain-fine {
          position: absolute;
          inset: 0;
          z-index: 6;

          opacity: 0.055;

          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.115' numOctaves='2' seed='31' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='.28'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");

          background-repeat: repeat;
          background-size: 180px 180px;

          mix-blend-mode: soft-light;

          -webkit-mask-image: radial-gradient(
            ellipse 47% 42% at 50% 50%,
            black 0%,
            rgba(0, 0, 0, 0.75) 50%,
            transparent 87%
          );

          mask-image: radial-gradient(
            ellipse 47% 42% at 50% 50%,
            black 0%,
            rgba(0, 0, 0, 0.75) 50%,
            transparent 87%
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
            rgba(255, 255, 255, 0.97) 0%,
            rgba(255, 255, 255, 0.87) 20%,
            rgba(247, 250, 253, 0.62) 44%,
            rgba(240, 246, 252, 0.25) 67%,
            transparent 100%
          );

          filter: blur(19px);
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
          .cloud {
            width: 900px;
            height: 540px;
          }

          .word-clear-zone {
            left: 50%;
            width: 260px;
            height: 110px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .b {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}