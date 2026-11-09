import { Gauge, Radio, Tv, Newspaper, GraduationCap, Headphones, Sparkles, type LucideIcon } from 'lucide-react';
import { brandingConfig } from './branding';

export type EstadoSeccion = 'activo' | 'demo' | 'en-activacion';

export interface ItemMenu {
  id: string;
  nombre: string;
  icono: LucideIcon;
  estado: EstadoSeccion;
  grupo: 'principal' | 'extra';
  /** Una línea de qué hace la sección. La usa el asistente para explicarla. */
  descripcion: string;
  /** Subsecciones: ids de módulos dentro de la sección (se navega con scroll). */
  sub?: { id: string; nombre: string }[];
}

// Fuente única del menú: Sidebar, ResponsiveLayout y el switch de App.tsx
// se alimentan de este array. Cualquier sección nueva se agrega aquí.
export const secciones: ItemMenu[] = [
  { id: 'precision', nombre: 'Precisión General', icono: Gauge,     estado: 'demo',   grupo: 'principal',
    descripcion: 'Precisión de detección por medio frente al 97.5% contractual y cobertura contra lo solicitado.' },
  { id: 'radio',     nombre: 'Radio',             icono: Radio,     estado: 'activo', grupo: 'principal',
    sub: [{ id: 'radio-vivo', nombre: 'Monitoreo en vivo' }, { id: 'radio-spots', nombre: 'Spots detectados' }, { id: 'radio-patro', nombre: 'Patrocinios y autopromos' }, { id: 'radio-audio', nombre: 'Testigos de audio' }, { id: 'radio-ranking', nombre: 'Ranking' }],
    descripcion: 'Monitoreo on-air en vivo (Testigos IA), spots detectados, patrocinios y autopromocionales, ranking de anunciantes.' },
  { id: 'tv',        nombre: 'Televisión',        icono: Tv,        estado: 'demo',   grupo: 'principal',
    sub: [{ id: 'tv-spoteo', nombre: 'Spoteo publicitario' }, { id: 'tv-acciones', nombre: 'Acciones especiales' }, { id: 'tv-prog', nombre: 'Programación 24h' }, { id: 'tv-video', nombre: 'Testigos de video' }, { id: 'tv-vista', nombre: 'Vista por plaza / tipo' }],
    descripcion: 'Spoteo publicitario, acciones especiales, programación 24/7 y testigos de video por plaza y tipo de canal.' },
  { id: 'impresos',  nombre: 'Impresos',          icono: Newspaper, estado: 'demo',   grupo: 'principal',
    sub: [{ id: 'imp-inserciones', nombre: 'Inserciones detectadas' }, { id: 'imp-testigo', nombre: 'Testigos (300 DPI)' }, { id: 'imp-filtros', nombre: 'Por publicación / grupo' }, { id: 'imp-tarifas', nombre: 'Tarifas vs. Tamaño' }, { id: 'imp-actividad', nombre: 'Lista preliminar' }],
    descripcion: 'Inserciones en periódicos, revistas y especiales, testigo de página y tarifa estimada.' },
  { id: 'academia',  nombre: 'Academia',          icono: GraduationCap, estado: 'activo', grupo: 'extra',
    sub: [{ id: 'acad-guias', nombre: 'Guías paso a paso' }, { id: 'acad-videos', nombre: 'Tutoriales en video' }, { id: 'acad-recursos', nombre: 'FAQ & Manuales' }],
    descripcion: 'Centro de capacitación y habilitación operativa: qué hacer y cómo operar el monitoreo de medios ACAM.' },
  { id: 'noc',       nombre: 'NOC & Mesa de Ayuda', icono: Headphones, estado: 'activo', grupo: 'extra',
    sub: [{ id: 'noc-streams', nombre: 'Salud de 147 Emisoras' }, { id: 'noc-tickets', nombre: 'Levantar Ticket' }],
    descripcion: 'Monitoreo de infraestructura, salud de streams de audio/video y mesa de ayuda 24/7 para soporte e incidencias.' },
  { id: 'innovacion', nombre: 'Innovación',       icono: Sparkles,  estado: 'demo',   grupo: 'extra',
    sub: [{ id: 'inno-grafos', nombre: 'Grafos de Conocimiento' }, { id: 'inno-gemelos', nombre: 'Gemelos Digitales' }, { id: 'inno-roadmap', nombre: 'Roadmap 2027' }],
    descripcion: 'Evolución de la plataforma: grafos de conocimiento de medios, gemelos digitales de audiencia y modelos multimodales.' },
];

export const seccionesPrincipales = secciones.filter(s => s.grupo === 'principal');
export const seccionesExtra = secciones.filter(s => s.grupo === 'extra');

/** Color del punto de estado, tomado de la paleta de branding. */
export const colorEstado = (estado: EstadoSeccion): string => {
  const { colores } = brandingConfig;
  if (estado === 'activo') return colores.exito;
  if (estado === 'demo') return colores.advertencia;
  return colores.textoOscuro;
};

export const tituloEstado: Record<EstadoSeccion, string> = {
  'activo': 'Conectado a datos en vivo',
  'demo': 'Demo con datos estructurados',
  'en-activacion': 'En activación',
};
