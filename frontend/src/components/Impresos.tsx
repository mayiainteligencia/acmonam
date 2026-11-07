import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Eye, Filter, RefreshCw } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import { keyframes, useIsMobile, inner } from './shared/ui';
import { ACENTO, CARD, D, Btn, Filtro, GrupoLogo, Logo, Modulo, td, th } from './shared/dark';
import { FONDO_TECH } from '../config/tema';
import { PUBLICACIONES, INSERCIONES, fmt, fmtMXN, type Insercion, type TipoImpreso } from '../data/medios';

const { colores } = brandingConfig;
const ANUNCIANTE: Record<string, string> = { Aurora: 'Tiendas Aurora', Nuvo: 'Banco Nuvo', Valmar: 'Grupo Valmar', Nortia: 'Nortia Telecom', Vestia: 'Vestia Moda', Meridia: 'Grupo Meridia', Lumen: 'Lumen Salud', Cobalto: 'Cobalto Bebidas' };
const PLANA: Record<number, string> = { 150: '1/8 Plana', 310: '1/4 Plana', 450: '1/2 Plana', 620: 'Plana Entera', 650: 'Plana Entera', 900: 'Doble Plana' };
const TIPOS: [TipoImpreso | 'Todos', string][] = [['Periódico', 'Periódicos'], ['Revista', 'Revistas'], ['Especial', 'Ediciones Especiales'], ['Todos', 'Todos - CDMX']];
const GRUPOS = ['Todos', ...Array.from(new Set(PUBLICACIONES.map(p => p.grupo)))];
const HEADER: [string, string[]][] = [
  ['16 Periódicos CDMX', ['El Universal', 'Reforma', 'Milenio Diario', 'El Economista', 'Excélsior', 'La Jornada']],
  ['34 Revistas', ['Forbes México', 'Expansión', 'Quién', 'Caras', 'Cosmopolitan', 'GQ México']],
  ['20 Ediciones Especiales', ['Caras Especial', 'Hola Especial', 'Vanidades Especial', 'GQ Especial', 'Vogue Especial', 'Quién Especial']],
];
const dmy = (f: string) => f.split('-').reverse().join('-');
const lista = (t: number) => Math.round(t * 1.08 / 1000) * 1000;

