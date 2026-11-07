import { useCallback, useRef } from 'react';

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Controla el zoom del hero (0 = normal, 1 = zoom completo + polvo) de forma imperativa.
 * El zoom ya no depende del scroll: solo se anima al llamar `animateTo`.
 */
export function useHeroZoom() {
  const zoomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const frameRef = useRef(0);
  const busyRef = useRef(false);

  const apply = useCallback((progress: number) => {
    progressRef.current = progress;
    const content = contentRef.current;
    const zoom = zoomRef.current;
    if (content) {
      const t = clamp01(progress / 0.3);
      content.style.opacity = String(1 - t);
      content.style.transform = `translate3d(0, ${-40 * t}px, 0) scale(${1 - 0.04 * t})`;
      content.style.pointerEvents = t > 0.6 ? 'none' : '';
    }
    if (zoom) {
      zoom.style.transform = `scale(${1 + 2 * easeInOut(progress)})`;
      zoom.style.opacity = String(1 - clamp01((progress - 0.75) / 0.25));
    }
  }, []);

  /** Anima el progreso hasta `to`. Devuelve false (sin hacer nada) si ya hay una animación en curso. */
  const animateTo = useCallback(
    (to: number, durationMs: number) =>
      new Promise<boolean>((resolve) => {
        if (busyRef.current) return resolve(false);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const from = progressRef.current;
        const start = performance.now();
        busyRef.current = true;

        const step = (now: number) => {
          const t = reduced ? 1 : clamp01((now - start) / durationMs);
          apply(from + (to - from) * t);
          if (t < 1) {
            frameRef.current = requestAnimationFrame(step);
          } else {
            busyRef.current = false;
            resolve(true);
          }
        };
        frameRef.current = requestAnimationFrame(step);
      }),
    [apply],
  );

  return { zoomRef, contentRef, progressRef, animateTo };
}

