"use client";

import { useCallback, useEffect, useState } from "react";

export function useTimer(autoStart = true) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(autoStart);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(0);
    setRunning(autoStart);
  }, [autoStart]);

  return { seconds, running, start, stop, reset };
}