import { publicPalette } from '../../../shared/theme/publicPalette';

const COLORS = [publicPalette.accent, publicPalette.accentBright, publicPalette.accentDeep];
const PIECES = 50;

/** Ráfaga de confeti desde el centro de `origin`, con colores de la marca (sin dependencias). */
export function burstConfetti(origin: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < PIECES; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${cx}px`;
    piece.style.top = `${cy}px`;
    piece.style.background = COLORS[i % COLORS.length] ?? publicPalette.accent;
    document.body.appendChild(piece);

    const angle = (Math.random() - 0.5) * (Math.PI * 0.67) - Math.PI / 2;
    const speed = 60 + Math.random() * 110;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    const animation = piece.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.3}px, ${dy + 160}px) scale(0.4)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    animation.onfinish = () => piece.remove();
  }
}

