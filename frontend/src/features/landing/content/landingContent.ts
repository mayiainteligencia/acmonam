/** Textos y datos de la landing. Nada de copy vive en los componentes. */
import logoMayia from '../../../assets/logo/mayiaEscuchaTrim.png';

export const brand = {
  name: 'MAYIA Escucha',
  logo: logoMayia,
  logoAlt: 'MAYIA Escucha',
} as const;

export const navLinks = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'precios', label: 'Precios' },
] as const;

export const headerActions = {
  login: { label: 'Iniciar sesión' },
  register: { label: 'Crear cuenta' },
} as const;

export const hero = {
  titleLine: 'Monitoreo inteligente',
  titleAccent: 'de medios',
  subtitle: 'Tiempo real con IA en servidor propio generando evidencia.',
  closingLine: 'en Tiempo',
  closingAccent: 'Real.',
  lead:
    'MAYIA Escucha es un sistema de monitoreo de medios con inteligencia artificial. Está diseñado para escuchar radio en vivo, transcribirla en servidor propio y registrar cada mención de marcas, spots y frases con su testigo.',
  primaryCta: { label: 'Ver precios' },
  secondaryCta: { label: 'Iniciar sesión' },
} as const;

/** Texto que "se transcribe" en la onda del hero. `waveKeyword` se resalta. */
export const waveTranscript = {
  keyword: 'MAYIA ESCUCHA',
  text: '  ...MAYIA ESCUCHA detecta y transcribe transmisiones de radio en vivo en tiempo real con inteligencia artificial en servidor propio generando evidencia verificable sin costo por minuto...  ',
} as const;

export interface PricingPlan {
  id: string;
  name: string;
  /** Precio mensual en `pricing.currency`. `null` = se cotiza (sin precio público). */
  monthlyPrice: number | null;
  description: string;
  features: string[];
  buttonText: string;
  isPopular: boolean;
}

export const pricing = {
  id: 'precios',
  title: 'Precios simples y transparentes',
  description: 'Elige el plan que se ajusta a tu operación.\nTodos incluyen acceso a la plataforma y soporte dedicado.',
  currency: 'MXN',
  locale: 'es-MX',
  /** Descuento aplicado al pagar anualmente (0.2 = 20%). */
  annualDiscount: 0.2,
  billing: { monthly: 'Facturación mensual', annual: 'Facturación anual', save: 'Ahorra' },
  period: 'mes',
  billedMonthly: 'facturado mensualmente',
  billedAnnually: 'facturado anualmente',
  quote: 'A cotizar',
  popular: 'Popular',
  // TODO(precios): valores provisionales; reemplazar por los precios reales.
  plans: [
    {
      id: 'essential',
      name: 'Essential',
      monthlyPrice: 4900,
      description: 'Para equipos que empiezan a monitorear sus medios.',
      features: ['Monitoreo de radio en vivo', 'Transcripción en tiempo real', 'Testigos de audio por mención', 'Soporte por correo'],
      buttonText: 'Comenzar',
      isPopular: false,
    },
    {
      id: 'profesional',
      name: 'Profesional',
      monthlyPrice: 12900,
      description: 'Cobertura multimedia con reportes de precisión.',
      features: ['Todo lo de Essential', 'Televisión e impresos', 'Reportes de precisión', 'Ranking de anunciantes', 'Soporte prioritario'],
      buttonText: 'Elegir Profesional',
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: null,
      description: 'Solución a la medida con inteligencia electoral y SLA.',
      features: ['Todo lo de Profesional', 'Inteligencia electoral', 'Integraciones a la medida', 'SLA y gerente de cuenta'],
      buttonText: 'Contactar ventas',
      isPopular: false,
    },
  ] satisfies PricingPlan[],
} as const;
