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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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
            src="/spidy-logo.PNG"
            alt="Spidy Tools"
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 group-active:rotate-0"
          />

          <span className="text-[19px] font-black tracking-[-0.04em] text-[#0B0B0B] transition-colors duration-200 group-hover:text-[#FF3830]">
            Spidy Tools
          </span>
        </Link>

        {/* DESKTOP */}

        <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#0B0B0B] md:flex">
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
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="invisible absolute left-0 top-full z-50 -translate-y-2 pt-1 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="w-64 border-2 border-[#0B0B0B] bg-[#F7F5F2] p-1.5 shadow-[5px_5px_0_#0B0B0B]">
                {TOOLS.map((tool) => (
                  <ToolItem
                    key={tool.title}
                    tool={tool}
                    onComingSoon={() =>
                      showNotice("Выгрузка meta скоро появится")
                    }
                  />
                ))}

                {notice === "Выгрузка meta скоро появится" && (
                  <div className="mx-1 mb-1 mt-1 bg-[#0B0B0B] px-3 py-2 text-center text-[10px] font-bold text-white">
                    {notice}
                  </div>
                )}
              </div>
            </div>
          </div>

          <NavLink href="/pricing">Тарифы</NavLink>

          <NavButton
            onClick={() => showNotice("Контакты скоро появятся")}
          >
            Контакты
          </NavButton>

          <NavButton onClick={() => showNotice("Блог скоро появится")}>
            Блог
          </NavButton>
        </nav>

        {/* DESKTOP NOTICE */}

        {notice && notice !== "Выгрузка meta скоро появится" && (
          <div className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] hidden -translate-x-1/2 border-2 border-black bg-[#FF3830] px-3 py-2 text-[10px] font-black uppercase shadow-[4px_4px_0_#0B0B0B] md:block">
            {notice}
          </div>
        )}

        {/* MOBILE BUTTON */}

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center border-2 border-black transition-all duration-150 hover:bg-[#D7FF00] active:scale-90 md:hidden"
        >
          <div className="relative h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 bg-black transition-all duration-300 ${
                mobileOpen ? "top-[7px] rotate-45" : "top-0"
              }`}
            />

            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 bg-black transition-all duration-200 ${
                mobileOpen
                  ? "scale-x-0 opacity-0"
                  : "scale-x-100 opacity-100"
              }`}
            />

            <span
              className={`absolute left-0 h-0.5 w-5 bg-black transition-all duration-300 ${
                mobileOpen ? "top-[7px] -rotate-45" : "top-[14px]"
              }`}
            />
          </div>
        </button>
      </div>

      {/* ELASTIC STRING */}

      <ElasticString />

      {/* MOBILE MENU */}

      <div
        className={`overflow-hidden bg-[#F7F5F2] transition-all duration-300 ease-out md:hidden ${
          mobileOpen
            ? "max-h-[600px] border-t-2 border-black opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-5 pt-3">
          <button
            type="button"
            onClick={() =>
              setMobileToolsOpen((current) => !current)
            }
            className="flex w-full items-center justify-between border-b border-black/15 py-3 text-left text-sm font-black uppercase transition-transform duration-150 active:scale-[0.98]"
          >
            Инструменты

            <span
              className={`text-lg transition-transform duration-300 ${
                mobileToolsOpen ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              mobileToolsOpen
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-b border-black/15 py-2">
              {TOOLS.map((tool) => {
                if (tool.href) {
                  return (
                    <Link
                      key={tool.title}
                      href={tool.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-2 py-3 transition-all duration-150 hover:bg-[#D7FF00] active:scale-[0.98] active:bg-[#FF3830]"
                    >
                      <ToolIcon>{tool.icon}</ToolIcon>

                      <div>
                        <div className="text-sm font-bold">
                          {tool.title}
                        </div>

                        <div className="text-[10px] font-medium opacity-50">
                          {tool.description}
                        </div>
                      </div>
                    </Link>
                  );
                }

                return (
                  <button
                    key={tool.title}
                    type="button"
                    onClick={() =>
                      showNotice("Выгрузка meta скоро появится")
                    }
                    className="flex w-full items-center gap-3 px-2 py-3 text-left transition-all duration-150 hover:bg-[#D7FF00] active:scale-[0.98] active:bg-[#FF3830]"
                  >
                    <ToolIcon>{tool.icon}</ToolIcon>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">
                          {tool.title}
                        </span>

                        <span className="bg-[#D7FF00] px-1.5 py-0.5 text-[8px] font-black uppercase">
                          скоро
                        </span>
                      </div>

                      <div className="text-[10px] font-medium opacity-50">
                        {tool.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Link
            href="/pricing"
            onClick={closeMobileMenu}
            className="block border-b border-black/15 py-3 text-sm font-black uppercase transition-all duration-150 hover:pl-2 hover:text-[#FF3830] active:scale-[0.98]"
          >
            Тарифы
          </Link>

          <button
            type="button"
            onClick={() => showNotice("Контакты скоро появятся")}
            className="block w-full border-b border-black/15 py-3 text-left text-sm font-black uppercase transition-all duration-150 hover:pl-2 hover:text-[#FF3830] active:scale-[0.98]"
          >
            Контакты
          </button>

          <button
            type="button"
            onClick={() => showNotice("Блог скоро появится")}
            className="block w-full border-b border-black/15 py-3 text-left text-sm font-black uppercase transition-all duration-150 hover:pl-2 hover:text-[#FF3830] active:scale-[0.98]"
          >
            Блог
          </button>

          {notice && (
            <div className="mt-4 border-2 border-black bg-[#FF3830] px-3 py-2 text-center text-[10px] font-black uppercase">
              {notice}
            </div>
          )}
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

  const stateRef = useRef({
    x: 0.5,
    y: 0,
    velocity: 0,
    lastMouseY: 0,
    lastTime: 0,
    initialized: false,
    interacting: false,
  });

  const draw = useCallback(() => {
    const path = pathRef.current;
    if (!path) return;

    const state = stateRef.current;

    const width = 1000;
    const baseY = 20;

    const controlX = state.x * width;
    const controlY = baseY + state.y;

    path.setAttribute(
      "d",
      `M 0 ${baseY} Q ${controlX} ${controlY} 1000 ${baseY}`
    );
  }, []);

  const animate = useCallback(() => {
    const state = stateRef.current;

    if (!state.interacting) {
      const spring = 0.09;
      const damping = 0.91;

      state.velocity += -state.y * spring;
      state.velocity *= damping;
      state.y += state.velocity;

      if (
        Math.abs(state.y) < 0.03 &&
        Math.abs(state.velocity) < 0.03
      ) {
        state.y = 0;
        state.velocity = 0;
        draw();
        frameRef.current = null;
        return;
      }
    }

    draw();
    frameRef.current = requestAnimationFrame(animate);
  }, [draw]);

  const startAnimation = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const handleMouseMove = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const state = stateRef.current;

    const x = Math.max(
      0.03,
      Math.min(0.97, (event.clientX - rect.left) / rect.width)
    );

    const centerY = rect.top + rect.height / 2;
    const mouseY = event.clientY - centerY;

    const now = performance.now();

    if (!state.initialized) {
      state.lastMouseY = event.clientY;
      state.lastTime = now;
      state.initialized = true;
    }

    const dt = Math.max(8, now - state.lastTime);
    const mouseVelocity =
      ((event.clientY - state.lastMouseY) / dt) * 16.67;

    state.x = x;
    state.interacting = true;

    /*
     * The string follows the pointer while the cursor
     * is inside the interaction zone.
     */
    const pull = Math.max(-14, Math.min(14, mouseY));

    state.y += (pull - state.y) * 0.42;

    /*
     * Cursor speed adds energy to the string.
     */
    state.velocity += mouseVelocity * 0.18;

    state.lastMouseY = event.clientY;
    state.lastTime = now;

    startAnimation();
  };

  const releaseString = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    const state = stateRef.current;
    const now = performance.now();

    const dt = Math.max(8, now - state.lastTime);

    const cursorVelocity =
      ((event.clientY - state.lastMouseY) / dt) * 16.67;

    /*
     * Final impulse.
     * Fast crossing = stronger vibration.
     */
    const impulse = Math.max(
      -12,
      Math.min(12, cursorVelocity * 0.75)
    );

    state.velocity += impulse;

    /*
     * Give the string a minimum kick even when
     * the cursor crosses it slowly.
     */
    if (Math.abs(state.velocity) < 2.2) {
      state.velocity += state.y >= 0 ? -2.2 : 2.2;
    }

    state.interacting = false;
    state.initialized = false;

    startAnimation();
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

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
          stroke="rgba(11,11,11,0.18)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------ */
/* TOOL ITEM                                        */
/* ------------------------------------------------ */

function ToolItem({
  tool,
  onComingSoon,
}: {
  tool: Tool;
  onComingSoon: () => void;
}) {
  const content = (
    <>
      <ToolIcon>{tool.icon}</ToolIcon>

      <div className="min-w-0 flex-1 transition-transform duration-200 group-hover/tool:translate-x-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold">
            {tool.title}
          </span>

          {tool.comingSoon && (
            <span className="bg-[#D7FF00] px-1.5 py-0.5 text-[8px] font-black uppercase transition-colors duration-150 group-hover/tool:bg-[#FF3830]">
              скоро
            </span>
          )}
        </div>

        <div className="mt-0.5 text-[10px] font-medium opacity-50">
          {tool.description}
        </div>
      </div>
    </>
  );

  const className =
    "group/tool flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 ease-out hover:translate-x-1 hover:bg-[#D7FF00] active:scale-[0.98] active:bg-[#FF3830]";

  if (tool.href) {
    return (
      <Link href={tool.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onComingSoon}
      className={className}
    >
      {content}
    </button>
  );
}

function ToolIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0B0B0B] text-[11px] font-black text-white transition-transform duration-200 group-hover/tool:-rotate-3 group-hover/tool:scale-110">
      {children}
    </span>
  );
}

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
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-all duration-150 ease-out hover:text-[#FF3830] active:scale-[0.94]"
    >
      {children}
    </button>
  );
}