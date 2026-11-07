// src/components/AnalisisPauta.tsx
// Carga una pauta (.xlsx), la previsualiza, la activa y muestra su cumplimiento con evidencia en audio.
// Aislado: solo usa /api/monitor/pauta/*; reutiliza AudioTestigo (solo lectura) de TestigosIA.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Upload, Check, Trash2, RefreshCw, ChevronDown, ChevronUp, Clock, FileSpreadsheet } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import { useIsMobile } from './shared/ui';
import { AudioTestigo, fechaTestigo, horaMX, type Testigo } from './TestigosIA';

const { colores } = brandingConfig;
const API = '/api/monitor/pauta';

interface Semana { semana: string; requerido: number }
interface LineaPreview { estacion: string; horario_inicio: string; horario_fin: string; dias: string; programa: string; formato: string; semanas: Semana[] }
interface Lote {
  lote_id: string; marca: string; keywords: string; activa: number; filas: number; total_requerido: number;
  desde: string; hasta: string; estaciones: string[]; lineas: LineaPreview[] | null;
}
type Estado = 'cumplido' | 'parcial' | 'incumplido' | 'sin_datos';
interface LineaCumpl {
  id: number; lote_id: string; marca: string; estacion: string; horario_inicio: string; horario_fin: string;
  dias: string; programa: string; formato: string; semana: string; requerido: number; detectado: number;
  estado: Estado; detecciones: Testigo[];
}
interface Cumpl { lineas: LineaCumpl[]; resumen: Record<Estado, number>; semanas: string[] }

const ESTADOS: Estado[] = ['cumplido', 'parcial', 'incumplido', 'sin_datos'];
const COLOR: Record<Estado, string> = { cumplido: '#22C55E', parcial: '#F59E0B', incumplido: '#EF4444', sin_datos: '#9CA3AF' };
const ETIQUETA: Record<Estado, string> = { cumplido: 'Cumplido', parcial: 'Parcial', incumplido: 'Incumplido', sin_datos: 'Sin datos aún' };

const fmtFecha = (iso: string, anio = false) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', ...(anio && { year: 'numeric' }) });
const fmtDiaHora = (ts: string) =>
  `${fechaTestigo(ts).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', weekday: 'short', day: 'numeric', month: 'short' })} · ${horaMX(ts)}`;
const semanaDefault = (semanas: string[]) => {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  return [...semanas].reverse().find(s => s <= hoy) ?? semanas[0] ?? '';
};

const card: React.CSSProperties = { background: colores.fondoClaro, borderRadius: 16, border: `1px solid ${colores.borde}`, boxShadow: colores.sombra };
const campo: React.CSSProperties = { padding: '10px 12px', borderRadius: 10, border: `1px solid ${colores.borde}`, background: colores.fondoPrincipal, color: colores.textoClaro, fontSize: 13.5, minWidth: 0, width: '100%', boxSizing: 'border-box' };
const boton = (relleno = false, color: string = colores.primarioVivo): React.CSSProperties => ({
  padding: '10px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  border: `1px solid ${relleno ? color : colores.borde}`, background: relleno ? color : 'transparent', color: relleno ? '#fff' : (color === colores.primarioVivo ? colores.textoMedio : color), whiteSpace: 'nowrap',
});
const titulo: React.CSSProperties = { fontSize: 17, fontWeight: 700, color: colores.textoClaro, margin: 0 };
const sub: React.CSSProperties = { fontSize: 13, color: colores.textoOscuro, margin: '4px 0 0' };
const pill = (c: string): React.CSSProperties => ({ fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 999, color: c, background: `${c}22`, whiteSpace: 'nowrap' });

const Aro = ({ pct, color }: { pct: number; color: string }) => {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" style={{ flexShrink: 0 }}>
      <circle cx="52" cy="52" r={r} fill="none" stroke={colores.borde} strokeWidth="9" />
      <circle cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 52 52)" />
      <text x="52" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill={colores.textoClaro}>{pct}%</text>
    </svg>
  );
};

