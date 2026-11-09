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
  tag?: string;
}

export const pricing = {
  id: 'precios',
  title: 'Tabla de Precios',
  description: 'Elige el plan que se ajusta a tu operación de monitoreo y auditoría.\nTodos los planes incluyen telemetría en tiempo real y soporte dedicado.',
  currency: 'MXN',
  locale: 'es-MX',
  /** Descuento aplicado al pagar anualmente (0.2 = 20%). */
  annualDiscount: 0.2,
  billing: { monthly: 'Facturación mensual', annual: 'Facturación anual', save: 'Ahorra' },
  period: 'mes',
  billedMonthly: 'MNX al mes + IVA',
  billedAnnually: 'MNX al mes facturado anual + IVA',
  quote: 'Precio Personalizado',
  popular: 'Popular',
  plans: [
    {
      id: 'basico',
      name: 'Básico',
      monthlyPrice: 6900,
      description: 'Monitoreo esencial en tiempo real para marcas y supervisión focalizada.',
      features: [
        'Monitoreo de 50 temas o búsqueda',
        'Monitoreo en vivo',
        '20 estaciones de radio',
        'Alertas y testigo de cada búsqueda',
        'Histórico de 2 meses',
        'Dashboard básico',
      ],
      buttonText: 'Elegir Básico',
      isPopular: false,
    },
    {
      id: 'profesional',
      name: 'Profesional',
      monthlyPrice: 19900,
      description: 'Mayor capacidad y alcance para agencias, marcas y campañas activas.',
      features: [
        'Monitoreo de 150 temas o búsqueda',
        'Monitoreo en vivo',
        '50 estaciones de radio',
        'Alertas y testigo de cada búsqueda',
        'Histórico de 2 meses',
        'Dashboard avanzado con telemetría',
      ],
      buttonText: 'Elegir Profesional',
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: null,
      description: 'Cobertura nacional total en radio, televisión y medios impresos con APIs dedicadas.',
      features: [
        'Monitoreo de 147 estaciones de radio',
        'TV: 100 canales en tiempo real',
        'Impresos: 70 publicaciones y diarios',
        'Monitoreo en vivo',
        'Comparación de pauta y Share of Voice',
        'Alertas y resumen en tiempo real',
        'APIs y dashboard personal',
      ],
      buttonText: 'Contactar ventas',
      isPopular: false,
      tag: 'NEW',
    },
  ] satisfies PricingPlan[],
} as const;
