import { useCallback, useRef, useState } from 'react';
import { navigate } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import '../../../shared/styles/publicTheme.css';
import './landing.css';
import { Hero } from './Hero';
import { LandingHeader, type NavId } from './LandingHeader';
import { PricingSection } from './PricingSection';
import { useHeroZoom } from './useHeroZoom';

const ZOOM_IN_MS = 1100;
const ZOOM_OUT_MS = 800;
const instant = 'instant' as ScrollBehavior;

/**
 * Pantalla pública de entrada. El scroll está bloqueado sobre el hero: el zoom solo ocurre
 * al pulsar un botón (Precios → baja a precios, Iniciar sesión → va al login).
 */
export function LandingPage() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pricingAnchorRef = useRef<HTMLDivElement>(null);
  const { zoomRef, contentRef, progressRef, animateTo } = useHeroZoom();
  const [unlocked, setUnlocked] = useState(false);

  const goToPricing = useCallback(async () => {
    const target = pricingAnchorRef.current;
    if (progressRef.current >= 1) {
      target?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!(await animateTo(1, ZOOM_IN_MS))) return;
    setUnlocked(true);
    target?.scrollIntoView({ behavior: instant });
  }, [animateTo, progressRef]);

  const goToRoute = useCallback(
    async (path: string) => {
      if (progressRef.current < 1 && !(await animateTo(1, ZOOM_IN_MS))) return;
      navigate(path);
    },
    [animateTo, progressRef],
  );
  const goToLogin = useCallback(() => goToRoute(ROUTES.login), [goToRoute]);
  const goToRegister = useCallback(() => goToRoute(ROUTES.register), [goToRoute]);

  const goHome = useCallback(async () => {
    if (progressRef.current === 0) return;
    scrollerRef.current?.scrollTo({ top: 0, behavior: instant });
    setUnlocked(false);
    await animateTo(0, ZOOM_OUT_MS);
  }, [animateTo, progressRef]);

  const handleNavigate = (id: NavId) => (id === 'precios' ? goToPricing() : goHome());

  /** Si el usuario sube hasta el tope desde precios, el hero vuelve a su estado inicial. */
  const handleScroll = () => {
    if (unlocked && (scrollerRef.current?.scrollTop ?? 1) < 4) void goHome();
  };

  return (
    <div
      ref={scrollerRef}
      className={`public-theme landing${unlocked ? '' : ' landing--locked'}`}
      onScroll={handleScroll}
    >
      <LandingHeader onNavigate={handleNavigate} onLogin={goToLogin} onRegister={goToRegister} />
      <main>
        <Hero
          zoomRef={zoomRef}
          contentRef={contentRef}
          progressRef={progressRef}
          onPricing={goToPricing}
          onLogin={goToLogin}
        />
        <div ref={pricingAnchorRef}>
          <PricingSection onSelectPlan={goToRegister} />
        </div>
      </main>
    </div>
  );
}
