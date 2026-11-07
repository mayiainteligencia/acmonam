import type { RefObject } from 'react';
import { hero } from '../content/landingContent';
import { HeroWave } from './HeroWave';

interface HeroProps {
  zoomRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<number>;
  onPricing: () => void;
  onLogin: () => void;
}

/** Hero a pantalla completa. El zoom/polvo lo dispara el padre al pulsar los botones. */
export function Hero({ zoomRef, contentRef, progressRef, onPricing, onLogin }: HeroProps) {
  return (
    <section id="inicio" className="hero-track" aria-labelledby="hero-title">
      <div className="hero-sticky">
        <div className="hero-atmosphere" aria-hidden="true" />

        <div ref={zoomRef} className="hero-zoom" aria-hidden="true">
          <HeroWave progressRef={progressRef} />
        </div>

        <div ref={contentRef} className="hero-content">
          <div className="hero-top">
            <div className="hero-bar" />
            <h1 id="hero-title" className="hero-in hero-title" style={{ ['--d' as string]: '.08s' }}>
              {hero.titleLine} <br />
              <span className="accent">{hero.titleAccent}</span>
            </h1>
            <p className="hero-in hero-subtitle" style={{ ['--d' as string]: '.16s' }}>{hero.subtitle}</p>
            <div className="hero-in hero-actions" style={{ ['--d' as string]: '.24s' }}>
              <button type="button" className="btn btn--solid" onClick={onPricing}>{hero.primaryCta.label}</button>
              <button type="button" className="btn btn--ghost" onClick={onLogin}>{hero.secondaryCta.label}</button>
            </div>
          </div>

          <div className="hero-bottom">
            <div className="hero-closing">
              <h2 className="hero-in" style={{ ['--d' as string]: '.14s' }}>
                {hero.closingLine} <br />
                <span className="accent">{hero.closingAccent}</span>
              </h2>
              <p className="hero-in" style={{ ['--d' as string]: '.22s' }}>{hero.lead}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
