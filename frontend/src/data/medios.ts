// Datos demo del alcance MAYIA Escucha (Radio, TV, Impresos). Deterministas (sin Math.random).
// ponytail: catálogos completos pero con detecciones simuladas; al conectar el
// backend se reemplazan estos arrays y los componentes no cambian.

export const PLAZAS = ['CDMX', 'Guadalajara', 'Monterrey'] as const;
export type Plaza = typeof PLAZAS[number];

export const fmt = (n: number) => n.toLocaleString('es-MX');
export const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX');
/** Pseudo-aleatorio estable a partir de un entero. */
export const rnd = (i: number, mod: number, off = 0) => ((i * 7919 + off * 104729 + 13) % 9973) % mod;

const MARCAS = ['Aurora', 'Nuvo', 'Valmar', 'Nortia', 'Vestia', 'Meridia', 'Lumen', 'Cobalto'];
const CATEGORIAS = ['Retail', 'Finanzas', 'Automotriz', 'Telecom', 'Moda', 'Alimentos', 'Salud', 'Bebidas'];

// ───────── Precisión (contrato: 97.5% por medio) ─────────
export const META_PRECISION = 97.5;
export const PRECISION = [
  { medio: 'Radio',      id: 'radio',    actual: 97.9, verificados: 1840, errores: 39, cobertura: 147, pedido: 147, unidad: 'estaciones AM/FM', serie: [97.1, 97.4, 97.2, 97.8, 97.6, 98.0, 97.9, 97.9] },
  { medio: 'Televisión', id: 'tv',       actual: 97.6, verificados: 2210, errores: 71, cobertura: 95,  pedido: 100, unidad: 'canales',          serie: [96.2, 96.5, 96.9, 97.1, 97.0, 97.4, 97.5, 97.6] },
  { medio: 'Impresos',   id: 'impresos', actual: 98.3, verificados: 960,  errores: 16, cobertura: 70,  pedido: 70,  unidad: 'publicaciones',    serie: [97.9, 98.1, 98.0, 98.4, 98.2, 98.5, 98.3, 98.3] },
];

// ───────── Radio ─────────
import { ESTACIONES_147, GRUPOS_CATALOGO, type EstacionOficial, type BandaRadio } from './catalogo147';
export { ESTACIONES_147, GRUPOS_CATALOGO, type EstacionOficial, type BandaRadio };

export interface GrupoRadio { id: string; color: string }
export const GRUPOS_RADIO: GrupoRadio[] = GRUPOS_CATALOGO.map(g => ({ id: g.id, color: g.color }));

export const colorGrupo = (g: string) => {
  const norm = (g || '').trim().toLowerCase();
  const c = GRUPOS_CATALOGO.find(x => x.id.toLowerCase() === norm);
  if (c) return c.color;
  let hash = 0;
  for (let i = 0; i < g.length; i++) hash = g.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#2563EB', '#DC2626', '#7C3AED', '#F59E0B', '#0D9488', '#DB2777', '#EA580C', '#16A34A', '#4D7C0F', '#0891B2'];
  return colors[Math.abs(hash) % colors.length];
};

export interface Estacion {
  id?: string;
  siglas?: string;
  nombre: string;
  dial: string;
  banda?: BandaRadio;
  plaza: Plaza;
  grupo: string;
  activa: boolean;
  spotsHoy: number;
  streamUrl?: string;
  estado?: string;
  ciudad?: string;
  estacionRaw?: string;
}

// Catálogo oficial de las 147 estaciones activas de radio (CDMX: 62, Guadalajara: 45, Monterrey: 40)
export const ESTACIONES: Estacion[] = ESTACIONES_147.map(e => ({
  id: e.id,
  siglas: e.siglas,
  nombre: e.nombre,
  dial: e.dial,
  banda: e.banda,
  plaza: e.plaza,
  grupo: e.grupo,
  activa: e.activa,
  spotsHoy: e.spotsHoy,
  streamUrl: e.streamUrl,
  estado: e.estado,
  ciudad: e.ciudad,
  estacionRaw: e.estacionRaw,
}));

