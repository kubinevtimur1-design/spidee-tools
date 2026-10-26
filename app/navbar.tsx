"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

type Tool = {
  href?: string;
  title: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
};

const TOOLS: Tool[] = [
  {
    href: "/counter",
    title: "Подсчет символов",
    description: "Title и Description",
    icon: "T",
  },
  {
    href: "/utm-generator",
    title: "Генератор UTM",
    description: "Разметка рекламных ссылок",
    icon: "↗",
  },
  {
    href: "/faq-schema-generator",
    title: "FAQ Schema",
    description: "JSON-LD разметка FAQ",
    icon: "{}",
  },
  {
    title: "Выгрузка meta",
    description: "Парсинг тегов по URL",
    icon: "#",
    comingSoon: true,
  },
];

const META_NOTICE = "Выгрузка meta скоро появится";
const CONTACTS_NOTICE = "Контакты скоро появятся";
const BLOG_NOTICE = "Блог скоро появится";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const logoAnimationRef = useRef<Animation | null>(null);

  const showNotice = (text: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setNotice(text);

    timerRef.current = setTimeout(() => {
      setNotice(null);
    }, 2000);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileToolsOpen(false);
    setNotice(null);
  };

  const dropLogo = (event: ReactMouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const logo = logoRef.current;
    const current = logoAnimationRef.current;

    if (
      !logo ||
      (current &&
        current.playState !== "finished" &&
        current.playState !== "idle")
    ) {
      return;
    }

    const h = window.innerHeight;

    const animation = logo.animate(
      [
        {
          transform: "translateY(0) rotate(0deg)",
          offset: 0,
          easing: "cubic-bezier(0.4, 0, 0.9, 0.35)",
        },
        {
          transform: `translateY(${h + 100}px) rotate(900deg)`,
          offset: 0.43,
        },
        {
          transform: `translateY(-${h + 120}px) rotate(900deg)`,
          offset: 0.431,
        },
        {
          transform: "translateY(7px) rotate(1760deg)",
          offset: 0.88,
          easing: "cubic-bezier(0.1, 0.65, 0.3, 1)",
        },
        {
          transform: "translateY(-7px) rotate(1780deg)",
          offset: 0.94,
        },
        {
          transform: "translateY(0) rotate(1800deg)",
          offset: 1,
        },
      ],
      {
        duration: 2200,
      }
    );

    logoAnimationRef.current = animation;

    const reset = () => {
      logoAnimationRef.current = null;
    };

    animation.onfinish = reset;
    animation.oncancel = reset;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      logoAnimationRef.current?.cancel();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#F7F5F2]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* LOGO */}

        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-1.5 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <Image
            ref={logoRef}
            src="/spidy-logo.PNG"
            alt="Spidy Tools"
            width={32}
            height={32}
            priority
            onClick={dropLogo}
            className="relative z-[100] h-8 w-8 cursor-pointer object-contain transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 group-active:rotate-0"
          />

          <span className="text-[19px] font-bold tracking-[-0.04em] text-[#0B0B0B] transition-colors duration-200 group-hover:text-[#FF3830]">
            Spidy Tools
          </span>
        </Link>

        {/* DESKTOP */}

        <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#0B0B0B] md:flex">
          {/* TOOLS */}

          <div className="group relative py-5">
            <button
              type="button"
              className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-[#FF3830]"
            >
              Инструменты

              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* DROPDOWN */}

            <div className="invisible absolute left-0 top-full z-50 -translate-y-2 pt-1 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="w-[290px] overflow-hidden rounded-[18px] border border-black/[0.08] bg-[#F7F5F2]/98 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.09)] backdrop-blur-xl">
                {TOOLS.map((tool) => (
                  <ToolItem
                    key={tool.title}
                    tool={tool}
                    notice={
                      tool.comingSoon && notice === META_NOTICE
                        ? notice
                        : undefined
                    }
                    onComingSoon={() => showNotice(META_NOTICE)}
                  />
                ))}
              </div>
            </div>
          </div>

          <NavLink href="/pricing">
            Тарифы
          </NavLink>

          <NavButton
            onClick={() => showNotice(CONTACTS_NOTICE)}
            notice={
              notice === CONTACTS_NOTICE
                ? notice
                : undefined
            }
          >
            Контакты
          </NavButton>

          <NavButton
            onClick={() => showNotice(BLOG_NOTICE)}
            notice={
              notice === BLOG_NOTICE
                ? notice
                : undefined
            }
          >
            Блог
          </NavButton>
        </nav>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={
            mobileOpen
              ? "Закрыть меню"
              : "Открыть меню"
          }
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.1] transition-all duration-200 hover:border-black/[0.2] hover:bg-black/[0.04] active:scale-90 md:hidden"
        >
          <div className="relative h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 rounded-full bg-black transition-all duration-300 ${
                mobileOpen
                  ? "top-[7px] rotate-45"
                  : "top-0"
              }`}
            />

            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-black transition-all duration-200 ${
                mobileOpen
                  ? "scale-x-0 opacity-0"
                  : "scale-x-100 opacity-100"
              }`}
            />

            <span
              className={`absolute left-0 h-0.5 w-5 rounded-full bg-black transition-all duration-300 ${
                mobileOpen
                  ? "top-[7px] -rotate-45"
                  : "top-[14px]"
              }`}
            />
          </div>
        </button>
      </div>

      <ElasticString />

      {/* MOBILE MENU */}

      <div
        className={`overflow-hidden bg-[#F7F5F2] transition-all duration-300 ease-out md:hidden ${
          mobileOpen
            ? "max-h-[650px] border-t border-black/[0.08] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 pb-5 pt-3 sm:px-6">
          <button
            type="button"
            onClick={() =>
              setMobileToolsOpen((value) => !value)
            }
            className="flex w-full items-center justify-between border-b border-black/[0.08] py-3.5 text-left text-sm font-bold transition-colors duration-200"
          >
            Инструменты

            <span
              className={`text-lg font-normal transition-transform duration-300 ${
                mobileToolsOpen ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              mobileToolsOpen
                ? "max-h-[460px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-b border-black/[0.08] py-2">
              {TOOLS.map((tool) => (
                <MobileToolItem
                  key={tool.title}
                  tool={tool}
                  notice={
                    tool.comingSoon && notice === META_NOTICE
                      ? notice
                      : undefined
                  }
                  onNavigate={closeMobileMenu}
                  onComingSoon={() => showNotice(META_NOTICE)}
                />
              ))}
            </div>
          </div>

          <MobileNavLink
            href="/pricing"
            onClick={closeMobileMenu}
          >
            Тарифы
          </MobileNavLink>

          <MobileNavButton
            onClick={() => showNotice(CONTACTS_NOTICE)}
            notice={
              notice === CONTACTS_NOTICE
                ? notice
                : undefined
            }
          >
            Контакты
          </MobileNavButton>

          <MobileNavButton
            onClick={() => showNotice(BLOG_NOTICE)}
            notice={
              notice === BLOG_NOTICE
                ? notice
                : undefined
            }
          >
            Блог
          </MobileNavButton>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------ */
/* ELASTIC STRING                                   */
/* ------------------------------------------------ */

function ElasticString() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const frameRef = useRef<number | null>(null);

  const state = useRef({
    x: 0.5,
    y: 0,
    velocity: 0,
    lastMouseY: 0,
    lastTime: 0,
    initialized: false,
    interacting: false,
  });

  const draw = useCallback(() => {
    const s = state.current;

    pathRef.current?.setAttribute(
      "d",
      `M 0 20 Q ${s.x * 1000} ${20 + s.y} 1000 20`
    );
  }, []);

  const animate = useCallback(() => {
    const s = state.current;

    if (!s.interacting) {
      s.velocity += -s.y * 0.09;
      s.velocity *= 0.91;
      s.y += s.velocity;

      if (
        Math.abs(s.y) < 0.03 &&
        Math.abs(s.velocity) < 0.03
      ) {
        s.y = 0;
        s.velocity = 0;
        draw();
        frameRef.current = null;
        return;
      }
    }

    draw();
    frameRef.current = requestAnimationFrame(animate);
  }, [draw]);

  const start = useCallback(() => {
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const handleMouseMove = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const s = state.current;
    const now = performance.now();

    if (!s.initialized) {
      s.lastMouseY = event.clientY;
      s.lastTime = now;
      s.initialized = true;
    }

    const velocity =
      ((event.clientY - s.lastMouseY) /
        Math.max(8, now - s.lastTime)) *
      16.67;

    s.x = Math.max(
      0.03,
      Math.min(
        0.97,
        (event.clientX - rect.left) / rect.width
      )
    );

    s.interacting = true;

    const pull = Math.max(
      -14,
      Math.min(
        14,
        event.clientY - (rect.top + rect.height / 2)
      )
    );

    s.y += (pull - s.y) * 0.42;
    s.velocity += velocity * 0.18;
    s.lastMouseY = event.clientY;
    s.lastTime = now;

    start();
  };

  const releaseString = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    const s = state.current;
    const now = performance.now();

    const velocity =
      ((event.clientY - s.lastMouseY) /
        Math.max(8, now - s.lastTime)) *
      16.67;

    s.velocity += Math.max(
      -12,
      Math.min(12, velocity * 0.75)
    );

    if (Math.abs(s.velocity) < 2.2) {
      s.velocity += s.y >= 0 ? -2.2 : 2.2;
    }

    s.interacting = false;
    s.initialized = false;

    start();
  };

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={releaseString}
      className="absolute -bottom-[20px] left-0 z-40 hidden h-10 w-full cursor-default md:block"
    >
      <svg
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
        className="pointer-events-none h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d="M 0 20 Q 500 20 1000 20"
          fill="none"
          stroke="rgba(11,11,11,0.16)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------ */
/* DESKTOP TOOL ITEM                                */
/* ------------------------------------------------ */

function ToolItem({
  tool,
  onComingSoon,
  notice,
}: {
  tool: Tool;
  onComingSoon: () => void;
  notice?: string;
}) {
  const content = <ToolContent tool={tool} desktop />;

  if (tool.href) {
    return (
      <Link
        href={tool.href}
        className="group/tool flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-black/[0.035] active:scale-[0.98]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onComingSoon}
        className="group/tool flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-black/[0.035] active:scale-[0.98]"
      >
        {content}
      </button>

      {notice && (
        <InlineNotice>
          {notice}
        </InlineNotice>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* MOBILE TOOL ITEM                                 */
/* ------------------------------------------------ */

function MobileToolItem({
  tool,
  onNavigate,
  onComingSoon,
  notice,
}: {
  tool: Tool;
  onNavigate: () => void;
  onComingSoon: () => void;
  notice?: string;
}) {
  const content = <ToolContent tool={tool} />;

  if (tool.href) {
    return (
      <Link
        href={tool.href}
        onClick={onNavigate}
        className="group/tool flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-all duration-200 hover:bg-black/[0.035] active:scale-[0.98]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onComingSoon}
        className="group/tool flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-all duration-200 hover:bg-black/[0.035] active:scale-[0.98]"
      >
        {content}
      </button>

      {notice && (
        <MobileInlineNotice>
          {notice}
        </MobileInlineNotice>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* TOOL CONTENT                                     */
/* ------------------------------------------------ */

function ToolContent({
  tool,
  desktop = false,
}: {
  tool: Tool;
  desktop?: boolean;
}) {
  return (
    <>
      <ToolIcon>
        {tool.icon}
      </ToolIcon>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`relative inline-block ${
              desktop ? "text-[13px]" : "text-sm"
            } font-bold text-[#0B0B0B]`}
          >
            <span
              className="pointer-events-none absolute -left-[0.12em] -right-[0.14em] top-[54%] z-0 h-[0.82em] origin-left -translate-y-1/2 -rotate-2 scale-x-[0.78] bg-[#D7FF00]/80 opacity-0 transition-all duration-200 ease-out group-hover/tool:scale-x-100 group-hover/tool:opacity-100"
              style={{
                clipPath:
                  "polygon(1% 13%, 8% 6%, 19% 10%, 31% 4%, 45% 8%, 57% 3%, 70% 7%, 83% 2%, 96% 8%, 100% 20%, 98% 83%, 91% 91%, 79% 87%, 66% 94%, 52% 88%, 39% 95%, 25% 89%, 13% 94%, 2% 85%)",
              }}
            />

            <span
              className="pointer-events-none absolute -left-[0.08em] -right-[0.1em] top-[58%] z-0 h-[0.58em] origin-left -translate-y-1/2 rotate-[0.8deg] scale-x-[0.78] bg-[#D7FF00]/25 opacity-0 transition-all duration-200 ease-out group-hover/tool:scale-x-100 group-hover/tool:opacity-100"
              style={{
                clipPath:
                  "polygon(0 15%, 15% 7%, 30% 13%, 48% 5%, 65% 11%, 82% 4%, 100% 12%, 98% 87%, 79% 93%, 60% 86%, 42% 94%, 21% 88%, 2% 94%)",
              }}
            />

            <span className="relative z-10">
              {tool.title}
            </span>
          </span>

          {tool.comingSoon && (
            <span className="shrink-0 rounded-md bg-[#FF3830]/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.04em] text-[#FF3830]">
              скоро
            </span>
          )}
        </div>

        <div className="mt-0.5 text-[10px] font-medium text-[#888888]">
          {tool.description}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------ */
/* TOOL ICON                                        */
/* ------------------------------------------------ */

function ToolIcon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-[#F7F5F2] text-[16px] font-bold text-[#0B0B0B] transition-all duration-200 ease-out group-hover/tool:-rotate-6 group-hover/tool:scale-105 group-hover/tool:border-black/[0.14] group-hover/tool:bg-white">
      {children}
    </span>
  );
}

/* ------------------------------------------------ */
/* DESKTOP NAV                                      */
/* ------------------------------------------------ */

function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="transition-all duration-150 ease-out hover:text-[#FF3830] active:scale-[0.94]"
    >
      {children}
    </Link>
  );
}

function NavButton({
  children,
  onClick,
  notice,
}: {
  children: ReactNode;
  onClick: () => void;
  notice?: string;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className="transition-all duration-150 ease-out hover:text-[#FF3830] active:scale-[0.94]"
      >
        {children}
      </button>

      {notice && (
        <div className="absolute left-1/2 top-[calc(100%+14px)] z-50 w-max -translate-x-1/2">
          <div className="relative rounded-xl bg-[#0B0B0B] px-3 py-2 text-[10px] font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
            <span
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#0B0B0B]"
              aria-hidden="true"
            />

            <span className="relative z-10">
              {notice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* MOBILE NAV                                       */
/* ------------------------------------------------ */

const mobileNavClass =
  "block border-b border-black/[0.08] py-3.5 text-sm font-bold text-[#0B0B0B] transition-all duration-150 hover:pl-2 hover:text-[#FF3830] active:scale-[0.98]";

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={mobileNavClass}
    >
      {children}
    </Link>
  );
}

function MobileNavButton({
  children,
  onClick,
  notice,
}: {
  children: ReactNode;
  onClick: () => void;
  notice?: string;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left ${mobileNavClass}`}
      >
        {children}
      </button>

      {notice && (
        <MobileInlineNotice>
          {notice}
        </MobileInlineNotice>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* NOTICES                                          */
/* ------------------------------------------------ */

function InlineNotice({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="px-3 pb-2">
      <div className="rounded-lg bg-[#0B0B0B] px-3 py-2 text-center text-[10px] font-medium text-white">
        {children}
      </div>
    </div>
  );
}

function MobileInlineNotice({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="pb-2 pt-1">
      <div className="rounded-lg bg-[#0B0B0B] px-3 py-2 text-[10px] font-medium text-white">
        {children}
      </div>
    </div>
  );
}