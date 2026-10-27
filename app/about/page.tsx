"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL = "hello@spidytools.ru";

function CopyIcon({ copied }: { copied: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[17px] w-[17px]">
      {copied ? (
        <path d="M5 12.5L9.2 16.5L19 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <rect x="8" y="8" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      Object.assign(ta.style, { position: "fixed", opacity: "0", pointerEvents: "none" });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    timer.current && clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`copy-email-button ${copied ? "is-copied" : ""}`}
      aria-label={copied ? "Email скопирован" : "Скопировать email"}
      title={copied ? "Скопировано" : "Скопировать"}
    >
      <CopyIcon copied={copied} />
      <span className="copy-tooltip" aria-hidden="true">
        {copied ? "Скопировано" : "Скопировать"}
      </span>
    </button>
  );
}

function DecorativeWeb() {
  return (
    <div className="decorative-web" aria-hidden="true">
      <svg viewBox="0 0 620 620" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <g stroke="#242424" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M310 306L310 -30M310 306L548 32M310 306L680 176M310 306L666 438M310 306L514 676M310 306L238 680M310 306L-12 560M310 306L-48 270M310 306L54 14" />
          <path d="M310 224Q370 232 409 263Q423 308 409 347Q367 380 309 388Q256 377 219 344Q203 303 221 262Q257 232 310 224Z" />
          <path d="M310 154Q407 164 473 218Q496 302 472 393Q403 448 307 462Q216 443 151 389Q127 304 153 216Q217 165 310 154Z" />
          <path d="M310 75Q451 91 545 169Q579 295 544 442Q446 521 304 542Q170 514 75 437Q41 305 78 166Q172 92 310 75Z" />
          <path d="M310 -18Q496 4 620 108Q665 289 618 502Q488 606 300 635Q122 598 -3 496Q-49 307 0 103Q125 5 310 -18Z" />
        </g>
        <circle cx="310" cy="306" r="3.2" fill="#FF3830" />
        <circle className="web-dot web-dot-1" cx="409" cy="263" r="3" fill="#FF3830" />
        <circle className="web-dot web-dot-2" cx="151" cy="389" r="2.5" fill="#242424" />
        <circle className="web-dot web-dot-3" cx="545" cy="169" r="2.5" fill="#242424" />
      </svg>
    </div>
  );
}

function BrowserHint() {
  return (
    <div className="browser-hint" aria-hidden="true">
      <div className="browser-hint-top">
        <div className="browser-controls"><span /><span /><span /></div>
        <div className="browser-address">
          <span className="browser-lock">
            <svg viewBox="0 0 16 16" fill="none">
              <rect x="3.5" y="7" width="9" height="6.5" rx="1.7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5.5 7V5.3A2.5 2.5 0 0 1 8 2.8a2.5 2.5 0 0 1 2.5 2.5V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
          <span>spidytools.ru</span>
        </div>
        <span className="browser-bookmark">☆</span>
      </div>
      <div className="browser-hint-body">
        <span className="browser-tab-star">*</span>
        <span>Spidy Tools</span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page min-h-[calc(100vh-80px)] bg-[#F7F5F2] text-[#242424]">
      <DecorativeWeb />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-32 sm:pt-14 lg:pb-36">
        <div className="mb-7 text-[13px] text-black/40 sm:mb-9 lg:mb-10">
          Главная <span className="mx-2 text-black/20">/</span> О нас
        </div>

        <div className="max-w-[960px]">
          <div className="hero-row">
            <span className="hero-star" aria-hidden="true">*</span>
            <h1 className="max-w-[900px] text-[clamp(46px,7.3vw,94px)] font-bold leading-[0.93] tracking-[-0.065em]">
              Простые инструменты
              <br className="hidden sm:block" /> в одной вкладке
            </h1>
          </div>

          <div className="about-content ml-[2px] mt-12 max-w-[720px] sm:ml-[72px] sm:mt-16">
            <div className="about-copy">
              <p>Spidy Tools — это набор небольших инструментов, которые реально нужны в работе.</p>
              <p>
                Собрали в одном месте всё то, за чем обычно приходится ходить по разным сайтам: собрать UTM-метку, проверить длину текста, подготовить разметку и решить другие мелкие задачи.
              </p>
              <p>
                Мы постоянно добавляем новые инструменты и улучшаем те, что уже есть. Если тебе чего-то не хватает или есть идея — пиши на{" "}
                <span className="email-inline">
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  <CopyEmail />
                </span>.
              </p>
              <p>
                Чтобы не искать нас потом, предлагаем добавить{" "}
                <span className="spidy-inline">
                  <span className="spidy-inline-star" aria-hidden="true">*</span>
                  Spidy Tools
                </span>{" "}
                в закладки или закрепить сайт в панели быстрого доступа браузера. Так нужные инструменты всегда будут в одной вкладке.
              </p>
            </div>
            <BrowserHint />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .about-page {
          --ink: #242424;
          --red: #ff3830;
          --acid: #d7ff00;
          position: relative;
          overflow: hidden;
        }
        .hero-row { display: flex; align-items: flex-start; gap: 16px; }
        .hero-star {
          display: block; flex: 0 0 auto; margin-top: -0.07em; color: var(--red);
          font-size: clamp(68px, 8vw, 108px); font-weight: 700; line-height: 0.9;
          letter-spacing: -0.08em; transform: rotate(-7deg); transform-origin: center;
        }
        .about-copy {
          display: flex; flex-direction: column; gap: 19px;
          color: rgba(36, 36, 36, 0.62); font-size: clamp(17px, 1.55vw, 20px);
          font-weight: 400; line-height: 1.52; letter-spacing: -0.025em;
        }
        .decorative-web {
          position: absolute; z-index: 0; top: 30px; right: -105px;
          width: min(52vw, 640px); height: min(52vw, 640px); opacity: 0.055;
          pointer-events: none; user-select: none;
          mask-image: radial-gradient(circle at center, #000 22%, rgba(0,0,0,.72) 57%, transparent 84%);
          -webkit-mask-image: radial-gradient(circle at center, #000 22%, rgba(0,0,0,.72) 57%, transparent 84%);
        }
        .web-dot { transform-box: fill-box; transform-origin: center; }
        .web-dot-1 { animation: web-dot-pulse 2.8s ease-in-out infinite; }
        .web-dot-2 { animation: web-dot-pulse 3.4s ease-in-out 0.8s infinite; }
        .web-dot-3 { animation: web-dot-pulse 3s ease-in-out 1.4s infinite; }
        @keyframes web-dot-pulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1.7); }
        }
        .email-inline { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
        .email-inline > a { position: relative; z-index: 0; color: var(--ink); text-decoration: none; }
        .email-inline > a::after {
          content: ""; position: absolute; z-index: -1; right: -.04em; bottom: .03em; left: -.04em;
          height: .28em; background: var(--acid); opacity: 0; transform: rotate(-1deg) scaleX(.75);
          transform-origin: left; transition: opacity 180ms ease, transform 220ms ease;
          clip-path: polygon(0 18%, 8% 7%, 19% 12%, 32% 4%, 46% 10%, 60% 3%, 73% 9%, 87% 2%, 100% 13%, 98% 88%, 82% 92%, 67% 85%, 52% 94%, 35% 87%, 18% 95%, 1% 84%);
        }
        .email-inline > a:hover::after { opacity: .9; transform: rotate(-1deg) scaleX(1); }
        .copy-email-button {
          position: relative; display: inline-flex; flex: 0 0 auto; width: 31px; height: 31px;
          align-items: center; justify-content: center; border: 1px solid rgba(36,36,36,.12);
          border-radius: 9px; background: rgba(255,255,255,.4); color: rgba(36,36,36,.48);
          cursor: pointer; vertical-align: middle;
          transition: color 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease;
        }
        .copy-email-button:hover {
          border-color: rgba(36,36,36,.22); background: rgba(255,255,255,.72);
          color: var(--ink); transform: translateY(-1px);
        }
        .copy-email-button.is-copied { border-color: rgba(255,56,48,.25); color: var(--red); }
        .copy-tooltip {
          position: absolute; z-index: 20; bottom: calc(100% + 9px); left: 50%;
          padding: 6px 8px; border-radius: 7px; background: var(--ink); color: #fff;
          font-size: 10px; font-weight: 600; line-height: 1; white-space: nowrap;
          opacity: 0; pointer-events: none; transform: translate(-50%, 4px);
          transition: opacity 160ms ease, transform 160ms ease;
        }
        .copy-email-button:hover .copy-tooltip,
        .copy-email-button.is-copied .copy-tooltip { opacity: 1; transform: translate(-50%, 0); }
        .spidy-inline { display: inline-flex; align-items: baseline; white-space: nowrap; }
        .spidy-inline-star { margin-right: .12em; color: var(--red); font-size: 1.25em; font-weight: 700; line-height: 0; }
        .browser-hint {
          width: min(100%, 590px); margin-top: 42px; overflow: hidden;
          border: 1px solid rgba(36,36,36,.11); border-radius: 18px;
          background: rgba(255,255,255,.38);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.75), 0 18px 55px rgba(36,36,36,.035);
          transform: rotate(-.8deg); transition: transform 280ms ease, box-shadow 280ms ease;
        }
        .browser-hint:hover {
          transform: translateY(-3px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 24px 60px rgba(36,36,36,.06);
        }
        .browser-hint-top {
          display: grid; grid-template-columns: 44px minmax(0,1fr) 24px;
          min-height: 52px; align-items: center; gap: 12px; padding: 0 14px;
          border-bottom: 1px solid rgba(36,36,36,.08);
        }
        .browser-controls { display: flex; gap: 5px; }
        .browser-controls span { width: 6px; height: 6px; border-radius: 50%; background: rgba(36,36,36,.16); }
        .browser-address {
          display: flex; min-width: 0; height: 30px; align-items: center; gap: 7px;
          padding: 0 10px; overflow: hidden; border: 1px solid rgba(36,36,36,.07);
          border-radius: 9px; background: rgba(36,36,36,.035); color: rgba(36,36,36,.42);
          font-size: 11px; font-weight: 550; white-space: nowrap;
        }
        .browser-lock { display: inline-flex; flex: 0 0 auto; width: 14px; height: 14px; }
        .browser-bookmark { color: var(--red); font-size: 20px; line-height: 1; transform: translateY(-1px); }
        .browser-hint-body {
          display: flex; min-height: 82px; align-items: center; gap: 9px; padding: 0 20px;
          color: rgba(36,36,36,.72); font-size: 13px; font-weight: 700; letter-spacing: -.02em;
        }
        .browser-tab-star { color: var(--red); font-size: 24px; font-weight: 800; line-height: 1; }

        @media (max-width: 767px) {
          .hero-row { gap: 9px; }
          .hero-star { margin-top: -.02em; font-size: clamp(54px, 15vw, 72px); }
          .decorative-web { top: 75px; right: -190px; width: 540px; height: 540px; opacity: .035; }
          .about-copy { gap: 17px; }
          .email-inline { white-space: normal; }
          .copy-email-button { transform: translateY(-2px); }
          .browser-hint { margin-top: 34px; }
          .browser-hint-top { grid-template-columns: 32px minmax(0,1fr) 20px; gap: 8px; padding: 0 10px; }
        }
        @media (max-width: 430px) {
          .email-inline > a { font-size: .92em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .web-dot { animation: none !important; }
          .browser-hint, .copy-email-button, .email-inline > a::after { transition: none !important; }
        }
      `}</style>
    </main>
  );
}