export type TipoRadio = 'Spot Regular' | 'Patrocinio' | 'Autopromocional';
export interface SpotRadio { estacion: string; plaza: Plaza; grupo: string; marca: string; anunciante: string; categoria: string; hora: string; dur: number; tipo: TipoRadio }
const TIPOS_RADIO: TipoRadio[] = ['Spot Regular', 'Spot Regular', 'Spot Regular', 'Patrocinio', 'Autopromocional'];
export const SPOTS_RADIO: SpotRadio[] = Array.from({ length: 48 }, (_, i) => {
  const e = ESTACIONES[(i * 5) % ESTACIONES.length];
  const m = rnd(i, MARCAS.length, 1);
  return {
    estacion: `${e.nombre} ${e.dial}`, plaza: e.plaza, grupo: e.grupo, marca: MARCAS[m], anunciante: MARCAS[m],
    categoria: CATEGORIAS[m], hora: `${String(6 + (i % 16)).padStart(2, '0')}:${String(rnd(i, 60, 2)).padStart(2, '0')}`,
    dur: [15, 20, 30, 45, 60][rnd(i, 5, 3)], tipo: TIPOS_RADIO[i % 5],
  };
}).sort((a, b) => a.hora.localeCompare(b.hora));

/** Spots por hora del día (0-23), para la gráfica de actividad. */
export const SPOTS_POR_HORA = Array.from({ length: 24 }, (_, h) => ({
  hora: `${String(h).padStart(2, '0')}h`,
  regular: h < 5 ? 20 + rnd(h, 30) : 120 + rnd(h, 220, 4) + (h >= 7 && h <= 9 ? 120 : 0),
  patrocinio: 8 + rnd(h, 40, 5),
  autopromo: 5 + rnd(h, 25, 6),
}));

// ───────── Televisión ─────────
export type TipoCanal = 'Abierta nacional' | 'Abierta local' | 'De paga';
export interface Canal { canal: string; tipo: TipoCanal; plaza: Plaza | 'Las 3 plazas'; proveedor: string; estado: 'activo' | 'por confirmar'; spotsHoy: number }

const NACIONALES = ['Las Estrellas', 'N+ Foro', 'Canal 5', 'Azteca 7', 'El Nu9ve', 'Once TV', 'Azteca 1', 'Canal 22', 'ADN Noticias', 'Imagen Televisión', 'Capital 21', 'Canal Catorce', 'A+', 'Excélsior TV'];
const LOCALES: [string, Plaza][] = [
  ['TV Mexiquense', 'CDMX'], ['Milenio TV', 'CDMX'], ['El Heraldo TV', 'CDMX'], ['PopCorn Central', 'CDMX'], ['TV UNAM', 'CDMX'], ['Canal del Congreso', 'CDMX'], ['Canal Judicial', 'CDMX'],
  ['Canal 4 Local', 'Guadalajara'], ['Canal 7 Jalisco', 'Guadalajara'], ['Canal 44 UdeG', 'Guadalajara'], ['Canal 6 GDL', 'Guadalajara'], ['Telecable GDL', 'Guadalajara'],
  ['Televisa Monterrey', 'Monterrey'], ['TV Nuevo León', 'Monterrey'], ['Teleactiva', 'Monterrey'], ['Multimedios', 'Monterrey'], ['Canal 28 MTY', 'Monterrey'], ['Canal 12 MTY', 'Monterrey'],
];
const PAGA = ['Lifetime', 'Comedy Central', 'Discovery Kids', 'ESPN', 'ESPN 2', 'ESPN 3', 'ESPN 4', 'ESPN Extra', 'Fox Sports', 'Fox Sports 2', 'Fox Sports 3', 'Disney Channel', 'Disney Junior', 'Cartoon Network', 'Cinemax', 'HBO', 'HBO 2', 'HBO Family', 'Universal TV', 'TNT', 'TNT Series', 'Space', 'Warner Channel', 'AXN', 'Sony Channel', 'FX', 'FXX', 'National Geographic', 'History', 'A&E', 'TLC', 'Discovery Channel', 'Animal Planet', 'Food Network', 'Golf Channel', 'Tooncast', 'Nickelodeon', 'Nick Jr.', 'MTV', 'VH1', 'Paramount Channel', 'Telemundo', 'Star Channel', 'Cinecanal', 'Golden', 'Golden Edge', 'Studio Universal', 'TCM', 'De Película', 'Canal Clásico', 'Telehit', 'Distrito Comedia', 'Tlnovelas', 'Bandamax', 'Multipremier', 'TUDN', 'Claro Sports', 'beIN Sports', 'Hola TV', 'Unimás', 'Boomerang', 'Investigation Discovery', 'Hallmark', 'Film & Arts'];
const PROVEEDORES = ['SKY', 'SKY', 'SKY', 'SKY', 'SKY', 'SKY', 'SKY', 'DISH', 'Totalplay', 'Izzi'];

