export const METRIKA_ID = 113957937;

export const METRIKA_SRC = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;

export const METRIKA_WATCH_SRC = `https://mc.yandex.ru/watch/${METRIKA_ID}`;

/** Один раз на значимое изменение входа, не на каждый символ. */
export const TOOL_USE_DEBOUNCE_MS = 1800;

export const METRIKA_GOALS = [
  "tool_use",
  "copy_result",
  "export_file",
  "share_link",
  "partner_click",
  "tg_click",
] as const;

export type MetrikaGoal = (typeof METRIKA_GOALS)[number];

export type MetrikaParams = Record<string, string | number | boolean>;

type YmFn = (counterId: number, method: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    ym?: YmFn;
  }
}

/**
 * Официальный код счётчика: очередь ym, tag.js и init.
 * referrer/url — из того же сниппета, чтобы первый хит ушёл с адресом страницы.
 */
export const METRIKA_INLINE = `(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','${METRIKA_SRC}', 'ym');

ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;

export function track(goal: MetrikaGoal, params?: MetrikaParams) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.ym !== "function") return;

    if (params === undefined) {
      window.ym(METRIKA_ID, "reachGoal", goal);
      return;
    }

    window.ym(METRIKA_ID, "reachGoal", goal, params);
  } catch {
    // Счётчик заблокирован или ym недоступен.
  }
}

export function pageHit(url: string, referer: string) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.ym !== "function") return;
    window.ym(METRIKA_ID, "hit", url, { referer });
  } catch {
    // Счётчик заблокирован или ym недоступен.
  }
}

const toolUseTimers = new Map<string, ReturnType<typeof setTimeout>>();
const toolUseSent = new Map<string, string>();

export function cancelToolUse(tool: string) {
  const timer = toolUseTimers.get(tool);
  if (timer === undefined) return;
  clearTimeout(timer);
  toolUseTimers.delete(tool);
}

/** Пустая строка отменяет ожидающий хит и ничего не шлёт. */
export function scheduleToolUse(tool: string, signature: string) {
  if (typeof window === "undefined") return;

  cancelToolUse(tool);

  const next = signature.trim();
  if (!next) return;

  const timer = setTimeout(() => {
    toolUseTimers.delete(tool);
    if (toolUseSent.get(tool) === next) return;
    toolUseSent.set(tool, next);
    track("tool_use", { tool });
  }, TOOL_USE_DEBOUNCE_MS);

  toolUseTimers.set(tool, timer);
}

/** Атрибут для будущей партнёрской ссылки. Клик ловит общий обработчик. */
export function partnerGoalProps(): { "data-goal": "partner_click" } {
  return { "data-goal": "partner_click" };
}

/** Явный onClick, если атрибут data-goal повесить нельзя. Не совмещать с ним. */
export function onPartnerClick(params?: MetrikaParams) {
  return () => {
    track("partner_click", params);
  };
}
