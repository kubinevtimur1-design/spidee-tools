"use client";

import { useEffect, useRef } from "react";
import { cancelToolUse, resetToolUse, scheduleToolUse } from "./metrika";

/**
 * Первый снимок страницы не считается действием.
 * Первый валидный результат после паузы — один tool_use за этот маунт.
 */
export function useToolUse(tool: string, signature: string) {
  const baseline = useRef<string | null>(null);
  const changed = useRef(false);

  if (baseline.current === null) {
    baseline.current = signature;
  }

  useEffect(() => {
    return () => resetToolUse(tool);
  }, [tool]);

  useEffect(() => {
    if (!changed.current) {
      if (signature === baseline.current) return;
      changed.current = true;
    }

    scheduleToolUse(tool, signature);
    return () => cancelToolUse(tool);
  }, [tool, signature]);
}
