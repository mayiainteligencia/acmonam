import { useEffect, useRef, useState } from 'react';

/** Anima un número hasta `target` (equivalente al NumberFlow de la referencia, sin dependencias). */
export function useAnimatedNumber(target: number, durationMs = 500): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = valueRef.current;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      valueRef.current = from + (target - from) * eased;
      setValue(valueRef.current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

