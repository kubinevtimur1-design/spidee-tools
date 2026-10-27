"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL = "hello@spidytools.ru";

const REASONS = [
  {
    text: "нашёл баг или что-то работает странно?",
    desktopPos: "md:left-[6%] md:top-[4%] md:-rotate-[2.5deg]",
    mobileIndent: "ml-0",
    accentNode: false,
  },
  {
    text: "есть идея для нового инструмента?",
    desktopPos: "md:left-[24%] md:top-[24%] md:rotate-[1.2deg]",
    mobileIndent: "ml-4 sm:ml-6",
    accentNode: true,
  },
  {
    text: "хочешь предложить улучшение?",
    desktopPos: "md:left-[12%] md:top-[46%] md:-rotate-[0.8deg]",
    mobileIndent: "ml-1.5 sm:ml-3",
    accentNode: false,
  },
  {
    text: "вопрос по Spidy Tools?",
    desktopPos: "md:left-[28%] md:top-[67%] md:rotate-[1.8deg]",
    mobileIndent: "ml-5 sm:ml-8",
    accentNode: false,
  },
  {
    text: "хочешь обсудить сотрудничество?",
    desktopPos: "md:left-[4%] md:top-[87%] md:-rotate-[1.4deg]",
    mobileIndent: "ml-0.5 sm:ml-2",
    accentNode: true,
  },
];

type WebPulse = {
  id: number;
  path: string;
  color: "dark" | "red";
};

const WEB_PULSE_PATHS = [
  "M 340 320 L 416 243 L 492 166 Q 550 216 596 238 Q 590 290 616 318 L 754 317 Q 688 398 706 437 L 828 476 L 950 515",

  "M 350 230 L 360 140 Q 432 174 492 166 L 568 89 Q 655 164 724 197 L 852 156 Q 840 260 892 316 L 1030 315",

  "M 258 356 L 176 392 Q 212 416 284 446 Q 316 458 368 448 Q 410 462 472 444 L 538 506 L 604 568",

  "M 340 320 L 478 319 L 616 318 L 754 317 L 892 316 L 1030 315 L 1168 314 L 1306 313",

  "M 340 320 L 406 382 L 472 444 L 538 506 L 604 568 L 670 630 L 736 692 L 802 754",

  "M 340 320 L 350 230 L 360 140 L 370 50 L 380 -40",

  "M 340 320 L 468 279 L 596 238 L 724 197 L 852 156 L 980 115 L 1108 74 L 1236 33",

  "M 340 320 L 258 356 L 176 392 L 94 428 L 12 464 L -70 500",
];

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12.5 9.3 17 19 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spider() {
  return (
    <div className="spider" aria-hidden="true">
      <span className="spider-body" />
      <span className="spider-head" />

      <span className="leg leg-1" />
      <span className="leg leg-2" />
      <span className="leg leg-3" />
      <span className="leg leg-4" />
      <span className="leg leg-5" />
      <span className="leg leg-6" />
      <span className="leg leg-7" />
      <span className="leg leg-8" />
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const [dropping, setDropping] = useState(false);

  const resetTimer = useRef<number | null>(null);
  const spiderTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }

      if (spiderTimer.current !== null) {
        window.clearTimeout(spiderTimer.current);
      }
    };
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const textarea = document.createElement("textarea");

      textarea.value = EMAIL;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(true);

    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }

    resetTimer.current = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    if (!dropping) {
      setDropping(true);

      if (spiderTimer.current !== null) {
        window.clearTimeout(spiderTimer.current);
      }

      spiderTimer.current = window.setTimeout(() => {
        setDropping(false);
      }, 2600);
    }
  }

  return (
    <div className="copy-wrap">
      <button
        type="button"
        onClick={copyEmail}
        className="copy-button"
        aria-label="Скопировать почту"
      >
        <CopyIcon copied={copied} />
      </button>

      <div className={`spider-rig ${dropping ? "is-dropped" : ""}`}>
        <span className="web-thread" />
        <Spider />
      </div>

      <div className={`copy-hint ${copied ? "is-visible" : ""}`}>
        Скопировано
      </div>
    </div>
  );
}

