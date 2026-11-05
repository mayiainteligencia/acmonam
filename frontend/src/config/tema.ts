import type React from 'react';
import { brandingConfig } from './branding';

/** Fondo base del dashboard: Deep Navy ejecutivo */
export const FONDO_OSCURO = '#0A1325';

/** Fondo de página estilo tech ACAM: Deep Navy con halo azul cian y cuadrícula sutil */
export const FONDO_TECH: React.CSSProperties = {
  backgroundColor: '#0A1325',
  backgroundImage: 'radial-gradient(1100px 500px at 92% -6%, rgba(14,165,233,.14), transparent 65%), radial-gradient(800px 400px at 8% 25%, rgba(2,132,199,.10), transparent 60%), linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)',
  backgroundSize: 'auto, auto, 44px 44px, 44px 44px',
};

/** Secciones en tema Deep Navy */
export const SECCIONES_OSCURAS: string[] = ['precision', 'radio', 'tv', 'impresos'];

/** Paleta limpia para cromo (Header + Sidebar) */
export const coloresOscuros = {
  ...brandingConfig.colores,
  primario: '#0284C7',
  primarioVivo: '#38BDF8',
  fondoPrincipal: '#0A1325',
  fondoSecundario: '#101F38',
  fondoTerciario: '#162847',
  textoClaro: '#FFFFFF',
  textoMedio: '#CBD5E1',
  textoOscuro: '#94A3B8',
  borde: 'rgba(56, 189, 248, 0.16)',
  bordeHover: 'rgba(56, 189, 248, 0.40)',
};

