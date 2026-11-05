// src/components/AnalisisPauta.tsx
// Carga una pauta (.xlsx), la previsualiza, la activa y muestra su cumplimiento contra los testigos.
// Aislado: solo usa /api/monitor/pauta/*.
import { useCallback, useEffect, useState } from 'react';
import { Upload, Check, Trash2, RefreshCw } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import { useIsMobile } from './shared/ui';

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
  dias: string; programa: string; formato: string; semana: string; requerido: number; detectado: number; estado: Estado;
}
interface Cumpl { lineas: LineaCumpl[]; resumen: Record<Estado, number>; semanas: string[] }

const COLOR: Record<Estado, string> = { cumplido: '#16A34A', parcial: '#D97706', incumplido: '#DC2626', sin_datos: '#6B7280' };
const ETIQUETA: Record<Estado, string> = { cumplido: 'Cumplido', parcial: 'Parcial', incumplido: 'Incumplido', sin_datos: 'Sin datos aún' };

const fmtFecha = (iso: string, anio = false) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', ...(anio && { year: 'numeric' }) });

// semana por defecto: la mas reciente que ya empezo
const semanaDefault = (semanas: string[]) => {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  return [...semanas].reverse().find(s => s <= hoy) ?? semanas[0] ?? '';
};

const card: React.CSSProperties = { background: colores.fondoClaro, borderRadius: 16, border: `1px solid ${colores.borde}`, boxShadow: colores.sombra };
const input: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: `1px solid ${colores.borde}`, background: colores.fondoSecundario, color: colores.textoClaro, fontSize: 13, minWidth: 0 };
const boton = (primario = false, color?: string): React.CSSProperties => ({
  padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
  border: `1px solid ${color ?? (primario ? colores.primarioVivo : colores.borde)}`,
  background: primario ? (color ?? colores.primarioVivo) : colores.fondoSecundario, color: primario ? '#fff' : (color ?? colores.textoMedio),
});
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11.5, fontWeight: 700, color: colores.textoMedio, textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { color: colores.textoMedio, padding: '10px 12px', fontSize: 13, borderTop: `1px solid ${colores.borde}`, verticalAlign: 'middle' };

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
  const [cargando, setCargando] = useState(false);

  const cargarLotes = useCallback(async () => {
    try {
      const r = await fetch(`${API}/lotes`);
      if (r.ok) setLotes(await r.json());
    } catch { /* monitor apagado: se muestra vacío */ }
  }, []);

  const cargarCumpl = useCallback(async () => {
    setCargando(true);
    try {
      const q = new URLSearchParams();
      if (loteSel) q.set('lote_id', loteSel);
      const r = await fetch(`${API}/cumplimiento?${q}`);
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail);
      const d: Cumpl = await r.json();
      setCumpl(d);
      setSemana(s => (s && d.semanas.includes(s) ? s : semanaDefault(d.semanas)));
      setError('');
    } catch (e) { setError((e instanceof Error && e.message) || 'No se pudo consultar el cumplimiento. ¿Está corriendo el monitor (:8001)?'); }
    setCargando(false);
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
    if (!archivo || !marca.trim()) return setError('Indica la marca y selecciona el archivo .xlsx.');
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
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (preview?.lote_id === id) setPreview(null);
    if (loteSel === id) setLoteSel('');
    await cargarLotes(); cargarCumpl();
  };

  const filas = (cumpl?.lineas ?? []).filter(l => l.semana === semana);
  const resumen = (['cumplido', 'parcial', 'incumplido', 'sin_datos'] as Estado[]).map(e => [e, filas.filter(l => l.estado === e).length] as const);
  const activos = lotes.filter(l => l.activa);

  return (
    <div style={{ padding: m ? '16px' : '24px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Subir */}
      <div style={{ ...card, padding: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: colores.textoClaro, marginBottom: 4 }}>Cargar pauta</div>
        <div style={{ fontSize: 12.5, color: colores.textoMedio, marginBottom: 14 }}>
          Sube el .xlsx de pauta (hoja «Radio»). Verás un resumen para confirmar antes de activarla.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1.4fr 1.4fr auto', gap: 10, alignItems: 'center' }}>
          <input style={input} placeholder="Marca / cliente" value={marca} onChange={e => setMarca(e.target.value)} />
          <input style={input} placeholder="Keywords de la marca (coma). Vacío = cualquiera" value={keywords} onChange={e => setKeywords(e.target.value)} />
          <input style={input} type="file" accept=".xlsx" onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
          <button style={{ ...boton(true), opacity: subiendo ? 0.6 : 1 }} disabled={subiendo} onClick={subir}><Upload size={15} />{subiendo ? 'Subiendo…' : 'Subir'}</button>
        </div>
        {error && <div style={{ marginTop: 10, color: COLOR.incumplido, fontSize: 13 }}>{error}</div>}
      </div>

      {/* Preview / confirmación */}
      {preview && (
        <div style={{ ...card, padding: 20, borderColor: colores.primarioVivo }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colores.textoClaro }}>Confirmar pauta · {preview.marca}</div>
              <div style={{ fontSize: 12.5, color: colores.textoMedio }}>
                {preview.lineas?.length ?? 0} líneas · {preview.filas} semanas-línea · {preview.total_requerido} apariciones requeridas · {fmtFecha(preview.desde, true)} → {fmtFecha(preview.hasta, true)}
              </div>
              <div style={{ fontSize: 12.5, color: colores.textoMedio }}>Estaciones: {preview.estaciones.join(' · ')}</div>
              <div style={{ fontSize: 12.5, color: colores.textoMedio }}>{preview.keywords ? `Keywords: ${preview.keywords}` : 'Sin keywords: se contarán todas las detecciones de la franja.'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={boton(false, COLOR.incumplido)} onClick={() => borrar(preview.lote_id)}><Trash2 size={15} />Descartar</button>
              <button style={boton(true, COLOR.cumplido)} onClick={activar}><Check size={15} />Activar pauta</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Estación</th><th style={th}>Horario</th><th style={th}>Días</th><th style={th}>Formato</th><th style={th}>Requerido por semana</th></tr></thead>
              <tbody>
                {preview.lineas?.map((l, i) => (
                  <tr key={i}>
                    <td style={td}><b style={{ color: colores.textoClaro }}>{l.estacion}</b><div style={{ fontSize: 11.5, color: colores.textoMedio }}>{l.programa}</div></td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{l.horario_inicio}–{l.horario_fin}</td>
                    <td style={td}>{l.dias}</td>
                    <td style={td}>{l.formato}</td>
                    <td style={td}>
                      <div style={{ fontSize: 12, color: colores.textoMedio, marginBottom: 4 }}>
                        «{preview.marca} debe {l.formato === 'Mención' ? 'mencionarse' : 'sonar'} {l.semanas.reduce((a, s) => a + s.requerido, 0)} veces entre {l.horario_inicio} y {l.horario_fin}, {l.dias}»
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {l.semanas.map(s => <span key={s.semana} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: colores.fondoSecundario, border: `1px solid ${colores.borde}`, color: colores.textoMedio }}>{fmtFecha(s.semana)}: <b>{s.requerido}</b></span>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dashboard de cumplimiento */}
      <div style={{ ...card, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: colores.textoClaro }}>Cumplimiento de pauta</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select style={input} value={loteSel} onChange={e => setLoteSel(e.target.value)}>
              <option value="">Todas las pautas activas</option>
              {activos.map(l => <option key={l.lote_id} value={l.lote_id}>{l.marca} · {fmtFecha(l.desde)}–{fmtFecha(l.hasta)}</option>)}
            </select>
            <select style={input} value={semana} onChange={e => setSemana(e.target.value)}>
              {(cumpl?.semanas ?? []).map(s => <option key={s} value={s}>Semana del {fmtFecha(s, true)}</option>)}
            </select>
            <button style={boton()} onClick={cargarCumpl}><RefreshCw size={14} />Actualizar</button>
            {loteSel && <button style={boton(false, COLOR.incumplido)} onClick={() => borrar(loteSel)}><Trash2 size={14} />Eliminar pauta</button>}
          </div>
        </div>

        {!cumpl || cumpl.semanas.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: colores.textoMedio, fontSize: 13 }}>No hay pautas activas. Sube un .xlsx y actívalo para ver el cumplimiento.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
              {resumen.map(([e, n]) => (
                <div key={e} style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${COLOR[e]}55`, background: `${COLOR[e]}14` }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: COLOR[e] }}>{n}</div>
                  <div style={{ fontSize: 12, color: colores.textoMedio }}>{ETIQUETA[e]}</div>
                </div>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Marca</th><th style={th}>Estación</th><th style={th}>Horario</th><th style={th}>Formato</th><th style={th}>Requerido</th><th style={th}>Detectado</th><th style={th}>Avance</th><th style={th}>Estado</th></tr></thead>
                <tbody>
                  {filas.map(l => (
                    <tr key={l.id}>
                      <td style={{ ...td, color: colores.textoClaro }}>{l.marca}</td>
                      <td style={td}><b style={{ color: colores.textoClaro }}>{l.estacion}</b><div style={{ fontSize: 11.5, color: colores.textoMedio }}>{l.programa}</div></td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{l.horario_inicio}–{l.horario_fin} · {l.dias}</td>
                      <td style={td}>{l.formato}</td>
                      <td style={td}>{l.requerido}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{l.detectado}</td>
                      <td style={{ ...td, minWidth: 90 }}>
                        <div style={{ height: 6, borderRadius: 3, background: colores.borde, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, (l.detectado / l.requerido) * 100)}%`, background: COLOR[l.estado] }} />
                        </div>
                      </td>
                      <td style={td}><span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, color: COLOR[l.estado], background: `${COLOR[l.estado]}1F`, whiteSpace: 'nowrap' }}>{ETIQUETA[l.estado]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
