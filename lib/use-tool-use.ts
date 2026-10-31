"use client";

import { useEffect, useRef } from "react";
import { cancelToolUse, scheduleToolUse } from "./metrika";

/**
 * Первый снимок страницы не считается действием.
 * Дальше — один tool_use на изменившийся результат, после паузы ввода.
 */
export function useToolUse(tool: string, signature: string) {
  const baseline = useRef<string | null>(null);
  const changed = useRef(false);

  if (baseline.current === null) {
    baseline.current = signature;
  }

  useEffect(() => {
    if (!changed.current) {
      if (signature === baseline.current) return;
      changed.current = true;
    }

    scheduleToolUse(tool, signature);
    return () => cancelToolUse(tool);
  }, [tool, signature]);
}
