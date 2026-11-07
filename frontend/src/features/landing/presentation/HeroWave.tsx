import { useEffect, useRef, type RefObject } from 'react';
import { publicPalette as palette } from '../../../shared/theme/publicPalette';
import { waveTranscript } from '../content/landingContent';

const { text: TEXT, keyword: KEY } = waveTranscript;
const KEY_START = TEXT.indexOf(KEY);
const COL = 13; // px por columna
const SPEED = 34; // px por segundo

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface HeroWaveProps {
  /** Progreso del scroll (0–1) escrito por el padre; controla la desintegración en polvo. */
  progressRef: RefObject<number>;
}

const rgba = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`;
const amplitude = (i: number, t: number) => {
  const s1 = Math.sin(i * 0.24 + t * 0.0022);
  const s2 = Math.sin(i * 0.09 - t * 0.0016);
  return (0.16 + 0.84 * Math.abs(s1 * s2)) * 0.85;
};

/** Onda de audio + transcripción continua con partículas y efecto de polvo al hacer scroll. */
export function HeroWave({ progressRef }: HeroWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = window.innerWidth < 768 ? 40 : 75;
    const particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let offset = KEY_START * COL - 280;
    let visible = true;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * (w || 1200),
          y: Math.random() * (h || 600),
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 2 + 0.6,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) initParticles();
    };

    const drawGlow = (cx: number, mid: number) => {
      const glow = ctx.createRadialGradient(cx, mid, 15, cx, mid, Math.min(w, h) * 0.85);
      glow.addColorStop(0, rgba(palette.accentRgb, 0.22));
      glow.addColorStop(0.35, rgba(palette.accentDeepRgb, 0.12));
      glow.addColorStop(0.7, 'rgba(14, 22, 6, 0.04)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    };

    const drawParticles = () => {
      ctx.beginPath();
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fillStyle = rgba(palette.accentRgb, 0.38);
      ctx.fill();
    };

    const drawGuide = (mid: number) => {
      ctx.strokeStyle = rgba(palette.accentRgb, 0.08);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 8]);
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawColumns = (now: number, mid: number, cursor: number, snap: number) => {
      const first = Math.floor((offset - w) / COL) - 2;
      const lastCol = Math.ceil(offset / COL) + 2;

      for (let c = first; c <= lastCol; c++) {
        const x = w + c * COL - offset;
        const charIdx = ((c % TEXT.length) + TEXT.length) % TEXT.length;
        const inKey = charIdx >= KEY_START && charIdx < KEY_START + KEY.length;
        const seed = Math.abs(Math.sin(c * 12.9898 + 78.233));
        const threshold = seed * 0.65;
        const dissolve = snap > threshold ? Math.min(1, (snap - threshold) / (1 - threshold + 0.001)) : 0;

        if (dissolve > 0.02) {
          const baseHeight = amplitude(c, now) * (h * 0.36);
          const dustAlpha = Math.max(0, (1 - dissolve) * 0.75);
          ctx.globalAlpha = 1;
          ctx.fillStyle = inKey ? rgba(palette.accentRgb, dustAlpha) : rgba('237, 251, 193', dustAlpha);
          ctx.beginPath();
          for (let p = 0; p < 6; p++) {
            const pSeed = (p * 0.33 + seed) % 1;
            const angle = pSeed * Math.PI * 2;
            const speed = (0.5 + pSeed * 1.5) * (1 + dissolve * 2);
            const dustX = x + Math.cos(angle) * dissolve * 60 * speed + dissolve * 30;
            const dustY =
              mid + (pSeed - 0.5) * (x > cursor ? baseHeight * 1.5 : 20) + Math.sin(angle) * dissolve * 40 * speed - dissolve * 35;
            const size = Math.max(0.5, (1 - dissolve * 0.7) * 1.6);
            ctx.moveTo(dustX + size, dustY);
            ctx.arc(dustX, dustY, size, 0, Math.PI * 2);
          }
          ctx.fill();
          continue;
        }

        const intact = 1 - snap * 0.25;
        if (x > cursor) {
          const barHeight = amplitude(c, now) * (h * 0.36);
          ctx.globalAlpha = Math.min(1, Math.max(0.15, 1 - (x - cursor) / (w * 0.52))) * intact;
          ctx.fillStyle = rgba(palette.accentRgb, 0.85);
          ctx.fillRect(x - 1.5, mid - barHeight, 3, barHeight * 2);
          ctx.fillStyle = palette.accentBright;
          ctx.fillRect(x - 1, mid - barHeight - 2, 2, 2);
        } else {
          ctx.globalAlpha = Math.min(1, Math.max(0.12, 1 - (cursor - x) / (cursor * 0.96))) * intact;
          ctx.fillStyle = inKey ? palette.accent : rgba(palette.textRgb, 1);
          ctx.font = '600 13px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'center';
          const ch = TEXT[charIdx] ?? ' ';
          if (ch !== ' ') ctx.fillText(ch, x, mid + 5);
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawBeam = (mid: number, cursor: number, snap: number) => {
      const alpha = Math.max(0, 1 - snap * 1.5);
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      const beam = ctx.createLinearGradient(0, 0, 0, h);
      beam.addColorStop(0, rgba(palette.accentRgb, 0));
      beam.addColorStop(0.2, rgba(palette.accentRgb, 0.3));
      beam.addColorStop(0.5, rgba(palette.accentRgb, 0.95));
      beam.addColorStop(0.8, rgba(palette.accentRgb, 0.3));
      beam.addColorStop(1, rgba(palette.accentRgb, 0));
      ctx.fillStyle = beam;
      ctx.fillRect(cursor - 1, 0, 2, h);

      const halo = ctx.createRadialGradient(cursor, mid, 1, cursor, mid, 30);
      halo.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      halo.addColorStop(0.35, rgba(palette.accentRgb, 0.5));
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cursor, mid, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const draw = (now: number) => {
      const progress = progressRef.current ?? 0;
      if (progress >= 0.98) return; // ya terminó el zoom: no gastar CPU
      ctx.clearRect(0, 0, w, h);
      const mid = h * 0.52;
      const cursor = w * 0.5;
      const snap = Math.min(1, Math.max(0, (progress - 0.12) / 0.78));

      drawGlow(cursor, mid);
      drawParticles();
      drawGuide(mid);
      drawColumns(now, mid, cursor, snap);
      drawBeam(mid, cursor, snap);
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      offset += ((t - last) / 1000) * SPEED;
      last = t;
      draw(t);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      last = performance.now();
    });
    intersection.observe(canvas);

    if (reduced) {
      offset = w * 0.5 + (KEY_START + KEY.length) * COL;
      draw(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
    };
  }, [progressRef]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-wave"
      role="img"
      aria-label="Visualizador acústico y transcripción en tiempo real con inteligencia artificial"
    />
  );
}

