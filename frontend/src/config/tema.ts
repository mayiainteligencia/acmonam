import type React from 'react';
import { brandingConfig } from './branding';

/** Fondo base del dashboard: Deep Navy ejecutivo */
export const FONDO_OSCURO = '#030704';

/** Fondo de página estilo tech MAYIA: Transparente para heredar el canvas estético orgánico */
export const FONDO_TECH: React.CSSProperties = {
  backgroundColor: 'transparent',
  backgroundImage: 'radial-gradient(1100px 500px at 92% -6%, rgba(219, 242, 133,.08), transparent 65%), radial-gradient(800px 400px at 8% 25%, rgba(114, 144, 19,.08), transparent 60%)',
};

/** Secciones en tema Deep Navy */
export const SECCIONES_OSCURAS: string[] = ['precision', 'radio', 'tv', 'impresos'];

/** Paleta limpia para cromo (Header + Sidebar) */
export const coloresOscuros = {
  ...brandingConfig.colores,
  primario: '#729013',
  primarioVivo: '#DBF285',
  fondoPrincipal: '#030704',
  fondoSecundario: '#0A170E',
  fondoTerciario: '#112417',
  textoClaro: '#FFFFFF',
  textoMedio: '#D1D5DB',
  textoOscuro: '#9CA3AF',
  borde: 'rgba(219, 242, 133, 0.16)',
  bordeHover: 'rgba(219, 242, 133, 0.40)',
};

