import { useEffect, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveals the ids of a trace one by one so the user can follow the algorithm.
 * Returns how many ids are currently revealed.
 */
export function useStepper(trace, interval = 520) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!trace || trace.ids.length === 0) {
      setStep(0);
      return undefined;
    }
    const total = trace.ids.length;
    if (reducedMotion()) {
      setStep(total);
      return undefined;
    }
    let current = 1;
    setStep(1);
    if (total === 1) return undefined;
    const timer = setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= total) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [trace, interval]);

  return step;
}
