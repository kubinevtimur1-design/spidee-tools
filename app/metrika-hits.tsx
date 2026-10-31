"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageHit, track } from "@/lib/metrika";

function MetrikaListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const url = window.location.href;
    const previous = previousUrl.current;
    previousUrl.current = url;

    // init уже отправил хит первой загрузки. Повтор при том же адресе
    // (в том числе повторный запуск эффекта) тоже не шлём.
    if (previous === null || previous === url) return;

    pageHit(url, previous);
  }, [pathname, query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("[data-goal='partner_click']")) {
        track("partner_click");
      }

      if (target.closest("a[href*='t.me']")) {
        track("tg_click");
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

export default function MetrikaHits() {
  return (
    <Suspense fallback={null}>
      <MetrikaListener />
    </Suspense>
  );
}
