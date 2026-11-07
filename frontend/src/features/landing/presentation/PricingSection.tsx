import { useRef, useState } from 'react';
import { Check, Star } from 'lucide-react';
import { pricing, type PricingPlan } from '../content/landingContent';
import { burstConfetti } from './burstConfetti';
import { useAnimatedNumber } from './useAnimatedNumber';

interface PricingSectionProps {
  onSelectPlan: () => void;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat(pricing.locale, {
    style: 'currency',
    currency: pricing.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/** Precio mensual equivalente según la facturación elegida. */
const priceFor = (monthly: number, annual: boolean) => (annual ? monthly * (1 - pricing.annualDiscount) : monthly);

function Price({ monthly, annual }: { monthly: number; annual: boolean }) {
  const value = useAnimatedNumber(priceFor(monthly, annual));
  return <span className="plan__amount">{formatMoney(Math.round(value))}</span>;
}

function positionClass(index: number, total: number, plan: PricingPlan) {
  if (plan.isPopular) return ' plan--popular';
  if (index === 0) return ' plan--side-left';
  if (index === total - 1) return ' plan--side-right';
  return '';
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);
  const switchRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    const next = !annual;
    setAnnual(next);
    if (next && switchRef.current) burstConfetti(switchRef.current);
  };

  const savePercent = Math.round(pricing.annualDiscount * 100);

  return (
    <section id={pricing.id} className="pricing" aria-labelledby="pricing-title">
      <div className="container-x">
        <header className="pricing__intro">
          <h2 id="pricing-title">{pricing.title}</h2>
          <p className="pricing__lead">{pricing.description}</p>
        </header>

        <div className="billing-toggle">
          <span className={annual ? '' : 'is-active'}>{pricing.billing.monthly}</span>
          <button
            ref={switchRef}
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label={pricing.billing.annual}
            className="switch"
            onClick={toggle}
          />
          <span className={annual ? 'is-active' : ''}>
            {pricing.billing.annual} <span className="billing-toggle__save">({pricing.billing.save} {savePercent}%)</span>
          </span>
        </div>

        <div className="pricing__grid">
          {pricing.plans.map((plan, index) => (
            <article key={plan.id} className={`plan${positionClass(index, pricing.plans.length, plan)}`}>
              {plan.isPopular && (
                <div className="plan__badge">
                  <Star size={14} aria-hidden="true" />
                  {pricing.popular}
                </div>
              )}

              <p className="plan__name">{plan.name}</p>

              <div className="plan__price">
                {plan.monthlyPrice === null ? (
                  <span className="plan__amount plan__amount--quote">{pricing.quote}</span>
                ) : (
                  <>
                    <Price monthly={plan.monthlyPrice} annual={annual} />
                    <span className="plan__period">/ {pricing.period}</span>
                  </>
                )}
              </div>
              {plan.monthlyPrice !== null && (
                <p className="plan__billed">{annual ? pricing.billedAnnually : pricing.billedMonthly}</p>
              )}

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><Check size={16} aria-hidden="true" /><span>{feature}</span></li>
                ))}
              </ul>

              <hr />

              <button type="button" className="btn plan__cta" onClick={onSelectPlan}>{plan.buttonText}</button>
              <p className="plan__desc">{plan.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
