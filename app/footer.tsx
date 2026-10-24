import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-40 mt-auto">
      <div className="absolute inset-0 border-t border-white/90 bg-white/65 shadow-[0_-1px_18px_rgba(0,0,0,0.025)] backdrop-blur-[28px] backdrop-saturate-150" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/90" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-gray-900"
        >
          <span className="text-sm leading-none">🕷️</span>
          <span>Spidy Tools</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link
            href="/counter"
            className="transition-colors hover:text-gray-900"
          >
            Инструменты
          </Link>

          <Link
            href="/pricing"
            className="transition-colors hover:text-gray-900"
          >
            Тарифы
          </Link>

          <span className="text-gray-400">
            © 2026 Spidy Tools
          </span>
        </nav>
      </div>
    </footer>
  );
}