// Página impresa simulada: cabezal, titular, columnas y el anuncio detectado con borde de acento.
const Pagina = ({ ins, alto }: { ins: Insercion; alto: number }) => (
  <div style={{ width: alto * 0.74, height: alto, background: '#FBFAF6', color: '#111', padding: 10, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,.5)', flexShrink: 0 }}>
    <div style={{ fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: alto / 14, textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 3 }}>{ins.publicacion.nombre.toUpperCase()}</div>
    <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: alto / 22, margin: '8px 0 6px', width: '55%', lineHeight: 1.1 }}>Nuevas medidas para fortalecer la economía</div>
    {Array.from({ length: 16 }, (_, i) => <div key={i} style={{ height: 3, width: `${58 + (i * 37) % 40}%`, background: '#C9C9C4', marginBottom: 5 }} />)}
    <div style={{ position: 'absolute', right: 10, top: '26%', width: '42%', height: ins.cm2 > 500 ? '34%' : '22%', border: `3px solid ${colores.primario}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', fontWeight: 900, fontSize: alto / 17, color: '#0047AB' }}>{ins.marca}</div>
  </div>
);

export const Impresos = () => {
  const m = useIsMobile();
  const [grupo, setGrupo] = useState('Todos');
  const [tipo, setTipo] = useState<TipoImpreso | 'Todos'>('Periódico');
  const [sel, setSel] = useState(0);
  const [grande, setGrande] = useState(false);
  const [soloFiltro, setSoloFiltro] = useState(false);

  // Los ítems del submenú lateral disparan este evento para ir a un módulo.
  useEffect(() => {
    const h = (e: Event) => setTimeout(() => document.getElementById((e as CustomEvent<string>).detail)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    window.addEventListener('seccion:goto', h);
    return () => window.removeEventListener('seccion:goto', h);
  }, []);

  const filtradas = useMemo(() => INSERCIONES.filter(i => (grupo === 'Todos' || i.publicacion.grupo === grupo) && (tipo === 'Todos' || i.publicacion.tipo === tipo)), [grupo, tipo]);
  const tabla = soloFiltro ? filtradas : INSERCIONES;
  const actual = filtradas[sel] ?? filtradas[0];
  const medios = [...new Map(filtradas.map(i => [i.publicacion.nombre, i])).values()].slice(0, 3);
  const gasto = useMemo(() => {
    const c: Record<string, { n: string; v: number; color: string }> = {};
    INSERCIONES.forEach(i => { const k = i.publicacion.grupo; c[k] = c[k] ?? { n: k.replace('Grupo ', ''), v: 0, color: i.publicacion.color }; c[k].v += i.tarifaMXN; });
    return Object.values(c).sort((a, b) => b.v - a.v).slice(0, 4);
  }, []);
  const reiniciar = () => { setGrupo('Todos'); setTipo('Periódico'); setSel(0); };
  const exportar = () => {
    const filas = [['Fecha', 'Medio', 'Tipo', 'Marca', 'Seccion', 'Pagina', 'cm2', 'Color'], ...tabla.map(i => [i.fecha, i.publicacion.nombre, i.publicacion.tipo, i.marca, i.seccion, i.pagina, i.cm2, i.color])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([filas.map(f => f.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'inserciones-impresos.csv'; a.click();
  };
  const vacio = <div style={{ color: D.sub, fontSize: 13, padding: 14 }}>Sin inserciones para este filtro.</div>;

  return (
    <div style={{ minHeight: '100%', padding: m ? 16 : 30, ...FONDO_TECH }}><style>{keyframes}</style>
      <div style={inner}>
        {/* Cabecera */}
        {/* Cabecera */}
        <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', justifyContent: 'space-between', alignItems: m ? 'flex-start' : 'center', gap: 20, marginBottom: 22 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACENTO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monitoreo de Prensa y Revistas</div>
            <h1 style={{ fontSize: m ? 26 : 34, fontWeight: 800, color: D.txt, margin: '6px 0 6px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Monitoreo de Impresos IA</h1>
            <p style={{ margin: 0, fontSize: 14, color: D.sub, maxWidth: 500, lineHeight: 1.5 }}>Verificación automática de inserciones publicitarias, testigos de alta resolución y análisis de tarifas en prensa y revistas.</p>
          </div>
          <div style={{ background: CARD, border: `1px solid ${D.borde}`, borderRadius: 16, padding: '16px 20px', color: D.txt, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)', display: 'grid', gridTemplateColumns: m ? '1fr' : 'auto auto', gap: 20, alignItems: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: ACENTO }}>{PUBLICACIONES.length}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Medios Monitoreados</span>
              </div>
              <span style={{ display: 'inline-block', marginTop: 10, padding: '5px 12px', borderRadius: 999, border: `1px solid rgba(219, 242, 133, 0.4)`, background: 'rgba(219, 242, 133, 0.16)', color: '#DBF285', fontWeight: 600, fontSize: 12.5 }}>Lista Preliminar</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
              {HEADER.map(([t, l]) => (
                <div key={t}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: D.sub, marginBottom: 6 }}>{t}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                    {l.map(n => <GrupoLogo key={n} nombre={n} color={colores.primario} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '0.9fr 1.25fr', gap: 18, marginBottom: 18, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            {/* Módulo 1 */}
            <Modulo id="imp-filtros" title="MÓDULO 1: Filtros de Visualización (Publicación y Grupo)" right={<><Btn onClick={reiniciar}><RefreshCw size={14} /></Btn><Btn onClick={reiniciar}>Todos los filtros</Btn></>}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: D.txt, marginBottom: 8 }}>Grupo Editorial</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>{GRUPOS.map(g => <Filtro key={g} on={grupo === g} onClick={() => { setGrupo(g); setSel(0); }}>{g}</Filtro>)}</div>
              <div style={{ borderTop: `1px solid ${D.fila}`, paddingTop: 12, fontSize: 13.5, fontWeight: 600, color: D.txt, marginBottom: 8 }}>Tipo de Publicación</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{TIPOS.map(([t, l]) => <Filtro key={t} on={tipo === t} onClick={() => { setTipo(t); setSel(0); }}>{l}</Filtro>)}</div>
            </Modulo>

            {/* Módulo 3 */}
            <Modulo id="imp-testigo" title="MÓDULO 3: Testigo de Alta Resolución (Visualizador de Página)">
              {!actual ? vacio : <>
                <div style={{ color: ACENTO, fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>Vista de Testigo - 300 DPI ({actual.publicacion.nombre} - Pág. {actual.pagina})</div>
                <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1.4fr 1fr', gap: 14 }}>
                  <div style={{ border: `1px solid ${D.fila}`, borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.04)' }}><Pagina ins={actual} alto={grande ? 360 : 250} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {medios.map(i => (
                      <button key={i.publicacion.nombre} onClick={() => setSel(filtradas.indexOf(i))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '10px 12px', background: i === actual ? 'rgba(219, 242, 133, 0.15)' : 'rgba(255, 255, 255, 0.02)', border: `1px solid ${i === actual ? 'rgba(219, 242, 133, 0.35)' : D.fila}`, borderRadius: 8, color: i === actual ? ACENTO : D.txt, fontWeight: i === actual ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s ease' }}>
                        <span>{i.publicacion.nombre}</span>
                        {i === actual && <span style={{ color: ACENTO, fontSize: 10.5, fontWeight: 700, background: 'rgba(219, 242, 133, 0.2)', padding: '2px 8px', borderRadius: 4 }}>Activo</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  <Btn><Download size={14} /> Descargar: Testigo 300 DPI (PDF/JPEG)</Btn>
                  <Btn active={grande} onClick={() => setGrande(v => !v)}><Eye size={14} /> Ver Página Completa</Btn>
                </div></>}
            </Modulo>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            {/* Módulo 2 */}
            <Modulo id="imp-inserciones" title="MÓDULO 2: Inserciones Detectadas (Registro de Anuncios)" right={<>
              <Btn onClick={exportar}><Download size={14} /> Exportar CSV</Btn>
              <Btn active={soloFiltro} onClick={() => setSoloFiltro(v => !v)}><Filter size={14} /> Filtrar por grupo</Btn></>}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '660px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Fecha', 'Medio', 'Marca / Anunciante', 'Sección', 'Página', 'Tamaño (cm²)', 'Color'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>{tabla.slice(0, 5).map((i, k) => (
                    <tr key={k} onClick={() => { const x = filtradas.indexOf(i); if (x >= 0) setSel(x); }} style={{ cursor: 'pointer', background: k === 0 ? 'rgba(219, 242, 133, 0.08)' : undefined }}>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{dmy(i.fecha)}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Logo nombre={i.publicacion.nombre} color={i.publicacion.color} size={32} />
                          <span>{i.publicacion.nombre}<div style={{ color: D.sub, fontSize: 11.5 }}>({i.publicacion.tipo === 'Periódico' ? 'Periódico' : 'Revista'})</div></span>
                        </div>
                      </td>
                      <td style={{ ...td, fontWeight: 500, color: '#FFFFFF' }}>{ANUNCIANTE[i.marca]}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{i.seccion}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>Pág. {i.pagina}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{PLANA[i.cm2]} <span style={{ color: D.sub, fontSize: 11 }}>({fmt(i.cm2)} cm²)</span></td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{i.color}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {tabla.length === 0 && vacio}
            </Modulo>

            <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1.1fr 1fr', gap: 16 }}>
              {/* Módulo 4 */}
              <Modulo id="imp-tarifas" title="MÓDULO 4: Tarifas Estimadas vs. Tamaño de Anuncio">
                {filtradas.length === 0 ? vacio : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Tamaño', 'Ubicación', 'Tarifa Lista Est.', 'Costo Calculado'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>{filtradas.slice(0, 3).map((i, k) => (
                    <tr key={k}><td style={td}>{PLANA[i.cm2]}</td><td style={td}>{i.pagina < 10 ? `Pág. ${i.pagina}` : i.seccion === 'Negocios' ? 'Sección A' : 'Interior'}</td>
                      <td style={td}>{fmtMXN(lista(i.tarifaMXN))} MXN</td><td style={{ ...td, color: ACENTO, fontWeight: 700 }}>{fmtMXN(i.tarifaMXN)} MXN</td></tr>
                  ))}</tbody></table></div>}
              </Modulo>

              {/* Módulo 5 */}
              <Modulo id="imp-actividad" title="MÓDULO 5: Panel de Actividad y Estatus">
                <div style={{ height: 150 }}><ResponsiveContainer>
                  <BarChart data={gasto} margin={{ top: 6, right: 4, left: -6, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="n" tick={{ fill: D.sub, fontSize: 10.5 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: D.sub, fontSize: 10.5 }} width={48} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} contentStyle={{ background: '#0A170E', border: `1px solid ${D.borde}`, borderRadius: 10, fontSize: 12, color: D.txt, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)' }} labelStyle={{ color: D.sub }} formatter={v => fmtMXN(Number(v))} />
                    <Bar dataKey="v" name="Gasto" radius={[5, 5, 0, 0]} barSize={26}>{gasto.map(d => <Cell key={d.n} fill={d.color} fillOpacity={.9} />)}</Bar></BarChart></ResponsiveContainer></div>
                <div style={{ textAlign: 'center', fontSize: 11.5, color: D.sub, marginBottom: 10 }}>Gasto Estimado por Grupo Editorial</div>
                <div style={{ border: `1px solid ${D.fila}`, borderRadius: 12, padding: 12, background: 'rgba(255, 255, 255, 0.04)' }}>
                  <div style={{ fontSize: 14 }}><b style={{ color: ACENTO, fontSize: 17 }}>Hoy: {INSERCIONES.length * 4 + 4}</b> Inserciones Detectadas</div>
                  <div style={{ fontSize: 12, color: D.sub, margin: '4px 0 8px' }}>Sujeto a cambios - Lista preliminar ACAM por confirmar</div>
                  <div style={{ height: 7, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 4 }}><div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, #729013, #DBF285)', boxShadow: '0 0 10px rgba(219, 242, 133, 0.4)', borderRadius: 4 }} /></div>
                  <div style={{ fontSize: 11.5, color: D.sub, marginTop: 6 }}>Procesamiento de ediciones del día</div>
                </div>
              </Modulo>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