export const CANALES: Canal[] = [
  ...NACIONALES.map((canal, i): Canal => ({ canal, tipo: 'Abierta nacional', plaza: 'Las 3 plazas', proveedor: 'Aire', estado: 'activo', spotsHoy: 80 + rnd(i, 260, 7) })),
  ...LOCALES.map(([canal, plaza], i): Canal => ({ canal, tipo: 'Abierta local', plaza, proveedor: 'Aire', estado: 'activo', spotsHoy: 20 + rnd(i, 120, 8) })),
  ...Array.from({ length: 68 }, (_, i): Canal => ({
    canal: i < PAGA.length ? PAGA[i] : i < 63 ? `Canal SKY ${i + 1}` : `SKY posición ${i - 62}`,
    tipo: 'De paga', plaza: 'Las 3 plazas', proveedor: i >= 63 ? 'SKY' : PROVEEDORES[i % PROVEEDORES.length],
    estado: i >= 63 ? 'por confirmar' : 'activo', spotsHoy: 15 + rnd(i, 140, 9),
  })),
];

export type SubtipoSpot = 'Regular' | 'Patrocinio' | 'Mención' | 'Super-imposición';
export interface SpotTV { canal: string; tipo: TipoCanal; plaza: Plaza; marca: string; categoria: string; subtipo: SubtipoSpot; programa: string; hora: string; dur: number }
const SUBTIPOS: SubtipoSpot[] = ['Regular', 'Regular', 'Regular', 'Patrocinio', 'Mención', 'Super-imposición'];
const PROGRAMAS = ['Noticias', 'Matutino', 'Deportes', 'Película', 'Serie', 'Telenovela', 'Barrio', 'Cocina', 'Concurso'];
export const SPOTS_TV: SpotTV[] = Array.from({ length: 120 }, (_, i) => {
  const c = CANALES[(i * 7) % CANALES.length];
  const m = rnd(i, MARCAS.length, 11);
  return {
    canal: c.canal, tipo: c.tipo, plaza: c.plaza === 'Las 3 plazas' ? PLAZAS[i % 3] : c.plaza, marca: MARCAS[m], categoria: CATEGORIAS[m],
    subtipo: SUBTIPOS[i % 6], programa: PROGRAMAS[rnd(i, PROGRAMAS.length, 12)],
    hora: `${String(6 + (i % 17)).padStart(2, '0')}:${String(rnd(i, 60, 13)).padStart(2, '0')}`, dur: [10, 20, 30, 45][rnd(i, 4, 14)],
  };
}).sort((a, b) => a.hora.localeCompare(b.hora));

export type AccionEspecial = 'Mención' | 'Integración activa' | 'Integración ambiental' | 'Festejo de gol';
export const TIPOS_ACCION: AccionEspecial[] = ['Mención', 'Integración activa', 'Integración ambiental', 'Festejo de gol'];
export const ACCIONES_TV = Array.from({ length: 12 }, (_, i) => ({
  canal: CANALES[(i * 11) % 32].canal, accion: TIPOS_ACCION[i % 4], marca: MARCAS[rnd(i, MARCAS.length, 15)],
  programa: ['Liga MX', 'Hoy', 'Película', 'SportsCenter', 'Serie', 'Barrio'][i % 6],
  hora: `${String(9 + i).padStart(2, '0')}:${String(rnd(i, 60, 16)).padStart(2, '0')}`, dur: 6 + rnd(i, 25, 17),
}));

export type CondicionProg = 'Estreno' | 'Repetición' | 'Capítulo';
export interface BloqueProg { programa: string; genero: string; inicio: number; fin: number; condicion: CondicionProg }
const GENEROS: [string, string][] = [['Matutino', 'Hoy'], ['Noticiero', 'Noticias'], ['Telenovela', 'Amor eterno'], ['Concurso', 'Reto 2026'], ['Cine', 'Película de la tarde'], ['Infantil', 'Serie animada'], ['Deportes', 'Liga MX'], ['Serie', 'Serie estelar']];
const CONDS: CondicionProg[] = ['Capítulo', 'Capítulo', 'Estreno', 'Repetición'];
/** Parrilla de 24 h para un canal: bloques consecutivos sin huecos. */
export const parrilla = (seed: number): BloqueProg[] => {
  const out: BloqueProg[] = [];
  for (let t = 0, k = seed; t < 24; k++) {
    const dur = Math.min(24 - t, 1 + rnd(k, 3, 18));
    const [genero, programa] = GENEROS[rnd(k, GENEROS.length, 19)];
    out.push({ programa, genero, inicio: t, fin: t + dur, condicion: CONDS[rnd(k, 4, 20)] });
    t += dur;
  }
  return out;
};
export const CANALES_PROG = ['Las Estrellas', 'Azteca 7', 'Canal 5', 'Imagen Televisión', 'Multimedios', 'ESPN'];