function FloatingReasons() {
  return (
    <div className="reasons-container relative mt-10 md:mt-0 md:h-[340px] lg:h-[360px]">
      <div
        className="absolute bottom-2 left-[11px] top-2 w-[1px] bg-gradient-to-b from-black/0 via-black/[0.1] to-black/0 md:hidden"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 sm:gap-5 md:block md:h-full md:w-full">
        {REASONS.map((reason, index) => (
          <div
            key={reason.text}
            className={`floating-reason floating-reason-${index + 1} ${reason.mobileIndent} md:ml-0 md:absolute ${reason.desktopPos}`}
          >
            <span
              className={`reason-node ${
                reason.accentNode ? "reason-node-accent" : ""
              }`}
              aria-hidden="true"
            />

            <span className="reason-text">{reason.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RandomWebImpulses() {
  const [pulses, setPulses] = useState<WebPulse[]>([]);

  const pulseId = useRef(0);
  const nextShotTimer = useRef<number | null>(null);
  const removalTimers = useRef<number[]>([]);
  const lastPath = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    function shoot() {
      if (!active) return;

      let pathIndex = Math.floor(Math.random() * WEB_PULSE_PATHS.length);

      if (WEB_PULSE_PATHS.length > 1) {
        while (pathIndex === lastPath.current) {
          pathIndex = Math.floor(Math.random() * WEB_PULSE_PATHS.length);
        }
      }

      lastPath.current = pathIndex;

      const id = ++pulseId.current;

      const pulse: WebPulse = {
        id,
        path: WEB_PULSE_PATHS[pathIndex],
        color: Math.random() < 0.22 ? "red" : "dark",
      };

      setPulses((current) => [...current, pulse]);

      const removalTimer = window.setTimeout(() => {
        if (!active) return;

        setPulses((current) =>
          current.filter((item) => item.id !== id),
        );
      }, 1600);

      removalTimers.current.push(removalTimer);

      const nextDelay = 900 + Math.random() * 1700;

      nextShotTimer.current = window.setTimeout(shoot, nextDelay);
    }

    nextShotTimer.current = window.setTimeout(shoot, 550);

    return () => {
      active = false;

      if (nextShotTimer.current !== null) {
        window.clearTimeout(nextShotTimer.current);
      }

      removalTimers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      removalTimers.current = [];
    };
  }, []);

  return (
    <g aria-hidden="true">
      {pulses.map((pulse) => (
        <path
          key={pulse.id}
          d={pulse.path}
          pathLength="100"
          fill="none"
          stroke={pulse.color === "red" ? "#ff3830" : "#242424"}
          strokeWidth={pulse.color === "red" ? "1.35" : "1.3"}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`random-web-pulse ${
            pulse.color === "red" ? "random-web-pulse-red" : ""
          }`}
        />
      ))}
    </g>
  );
}

function AmbientWebPattern() {
  return (
    <div className="ambient-web-bg" aria-hidden="true">
      <svg
        viewBox="0 0 1440 760"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ambient-web-svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          className="web-layer-primary"
          stroke="#242424"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g strokeOpacity="0.06" strokeWidth="1">
            <path d="M340 320 L -120 80" />
            <path d="M340 320 L 90 -120" />
            <path d="M340 320 L 395 -140" />
            <path d="M340 320 L 780 -120" />
            <path d="M340 320 L 1280 40" />
            <path d="M340 320 L 1560 310" />
            <path d="M340 320 L 1480 680" />
            <path d="M340 320 L 960 890" />
            <path d="M340 320 L 470 910" />
            <path d="M340 320 L 85 890" />
            <path d="M340 320 L -160 540" />
          </g>

          <path
            d="M 238 267 Q 272 246 293 237 Q 326 239 350 230 Q 386 247 416 243 Q 445 268 468 279 Q 465 305 478 319 Q 456 346 462 359 Q 422 379 406 382 Q 375 391 354 384 Q 328 389 312 383 Q 276 368 258 356 Q 254 316 238 267 Z"
            strokeOpacity="0.075"
            strokeWidth="0.95"
          />

          <path
            d="M 136 214 Q 204 172 246 154 Q 312 158 360 140 Q 432 174 492 166 Q 550 216 596 238 Q 590 290 616 318 Q 572 372 584 398 Q 504 438 472 444 Q 410 462 368 448 Q 316 458 284 446 Q 212 416 176 392 Q 168 312 136 214 Z"
            strokeOpacity="0.068"
            strokeWidth="0.95"
          />

          <path
            d="M 34 161 Q 136 98 199 71 Q 298 77 370 50 Q 478 101 568 89 Q 655 164 724 197 Q 715 275 754 317 Q 688 398 706 437 Q 586 497 538 506 Q 445 533 382 512 Q 304 527 256 509 Q 148 464 94 428 Q 82 308 34 161 Z"
            strokeOpacity="0.058"
            strokeWidth="0.95"
          />
        </g>

        <g
          className="web-layer-secondary"
          stroke="#242424"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M -68 108 Q 68 24 152 -12 Q 284 -4 380 -40 Q 524 28 644 12 Q 760 112 852 156 Q 840 260 892 316 Q 804 424 828 476 Q 668 556 604 568 Q 480 604 396 576 Q 292 596 228 572 Q 84 512 12 464 Q -4 304 -68 108"
            strokeOpacity="0.05"
            strokeWidth="0.9"
          />

          <path
            d="M 405 -120 Q 590 -35 720 -65 Q 865 60 980 115 Q 965 245 1030 315 Q 920 450 950 515 Q 750 615 670 630 Q 515 675 410 640 Q 280 665 200 635 Q 20 560 -70 500"
            strokeOpacity="0.042"
            strokeWidth="0.9"
          />

          <path
            d="M 805 -135 Q 975 10 1108 74 Q 1090 230 1168 314 Q 1036 476 1072 554 Q 832 674 736 692 Q 550 746 424 704"
            strokeOpacity="0.036"
            strokeWidth="0.85"
          />

          <path
            d="M 1010 -90 Q 1140 15 1236 33 Q 1215 215 1306 313 Q 1152 502 1194 593 Q 914 733 802 754"
            strokeOpacity="0.028"
            strokeWidth="0.85"
          />

          <circle
            cx="472"
            cy="444"
            r="1.5"
            fill="#242424"
            fillOpacity="0.12"
            stroke="none"
          />

          <circle
            cx="284"
            cy="446"
            r="1.5"
            fill="#242424"
            fillOpacity="0.11"
            stroke="none"
          />

          <circle
            cx="584"
            cy="398"
            r="1.7"
            fill="#ff3830"
            fillOpacity="0.28"
            stroke="none"
          />
        </g>

        <RandomWebImpulses />
      </svg>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F7F5F2] text-[#242424]">
      <section className="relative overflow-hidden border-b border-black/[0.08]">
        <AmbientWebPattern />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-14 lg:pb-28">
          <div className="mb-12 text-[13px] text-black/40 sm:mb-16 lg:mb-24">
            Главная <span className="mx-2 text-black/20">/</span> Контакты
          </div>

          <div className="grid items-start gap-10 md:grid-cols-[1.18fr_0.82fr] md:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
  <div className="relative z-10 md:pt-8 lg:pt-10">
              <p className="mb-3 text-[15px] leading-[1.45] text-black/45 sm:text-[17px]">
                Есть вопрос, идея или что-то сломалось — пиши.
              </p>

              <div className="email-row">
                <a href={`mailto:${EMAIL}`} className="email-link">
                  {EMAIL}
                </a>

                <CopyEmail />
              </div>
            </div>

            <FloatingReasons />
          </div>
        </div>
      </section>

      <style jsx global>{`
        .ambient-web-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          user-select: none;
          overflow: hidden;

          mask-image: radial-gradient(
            ellipse 90% 85% at 42% 50%,
            rgba(0, 0, 0, 1) 28%,
            rgba(0, 0, 0, 0.65) 72%,
            rgba(0, 0, 0, 0) 100%
          );

          -webkit-mask-image: radial-gradient(
            ellipse 90% 85% at 42% 50%,
            rgba(0, 0, 0, 1) 28%,
            rgba(0, 0, 0, 0.65) 72%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        .ambient-web-svg {
          width: 100%;
          height: 100%;
          min-height: 520px;
        }

        .web-layer-primary {
          transform-origin: 340px 320px;
          will-change: transform;
          animation: ambient-web-drift-1 16s ease-in-out infinite;
        }

        .web-layer-secondary {
          transform-origin: 340px 320px;
          will-change: transform;
          animation: ambient-web-drift-2 22s ease-in-out infinite;
        }

        /*
         * Импульс всё время движется.
         * На последней четверти он не останавливается,
         * а продолжает движение и одновременно растворяется.
         */
        .random-web-pulse {
          stroke-dasharray: 14 86;
          stroke-dashoffset: 100;
          opacity: 0;

          animation: random-web-shot 1.45s linear forwards;

          will-change: stroke-dashoffset, opacity;
        }

        .random-web-pulse-red {
          animation-duration: 1.25s;
        }

        @keyframes random-web-shot {
          0% {
            stroke-dashoffset: 100;
            opacity: 0;
          }

          5% {
            opacity: 0.4;
          }

          68% {
            opacity: 0.4;
          }

          82% {
            opacity: 0.28;
          }

          92% {
            opacity: 0.11;
          }

          100% {
            stroke-dashoffset: -14;
            opacity: 0;
          }
        }

        @keyframes ambient-web-drift-1 {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }

          35% {
            transform: translate3d(4px, 6px, 0) rotate(0.45deg)
              scale(1.012);
          }

          70% {
            transform: translate3d(-3px, 3px, 0) rotate(-0.3deg)
              scale(0.994);
          }
        }

        @keyframes ambient-web-drift-2 {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }

          50% {
            transform: translate3d(-6px, 8px, 0) rotate(-0.6deg)
              scale(1.018);
          }
        }

        .email-row {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .email-link {
          display: block;
          color: #242424;
          font-size: clamp(28px, 4.15vw, 58px);
          font-weight: 700;
          line-height: 0.98;
          letter-spacing: -0.055em;
          white-space: nowrap;
          transition: opacity 180ms ease;
        }

        .email-link:hover {
          opacity: 0.58;
        }

        .copy-wrap {
          position: relative;
          z-index: 20;
          flex: 0 0 auto;
          width: 44px;
          height: 44px;
          margin-left: 12px;
        }

        .copy-button {
          position: relative;
          z-index: 4;
          display: flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.34);
          color: #242424;
          cursor: pointer;

          transition:
            transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
            background 180ms ease,
            border-color 180ms ease;
        }

        .copy-button:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(0, 0, 0, 0.16);
        }

        .copy-button:active {
          transform: translateY(0) scale(0.96);
        }

        .copy-hint {
          position: absolute;
          left: 50%;
          top: 52px;
          z-index: 10;

          padding: 6px 9px;

          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 9px;

          background: #242424;
          color: #fff;

          font-size: 11px;
          font-weight: 600;
          line-height: 1;

          white-space: nowrap;
          pointer-events: none;

          opacity: 0;
          transform: translate(-50%, 4px);

          transition:
            opacity 180ms ease,
            transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .copy-hint.is-visible {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        .spider-rig {
          position: absolute;
          z-index: 3;
          left: 50%;
          top: 36px;

          width: 30px;
          height: 30px;

          transform: translateX(-50%);
          pointer-events: none;

          --thread-length: 13px;
          --spider-y: 7px;
        }

        .web-thread {
          position: absolute;
          left: 50%;
          top: -1px;

          width: 1px;
          height: var(--thread-length);

          background: rgba(36, 36, 36, 0.38);

          transform: translateX(-50%);
          transform-origin: top;

          transition: height 720ms cubic-bezier(0.3, 0.02, 0.18, 1);
        }

        .spider {
          position: absolute;
          left: 50%;
          top: var(--spider-y);

          width: 20px;
          height: 20px;

          transform: translateX(-50%);
          transform-origin: 50% -8px;

          transition: top 720ms cubic-bezier(0.3, 0.02, 0.18, 1);

          animation: spider-idle 3.6s ease-in-out infinite;
        }

        .spider-body {
          position: absolute;
          left: 50%;
          top: 7px;

          width: 8px;
          height: 9px;

          border-radius: 55% 55% 48% 48%;
          background: #ff3830;

          transform: translateX(-50%);
        }

        .spider-head {
          position: absolute;
          left: 50%;
          top: 3px;

          width: 6px;
          height: 6px;

          border-radius: 50%;
          background: #ff3830;

          transform: translateX(-50%);
        }

        .leg {
          position: absolute;

          width: 7px;
          height: 1.4px;

          border-radius: 99px;
          background: #ff3830;

          transform-origin: center;
        }

        .leg-1 {
          left: 1px;
          top: 7px;
          transform: rotate(27deg);
        }

        .leg-2 {
          left: 0;
          top: 10px;
          transform: rotate(7deg);
        }

        .leg-3 {
          left: 1px;
          top: 13px;
          transform: rotate(-20deg);
        }

        .leg-4 {
          left: 3px;
          top: 15px;
          transform: rotate(-42deg);
        }

        .leg-5 {
          right: 1px;
          top: 7px;
          transform: rotate(-27deg);
        }

        .leg-6 {
          right: 0;
          top: 10px;
          transform: rotate(-7deg);
        }

        .leg-7 {
          right: 1px;
          top: 13px;
          transform: rotate(20deg);
        }

        .leg-8 {
          right: 3px;
          top: 15px;
          transform: rotate(42deg);
        }

        .spider-rig.is-dropped {
          --thread-length: 126px;
          --spider-y: 120px;
        }

        .spider-rig.is-dropped .spider {
          animation: spider-drop-wobble 2.6s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .floating-reason {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          max-width: 100%;

          color: rgba(36, 36, 36, 0.28);

          font-size: clamp(15px, 1.35vw, 19px);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.025em;

          transition:
            color 240ms ease,
            transform 240ms ease;

          will-change: translate;
        }

        .floating-reason:hover {
          color: rgba(36, 36, 36, 0.62);
        }

        .reason-node {
          flex: 0 0 auto;

          width: 4.5px;
          height: 4.5px;

          border-radius: 50%;
          background: rgba(36, 36, 36, 0.22);

          transition:
            transform 240ms ease,
            background 240ms ease;
        }

        .reason-node-accent {
          background: rgba(255, 56, 48, 0.45);
        }

        .floating-reason:hover .reason-node {
          transform: scale(1.45);
          background: #ff3830;
        }

        .reason-text {
          white-space: nowrap;
        }

        .floating-reason-1 {
          animation: float-one 7.5s ease-in-out infinite;
        }

        .floating-reason-2 {
          animation: float-two 9s ease-in-out infinite;
        }

        .floating-reason-3 {
          animation: float-three 8.2s ease-in-out infinite;
        }

        .floating-reason-4 {
          animation: float-four 10s ease-in-out infinite;
        }

        .floating-reason-5 {
          animation: float-five 8.8s ease-in-out infinite;
        }

        @keyframes spider-idle {
          0%,
          100% {
            transform: translateX(-50%) rotate(-2deg);
          }

          38% {
            transform: translateX(-50%) rotate(2.5deg);
          }

          67% {
            transform: translateX(-50%) rotate(-1deg);
          }
        }

        @keyframes spider-drop-wobble {
          0% {
            transform: translateX(-50%) rotate(-2deg);
          }

          29% {
            transform: translateX(-50%) rotate(6deg);
          }

          44% {
            transform: translateX(-50%) rotate(-4deg);
          }

          62% {
            transform: translateX(-50%) rotate(2.5deg);
          }

          78% {
            transform: translateX(-50%) rotate(-1.5deg);
          }

          100% {
            transform: translateX(-50%) rotate(0);
          }
        }

        @keyframes float-one {
          0%,
          100% {
            translate: 0 0;
          }

          50% {
            translate: 6px -5px;
          }
        }

        @keyframes float-two {
          0%,
          100% {
            translate: 0 0;
          }

          50% {
            translate: -6px 5px;
          }
        }

        @keyframes float-three {
          0%,
          100% {
            translate: 0 0;
          }

          50% {
            translate: 5px 6px;
          }
        }

        @keyframes float-four {
          0%,
          100% {
            translate: 0 0;
          }

          50% {
            translate: -5px -5px;
          }
        }

        @keyframes float-five {
          0%,
          100% {
            translate: 0 0;
          }

          50% {
            translate: 6px -4px;
          }
        }

        @media (max-width: 1023px) {
          .reason-text {
            white-space: normal;
          }
        }

        @media (max-width: 767px) {
          .ambient-web-bg {
            mask-image: radial-gradient(
              ellipse 110% 90% at 50% 42%,
              rgba(0, 0, 0, 0.9) 20%,
              rgba(0, 0, 0, 0.45) 70%,
              rgba(0, 0, 0, 0) 100%
            );

            -webkit-mask-image: radial-gradient(
              ellipse 110% 90% at 50% 42%,
              rgba(0, 0, 0, 0.9) 20%,
              rgba(0, 0, 0, 0.45) 70%,
              rgba(0, 0, 0, 0) 100%
            );
          }

          .email-row {
            align-items: center;
          }

          .email-link {
            font-size: clamp(24px, 7.2vw, 36px);
            white-space: nowrap;
          }

          .floating-reason {
            font-size: 15.5px;
            color: rgba(36, 36, 36, 0.34);
          }
        }

        @media (max-width: 374px) {
          .email-link {
            font-size: 22px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .spider,
          .web-thread,
          .web-layer-primary,
          .web-layer-secondary,
          .random-web-pulse,
          .floating-reason {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }

          .random-web-pulse {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}