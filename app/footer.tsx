import Image from "next/image";
import Link from "next/link";

const PAPER = "#F7F5F2";
const DEEP_BLACK = "#3A3A3A";

const FOOTER_LINKS = [
  {
    href: "/counter/",
    label: "Подсчёт символов",
  },
  {
    href: "/slug/",
    label: "Транслит и ЧПУ",
  },
  {
    href: "/utm-generator/",
    label: "Генератор UTM",
  },
  {
    href: "/qr/",
    label: "QR-код",
  },
  {
    href: "/faq-schema-generator/",
    label: "FAQ Schema",
  },
  {
    href: "/about/",
    label: "О нас",
  },
  {
    href: "/contacts/",
    label: "Контакты",
  },
];

export default function Footer() {
  return (
    <footer
      className="relative z-40 mt-auto border-t border-[#D1D1D1]"
      style={{
        background: PAPER,
        color: DEEP_BLACK,
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="group flex w-fit items-center gap-3"
          >
            <Image
              src="/spidy-logo.PNG"
              alt="Spidy Tools"
              width={34}
              height={34}
              className="h-[34px] w-[34px] object-contain transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110"
            />

            <span className="text-lg font-black tracking-[-0.04em]">
              Spidy Tools
            </span>
          </Link>

          <nav
            className="flex flex-wrap items-center gap-x-7 gap-y-3"
            aria-label="Навигация в подвале"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group/link relative text-sm font-normal tracking-[-0.02em]"
              >
                <span
                  className="pointer-events-none absolute -left-[0.1em] -right-[0.12em] top-[56%] z-0 h-[0.72em] origin-left -translate-y-1/2 -rotate-2 scale-x-75 bg-[#D7FF00]/90 opacity-0 transition-all duration-200 ease-out group-hover/link:scale-x-100 group-hover/link:opacity-100"
                  style={{
                    clipPath:
                      "polygon(1% 13%, 8% 6%, 19% 10%, 31% 4%, 45% 8%, 57% 3%, 70% 7%, 83% 2%, 96% 8%, 100% 20%, 98% 83%, 91% 91%, 79% 87%, 66% 94%, 52% 88%, 39% 95%, 25% 89%, 13% 94%, 2% 85%)",
                  }}
                />

                <span className="relative z-10">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-7 border-t border-[#D1D1D1] pt-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A8A8A]">
            © 2026 Spidy Tools
          </span>
        </div>
      </div>
    </footer>
  );
}