export const AnalisisPauta = () => {
  const m = useIsMobile();
  const [marca, setMarca] = useState('');
  const [keywords, setKeywords] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Lote | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [cumpl, setCumpl] = useState<Cumpl | null>(null);
  const [semana, setSemana] = useState('');
  const [loteSel, setLoteSel] = useState('');
  const [filtro, setFiltro] = useState<Estado | ''>('');
  const [abierta, setAbierta] = useState<number | null>(null);

  const cargarLotes = useCallback(async () => {
    try { const r = await fetch(`${API}/lotes`); if (r.ok) setLotes(await r.json()); } catch { /* monitor apagado */ }
  }, []);

  const cargarCumpl = useCallback(async () => {
    try {
      const r = await fetch(`${API}/cumplimiento${loteSel ? `?lote_id=${loteSel}` : ''}`);
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail);
      const d: Cumpl = await r.json();
      setCumpl(d);
      setSemana(s => (s && d.semanas.includes(s) ? s : semanaDefault(d.semanas)));
      setError('');
    } catch (e) { setError((e instanceof Error && e.message) || 'No se pudo consultar el cumplimiento. ¿Está corriendo el monitor (:8001)?'); }
  }, [loteSel]);

  useEffect(() => {
    cargarLotes();
    // si quedó una pauta sin confirmar de antes, mostrarla como preview
    fetch(`${API}/lotes`).then(r => r.json()).then(async (ls: Lote[]) => {
      const p = ls.find(l => !l.activa);
      if (p) setPreview(await (await fetch(`${API}/lote/${p.lote_id}`)).json());
    }).catch(() => {});
  }, [cargarLotes]);
  useEffect(() => { cargarCumpl(); const t = setInterval(cargarCumpl, 30_000); return () => clearInterval(t); }, [cargarCumpl]);

  const subir = async () => {
    if (!archivo || !marca.trim()) return setError('Escribe la marca y elige el archivo .xlsx.');
    setError(''); setSubiendo(true);
    const fd = new FormData();
    fd.append('file', archivo); fd.append('marca', marca.trim()); fd.append('keywords', keywords);
    try {
      const r = await fetch(`${API}/upload`, { method: 'POST', body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail ?? 'Error al subir');
      setPreview(d); setArchivo(null); cargarLotes();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al subir'); }
    setSubiendo(false);
  };
  const activar = async () => {
    if (!preview) return;
    await fetch(`${API}/${preview.lote_id}/activar`, { method: 'POST' });
    setPreview(null); setMarca(''); setKeywords(''); await cargarLotes(); cargarCumpl();
  };
  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta pauta?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (preview?.lote_id === id) setPreview(null);
    if (loteSel === id) setLoteSel('');
    await cargarLotes(); cargarCumpl();
  };

  const filasSemana = useMemo(() => (cumpl?.lineas ?? []).filter(l => l.semana === semana), [cumpl, semana]);
  const conteo = (e: Estado) => filasSemana.filter(l => l.estado === e).length;
  const req = filasSemana.reduce((a, l) => a + l.requerido, 0);
  const cubierto = filasSemana.reduce((a, l) => a + Math.min(l.detectado, l.requerido), 0);
  const pct = req ? Math.round((cubierto / req) * 100) : 0;
  const visibles = filasSemana.filter(l => !filtro || l.estado === filtro);
  const activos = lotes.filter(l => l.activa);
  const grid = (cols: string): React.CSSProperties => ({ display: 'grid', gridTemplateColumns: m ? '1fr' : cols, gap: 12 });

  const porEstacion = useMemo(() => {
    const g: Record<string, LineaPreview[]> = {};
    preview?.lineas?.forEach(l => (g[l.estacion] ??= []).push(l));
    return Object.entries(g);
  }, [preview]);

  return (
    <div style={{ padding: m ? 16 : '24px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Cargar */}
      <section style={{ ...card, padding: m ? 16 : 22 }}>
        <h2 style={titulo}>Cargar pauta</h2>
        <p style={sub}>Sube el .xlsx de pauta. Antes de activarla verás un resumen para confirmar.</p>
        <div style={{ ...grid('1fr 1.3fr 1.3fr auto'), marginTop: 16, alignItems: 'center' }}>
          <input style={campo} placeholder="Marca / cliente" value={marca} onChange={e => setMarca(e.target.value)} />
          <input style={campo} placeholder="Palabras de la marca (coma). Vacío = cualquiera" value={keywords} onChange={e => setKeywords(e.target.value)} />
          <label style={{ ...campo, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: archivo ? colores.textoClaro : colores.textoOscuro }}>
            <FileSpreadsheet size={16} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{archivo?.name ?? 'Elegir archivo .xlsx'}</span>
            <input type="file" accept=".xlsx" hidden onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
          </label>
          <button style={{ ...boton(true), opacity: subiendo ? 0.6 : 1 }} disabled={subiendo} onClick={subir}><Upload size={16} />{subiendo ? 'Subiendo…' : 'Subir'}</button>
        </div>
        {error && <p style={{ margin: '12px 0 0', color: COLOR.incumplido, fontSize: 13.5 }}>{error}</p>}
      </section>

      {/* 2. Confirmar */}
      {preview && (
        <section style={{ ...card, padding: m ? 16 : 22, borderColor: colores.primarioVivo }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <h2 style={titulo}>Confirma la pauta de {preview.marca}</h2>
              <p style={sub}>Del {fmtFecha(preview.desde, true)} al {fmtFecha(preview.hasta, true)} · {preview.keywords ? `palabras: ${preview.keywords}` : 'cualquier detección de la franja'}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={boton(false, COLOR.incumplido)} onClick={() => borrar(preview.lote_id)}><Trash2 size={15} />Descartar</button>
              <button style={boton(true, COLOR.cumplido)} onClick={activar}><Check size={16} />Activar pauta</button>
            </div>
          </div>
          <div style={{ ...grid('repeat(3, 1fr)'), margin: '16px 0' }}>
            {[[preview.estaciones.length, 'estaciones'], [preview.lineas?.length ?? 0, 'líneas de pauta'], [preview.total_requerido, 'apariciones requeridas']].map(([n, t]) => (
              <div key={t} style={{ padding: '12px 16px', borderRadius: 12, background: colores.fondoPrincipal }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: colores.textoClaro }}>{n}</div>
                <div style={{ fontSize: 12.5, color: colores.textoOscuro }}>{t}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {porEstacion.map(([est, ls]) => (
              <div key={est} style={{ padding: '12px 16px', borderRadius: 12, background: colores.fondoPrincipal }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: colores.textoClaro, marginBottom: 8 }}>{est}</div>
                {ls.map((l, i) => (
                  <details key={i} style={{ padding: '6px 0', borderTop: i ? `1px solid ${colores.borde}` : 'none' }}>
                    <summary style={{ cursor: 'pointer', fontSize: 13.5, color: colores.textoMedio }}>
                      <b style={{ color: colores.textoClaro }}>{l.horario_inicio}–{l.horario_fin}</b> · {l.dias} · {l.formato} · {l.programa}
                      <span style={{ float: 'right', color: colores.textoOscuro }}>{l.semanas.reduce((a, s) => a + s.requerido, 0)} en total</span>
                    </summary>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 0 2px' }}>
                      {l.semanas.map(s => <span key={s.semana} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 8, background: colores.fondoClaro, color: colores.textoMedio }}>{fmtFecha(s.semana)} · <b>{s.requerido}</b></span>)}
                    </div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Cumplimiento */}
      <section style={{ ...card, padding: m ? 16 : 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <h2 style={titulo}>Cumplimiento de pauta</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {activos.length > 1 && (
              <select style={{ ...campo, width: 'auto' }} value={loteSel} onChange={e => setLoteSel(e.target.value)}>
                <option value="">Todas las pautas</option>
                {activos.map(l => <option key={l.lote_id} value={l.lote_id}>{l.marca}</option>)}
              </select>
            )}
            <select style={{ ...campo, width: 'auto' }} value={semana} onChange={e => { setSemana(e.target.value); setAbierta(null); }}>
              {(cumpl?.semanas ?? []).map(s => <option key={s} value={s}>Semana del {fmtFecha(s, true)}</option>)}
            </select>
            <button style={boton()} onClick={cargarCumpl} title="Actualizar"><RefreshCw size={15} />{!m && 'Actualizar'}</button>
            {(loteSel || activos.length === 1) && <button style={boton(false, COLOR.incumplido)} onClick={() => borrar(loteSel || activos[0].lote_id)} title="Eliminar pauta"><Trash2 size={15} /></button>}
          </div>
        </div>

        {!cumpl || cumpl.semanas.length === 0 ? (
          <p style={{ padding: '36px 0', textAlign: 'center', color: colores.textoOscuro, fontSize: 14 }}>Aún no hay pautas activas. Sube un .xlsx y actívalo para ver aquí si se cumplió.</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', margin: '18px 0' }}>
              <Aro pct={pct} color={pct >= 100 ? COLOR.cumplido : pct >= 50 ? COLOR.parcial : COLOR.incumplido} />
              <div>
                <div style={{ fontSize: 15, color: colores.textoClaro, fontWeight: 600 }}>{cubierto} de {req} apariciones cubiertas esta semana</div>
                <div style={{ fontSize: 13, color: colores.textoOscuro, marginTop: 2 }}>{filasSemana.length} líneas de pauta</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: m ? 0 : 'auto' }}>
                {ESTADOS.map(e => (
                  <button key={e} onClick={() => setFiltro(f => (f === e ? '' : e))}
                    style={{ ...pill(COLOR[e]), cursor: 'pointer', border: `1px solid ${filtro === e ? COLOR[e] : 'transparent'}`, padding: '8px 14px', fontSize: 13 }}>
                    {conteo(e)} {ETIQUETA[e]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 14, alignItems: 'start' }}>
              {visibles.map(l => {
                const c = COLOR[l.estado], abre = abierta === l.id;
                return (
                  <article key={l.id} style={{ borderRadius: 14, background: colores.fondoPrincipal, borderLeft: `4px solid ${c}`, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: colores.textoClaro }}>{l.estacion}</div>
                        <div style={{ fontSize: 12.5, color: colores.textoOscuro, marginTop: 2 }}>{l.programa} · {l.formato}</div>
                      </div>
                      <span style={pill(c)}>{ETIQUETA[l.estado]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: colores.textoMedio, margin: '10px 0' }}>
                      <Clock size={14} />{l.horario_inicio}–{l.horario_fin} · {l.dias}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 30, fontWeight: 800, color: colores.textoClaro, lineHeight: 1 }}>{l.detectado}</span>
                      <span style={{ fontSize: 14, color: colores.textoOscuro }}>de {l.requerido} requeridos</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: colores.borde, overflow: 'hidden', margin: '10px 0 4px' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (l.detectado / l.requerido) * 100)}%`, background: c, borderRadius: 4 }} />
                    </div>
                    {l.detecciones.length > 0 && (
                      <>
                        <button onClick={() => setAbierta(abre ? null : l.id)}
                          style={{ ...boton(), width: '100%', marginTop: 10, padding: '8px 12px', fontSize: 13 }}>
                          {abre ? <ChevronUp size={15} /> : <ChevronDown size={15} />}{abre ? 'Ocultar evidencia' : `Ver evidencia (${l.detecciones.length})`}
                        </button>
                        {abre && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, maxHeight: 360, overflowY: 'auto' }}>
                            {l.detecciones.map(t => (
                              <div key={t.id} style={{ padding: 12, borderRadius: 10, background: colores.fondoClaro }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                                  <b style={{ color: colores.textoClaro }}>{fmtDiaHora(t.timestamp)}</b>
                                  <span style={{ color: colores.primarioVivo, fontWeight: 600 }}>{t.keyword_detectada}</span>
                                </div>
                                {t.transcripcion && <p style={{ margin: '6px 0 0', fontSize: 12.5, color: colores.textoMedio, lineHeight: 1.45 }}>«{t.transcripcion}»</p>}
                                <AudioTestigo t={t} />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
            {visibles.length === 0 && <p style={{ padding: '24px 0', textAlign: 'center', color: colores.textoOscuro, fontSize: 14 }}>Sin líneas con ese estado esta semana.</p>}
          </>
        )}
      </section>
    </div>
  );
};