export const TESTIGOS_VIDEO = Array.from({ length: 12 }, (_, i) => ({
  canal: CANALES[(i * 9) % 40].canal, marca: MARCAS[rnd(i, MARCAS.length, 21)], dur: [10, 20, 30][i % 3],
  fecha: ['2026-10-15', '2026-10-09', '2026-09-28', '2026-09-14', '2026-08-30', '2026-08-18'][i % 6],
  hora: `${String(7 + i).padStart(2, '0')}:${String(rnd(i, 60, 22)).padStart(2, '0')}`,
}));

// ───────── Impresos ─────────
export type TipoImpreso = 'Periódico' | 'Revista' | 'Especial';
export interface Publicacion { nombre: string; tipo: TipoImpreso; grupo: string; color: string }
const GRUPOS_ED = ['Grupo Reforma', 'Grupo Milenio', 'Televisa Publishing', 'Condé Nast', 'Hearst', 'Grupo Expansión', 'Grupo Imagen', 'Editorial Contenido', 'Independiente'];
const COLORES_ED = ['#2563EB', '#DC2626', '#7C3AED', '#0D9488', '#F59E0B', '#DB2777', '#16A34A', '#EA580C', '#6B7280'];

const PERIODICOS = ['El Economista', 'El Financiero', 'El Universal', 'Excélsior', 'La Jornada', 'Milenio Diario', 'Reforma', 'Ovaciones', 'Publimetro', 'La Razón', '24 Horas', 'Récord', 'El Heraldo de México', 'La Crónica de Hoy', 'El Sol de México', 'Diario Basta'];
const REVISTAS = ['Forbes México', 'GQ México', 'Proceso', 'Quién', 'Vogue México', 'Expansión', 'Elle', 'Hola', 'Vanidades', 'Caras', 'Cosmopolitan', 'Marie Claire', "Harper's Bazaar", 'Esquire', "Men's Health", "Women's Health", 'National Geographic', 'Muy Interesante', 'TV y Novelas', 'TV Notas', 'People en Español', 'Letras Libres', 'Nexos', 'Líderes Mexicanos', 'Entrepreneur', 'Fortune México', 'Architectural Digest', 'Condé Nast Traveler', 'Travel+Leisure', 'Motor Trend', 'Quo', 'Chilango', 'Time Out México', 'Glamour'];
const ESPECIALES = ['Caras', 'Vogue', 'Hola', 'Quién', 'GQ', 'Elle', 'Vanidades', 'Expansión', 'Forbes', "Harper's Bazaar", 'Marie Claire', 'Esquire', 'Cosmopolitan', 'Proceso', 'Muy Interesante', "Men's Health", 'TV y Novelas', 'Glamour', 'Entrepreneur', 'National Geographic'];

const pub = (nombre: string, tipo: TipoImpreso, i: number): Publicacion => ({ nombre, tipo, grupo: GRUPOS_ED[i % GRUPOS_ED.length], color: COLORES_ED[i % COLORES_ED.length] });
export const PUBLICACIONES: Publicacion[] = [
  ...PERIODICOS.map((n, i) => pub(n, 'Periódico', i)),
  ...REVISTAS.map((n, i) => pub(n, 'Revista', i + 3)),
  ...ESPECIALES.map((n, i) => pub(`${n} Especial`, 'Especial', i + 3)),
];
export const CONTEO_PUB = { Periódico: PERIODICOS.length, Revista: REVISTAS.length, Especial: ESPECIALES.length };

export interface Insercion { publicacion: Publicacion; marca: string; categoria: string; seccion: string; pagina: number; cm2: number; color: 'Color' | 'B&N'; tarifaMXN: number; fecha: string }
const SECCIONES = ['Negocios', 'Nacional', 'Cartera', 'Moda', 'Deportes', 'Cultura', 'Finanzas', 'Estilo'];
const TARIFA_CM2 = { 'Periódico': 240, 'Revista': 330, 'Especial': 260 } as const;
export const INSERCIONES: Insercion[] = Array.from({ length: 30 }, (_, i) => {
  const p = PUBLICACIONES[(i * 7) % PUBLICACIONES.length];
  const cm2 = [150, 310, 450, 620, 650, 900][rnd(i, 6, 23)];
  const color = rnd(i, 4, 24) === 0 ? 'B&N' : 'Color';
  const m = rnd(i, MARCAS.length, 25);
  return {
    publicacion: p, marca: MARCAS[m], categoria: CATEGORIAS[m], seccion: SECCIONES[rnd(i, SECCIONES.length, 26)], pagina: 2 + rnd(i, 40, 27),
    cm2, color, tarifaMXN: Math.round(cm2 * TARIFA_CM2[p.tipo] * (color === 'B&N' ? 0.7 : 1) * (0.85 + rnd(i, 30, 28) / 100)),
    fecha: `2026-10-${String(1 + (i % 15)).padStart(2, '0')}`,
  };
});
