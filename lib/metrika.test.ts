import assert from "node:assert/strict";
import { mock, test } from "node:test";
import {
  METRIKA_GOALS,
  METRIKA_ID,
  METRIKA_INLINE,
  TOOL_USE_DEBOUNCE_MS,
  onPartnerClick,
  pageHit,
  partnerGoalProps,
  scheduleToolUse,
  track,
  type MetrikaGoal,
} from "./metrika";

test("goal union lists the six counter goals", () => {
  assert.deepEqual(METRIKA_GOALS, [
    "tool_use",
    "copy_result",
    "export_file",
    "share_link",
    "partner_click",
    "tg_click",
  ]);
});

test("inline counter keeps the official init flags", () => {
  assert.match(METRIKA_INLINE, new RegExp(String(METRIKA_ID)));
  assert.match(METRIKA_INLINE, /mc\.yandex\.ru\/metrika\/tag\.js\?id=113957937/);
  assert.match(METRIKA_INLINE, /ssr:true/);
  assert.match(METRIKA_INLINE, /webvisor:true/);
  assert.match(METRIKA_INLINE, /clickmap:true/);
  assert.match(METRIKA_INLINE, /ecommerce:"dataLayer"/);
  assert.match(METRIKA_INLINE, /accurateTrackBounce:true/);
  assert.match(METRIKA_INLINE, /trackLinks:true/);
  assert.match(METRIKA_INLINE, /referrer: document\.referrer/);
  assert.match(METRIKA_INLINE, /url: location\.href/);
});

test("track and pageHit do nothing without window or ym", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  delete (globalThis as { window?: unknown }).window;

  assert.equal(typeof window, "undefined");
  assert.doesNotThrow(() => {
    track("tool_use", { tool: "slug" });
    pageHit("https://spidytools.ru/qr/", "https://spidytools.ru/");
    scheduleToolUse("ssr", "value");
  });

  (globalThis as { window?: Window }).window = {} as Window;
  assert.doesNotThrow(() => {
    track("copy_result");
    pageHit("https://spidytools.ru/erid/", "https://spidytools.ru/");
  });

  window.ym = () => {
    throw new Error("blocked");
  };
  assert.doesNotThrow(() => {
    track("export_file");
    pageHit("https://spidytools.ru/slug/", "https://spidytools.ru/");
  });

  if (previous) {
    Object.defineProperty(globalThis, "window", previous);
  } else {
    delete (globalThis as { window?: unknown }).window;
  }
});

test("track reaches a goal once and skips a missing ym", () => {
  const calls: unknown[][] = [];
  (globalThis as { window?: Window }).window = {
    ym: (...args: unknown[]) => {
      calls.push(args);
    },
  } as Window;

  for (const goal of METRIKA_GOALS) {
    track(goal as MetrikaGoal);
  }

  assert.equal(calls.length, METRIKA_GOALS.length);
  assert.deepEqual(calls[0], [METRIKA_ID, "reachGoal", "tool_use"]);

  track("tool_use", { tool: "qr" });
  assert.deepEqual(calls.at(-1), [
    METRIKA_ID,
    "reachGoal",
    "tool_use",
    { tool: "qr" },
  ]);

  pageHit("https://spidytools.ru/qr/", "https://spidytools.ru/");
  assert.deepEqual(calls.at(-1), [
    METRIKA_ID,
    "hit",
    "https://spidytools.ru/qr/",
    { referer: "https://spidytools.ru/" },
  ]);

  delete window.ym;
  const before = calls.length;
  track("copy_result");
  assert.equal(calls.length, before);

  delete (globalThis as { window?: unknown }).window;
});

test("scheduleToolUse fires once per settled signature", () => {
  const calls: unknown[][] = [];
  (globalThis as { window?: Window }).window = {
    ym: (...args: unknown[]) => {
      calls.push(args);
    },
  } as Window;

  mock.timers.enable({ apis: ["setTimeout"] });

  try {
    scheduleToolUse("slug", "privet");
    scheduleToolUse("slug", "privet-mir");
    mock.timers.tick(TOOL_USE_DEBOUNCE_MS - 1);
    assert.equal(calls.length, 0);

    mock.timers.tick(1);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], [
      METRIKA_ID,
      "reachGoal",
      "tool_use",
      { tool: "slug" },
    ]);

    scheduleToolUse("slug", "privet-mir");
    mock.timers.tick(TOOL_USE_DEBOUNCE_MS);
    assert.equal(calls.length, 1);

    scheduleToolUse("slug", "drugoj-slug");
    mock.timers.tick(TOOL_USE_DEBOUNCE_MS);
    assert.equal(calls.length, 2);

    scheduleToolUse("counter", "текст");
    scheduleToolUse("counter", "   ");
    mock.timers.tick(TOOL_USE_DEBOUNCE_MS);
    assert.equal(calls.length, 2);
  } finally {
    mock.timers.reset();
    delete (globalThis as { window?: unknown }).window;
  }
});

test("partner helpers point at partner_click", () => {
  const calls: unknown[][] = [];
  (globalThis as { window?: Window }).window = {
    ym: (...args: unknown[]) => {
      calls.push(args);
    },
  } as Window;

  assert.deepEqual(partnerGoalProps(), { "data-goal": "partner_click" });
  onPartnerClick()();
  assert.deepEqual(calls, [[METRIKA_ID, "reachGoal", "partner_click"]]);

  delete (globalThis as { window?: unknown }).window;
});
