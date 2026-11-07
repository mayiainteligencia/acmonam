import { useEffect, useMemo, useState } from 'react';
import { Download, Filter, Maximize2, Play, Pause, Volume2 } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import { keyframes, useIsMobile, inner } from './shared/ui';
import { VideoThumb } from './shared/viz';
import { ACENTO, CARD, D, Btn, Filtro, GrupoLogo, Logo, Modulo, td, th } from './shared/dark';
import { FONDO_TECH } from '../config/tema';
import { CANALES, SPOTS_TV, ACCIONES_TV, CANALES_PROG, TESTIGOS_VIDEO, parrilla, rnd, PLAZAS, type Plaza, type TipoCanal, type SubtipoSpot } from '../data/medios';

const { colores } = brandingConfig;
const COL_TIPO: Record<TipoCanal, string> = { 'Abierta nacional': '#4D7C0F', 'Abierta local': '#DBF285', 'De paga': '#F58025' };
const ETIQ: [TipoCanal, string][] = [['Abierta nacional', 'Abierta Nacional'], ['Abierta local', 'Abierta Local'], ['De paga', 'Paga (SKY/DISH/Totalplay)']];
const ANUNCIANTE: Record<string, string> = { Aurora: 'Tiendas Aurora', Nuvo: 'Banco Nuvo', Valmar: 'Grupo Valmar', Nortia: 'Nortia Telecom', Vestia: 'Vestia Moda', Meridia: 'Grupo Meridia', Lumen: 'Lumen Salud', Cobalto: 'Cobalto Bebidas' };
const SUBTIPO_TXT: Record<SubtipoSpot, string> = { Regular: 'Spot Regular', Patrocinio: 'Patrocinio', 'Mención': 'Mención en Vivo', 'Super-imposición': 'Super-imposición (Overlay)' };
const HEADER_LOGOS: [string, TipoCanal, string[]][] = [
  ['TV Abierta Nacional', 'Abierta nacional', ['Las Estrellas', 'Canal 5', 'Azteca 7', 'Azteca 1', 'Once TV', 'N+ Foro']],
  ['TV Abierta Local', 'Abierta local', ['Canal 4 Local', 'Canal 6 GDL', 'Canal 7 Jalisco', 'Multimedios', 'Teleactiva', 'Milenio TV']],
  ['Tv de Paga', 'De paga', ['SKY', 'ESPN', 'Fox Sports', 'TNT', 'TUDN', 'Universal TV']],
];
const hhmm = (n: number) => `${String(n).padStart(2, '0')}:00`;

export const Television = () => {
  const m = useIsMobile();
  const [plaza, setPlaza] = useState<Plaza>('CDMX');
  const [tipo, setTipo] = useState<TipoCanal>('Abierta nacional');
  const [filtrarGrupo, setFiltrarGrupo] = useState(false);
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(40);
  const [vol, setVol] = useState(70);
  const [ahora, setAhora] = useState(() => new Date());

  // Los ítems del submenú lateral disparan este evento para ir a un módulo.
  useEffect(() => {
    const h = (e: Event) => setTimeout(() => document.getElementById((e as CustomEvent<string>).detail)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    window.addEventListener('seccion:goto', h);
    return () => window.removeEventListener('seccion:goto', h);
  }, []);
  useEffect(() => {
    const t = setInterval(() => { setAhora(new Date()); if (playing) setProg(p => (p >= 100 ? 0 : p + 1)); }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  const info = (canal: string) => CANALES.find(c => c.canal === canal);
  const ok = (canal: string) => { const c = info(canal); return !!c && c.tipo === tipo && (c.plaza === 'Las 3 plazas' || c.plaza === plaza); };
  const spots = useMemo(() => SPOTS_TV.filter(s => s.plaza === plaza && s.tipo === tipo), [plaza, tipo]);
  const acciones = ACCIONES_TV.map((a, i) => ({ ...a, i })).filter(a => ok(a.canal));
  const hora = ahora.getHours();
  const prog24 = CANALES_PROG.filter(ok).flatMap(c => {
    const bl = parrilla(CANALES_PROG.indexOf(c) * 5);
    const k = bl.findIndex(b => b.inicio <= hora && hora < b.fin);
    return bl.slice(Math.max(k, 0), Math.max(k, 0) + 2).map((b, j) => ({ c, b, vivo: j === 0 }));
  }).slice(0, 5);
  const clip = ACCIONES_TV[sel] ?? ACCIONES_TV[0];
  const seg = (h: string, i: number) => `${h}:${String(rnd(i, 60, 40)).padStart(2, '0')}`;
  const reloj = ahora.toLocaleTimeString('es-MX', { hour12: false });

  const exportar = () => {
    const filas = [['Hora', 'Canal', 'Plaza', 'Marca', 'Tipo', 'Subtipo', 'Duracion'], ...(filtrarGrupo ? spots : SPOTS_TV).map(s => [s.hora, s.canal, s.plaza, s.marca, s.tipo, s.subtipo, `${s.dur}s`])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([filas.map(f => f.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'spoteo-tv.csv'; a.click();
  };
  const verClip = (i: number) => { setSel(i); setPlaying(true); setProg(0); document.getElementById('tv-video')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const vacio = <div style={{ color: D.sub, fontSize: 13, padding: 14 }}>Sin datos para {plaza} · {ETIQ.find(e => e[0] === tipo)?.[1]}.</div>;

  return (
    <div style={{ minHeight: '100%', padding: m ? 16 : 30, ...FONDO_TECH }}><style>{keyframes}</style>
      <div style={inner}>
        {/* Cabecera */}
        <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', justifyContent: 'space-between', alignItems: m ? 'flex-start' : 'center', gap: 20, marginBottom: 22 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACENTO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monitoreo de Televisión – Tiempo Real</div>
            <h1 style={{ fontSize: m ? 26 : 34, fontWeight: 800, color: D.txt, margin: '6px 0 6px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Monitoreo de Televisión IA</h1>
            <p style={{ margin: 0, fontSize: 14, color: D.sub, maxWidth: 500, lineHeight: 1.5 }}>Verificación automática de pauta publicitaria, acciones especiales y programación 24/7 en vivo.</p>
          </div>
          <div style={{ background: CARD, border: `1px solid ${D.borde}`, borderRadius: 16, padding: '16px 20px', color: D.txt, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)', display: 'grid', gridTemplateColumns: m ? '1fr' : 'auto auto', gap: 20, alignItems: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: ACENTO }}>{CANALES.length}+</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Canales Activos</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {PLAZAS.map(p => <span key={p} style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${p === 'CDMX' ? 'rgba(219, 242, 133, 0.4)' : D.borde}`, background: p === 'CDMX' ? 'rgba(219, 242, 133, 0.16)' : 'rgba(255, 255, 255, 0.05)', color: p === 'CDMX' ? '#DBF285' : D.sub, fontWeight: 600, fontSize: 12.5 }}>{p}</span>)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
              {HEADER_LOGOS.map(([t, , lista]) => (
                <div key={t}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: D.sub, marginBottom: 6 }}>{t}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                    {lista.map(n => <GrupoLogo key={n} nombre={n} color={colores.primario} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '0.9fr 1.25fr', gap: 18, marginBottom: 18, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            {/* Módulo 1 */}
            <Modulo id="tv-vista" title="MÓDULO 1: Vista por Plaza y Tipo de TV (Filtros de control)">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>{PLAZAS.map(p => <Filtro key={p} on={plaza === p} onClick={() => setPlaza(p)}>{p === 'Guadalajara' ? 'GDL' : p === 'Monterrey' ? 'MTY' : p}</Filtro>)}</div>
              <div style={{ color: ACENTO, fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>{plaza === 'Guadalajara' ? 'GDL' : plaza === 'Monterrey' ? 'MTY' : plaza} - {ETIQ.find(e => e[0] === tipo)?.[1]}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{ETIQ.map(([t, l]) => <Filtro key={t} on={tipo === t} onClick={() => setTipo(t)}>{l}</Filtro>)}</div>
            </Modulo>

            {/* Módulo 3 */}
            <Modulo id="tv-acciones" title="MÓDULO 3: Acciones Especiales (con Miniatura de Evidencia)">
              {acciones.length === 0 ? vacio : acciones.slice(0, 3).map((a) => (
                <div key={a.i} style={{ display: 'flex', flexDirection: m ? 'column' : 'row', alignItems: m ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 14, padding: '12px 14px', marginBottom: 10, background: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${D.fila}`, borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: '150px' }}>
                    <Logo nombre={a.canal} color={COL_TIPO[tipo]} size={34} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{a.canal}</div>
                      <div style={{ fontSize: 11.5, color: D.sub }}>{seg(a.hora, a.i)}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <VideoThumb seed={a.i + 3} canal={a.accion} dur={a.dur} height={70} />
                    <div style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 500, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.accion} <span style={{ color: D.sub }}>({a.marca})</span></div>
                  </div>
                  <Btn onClick={() => verClip(a.i)}>Ver Clip</Btn>
                </div>
              ))}
            </Modulo>
          </div>

          {/* Módulo 2 */}
          <Modulo id="tv-spoteo" title="MÓDULO 2: Spoteo Publicitario (Automatizado por Canal)" right={<>
            <Btn onClick={exportar}><Download size={14} /> Exportar CSV</Btn>
            <Btn active={filtrarGrupo} onClick={() => setFiltrarGrupo(v => !v)}><Filter size={14} /> Filtrar por grupo</Btn></>}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Hora', 'Canal', 'Marca / Anunciante', 'Tipo', 'Subtipo', 'Duración'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>{(filtrarGrupo ? spots : SPOTS_TV.filter(s => s.plaza === plaza)).slice(0, 5).map((s, i) => (
                  <tr key={i} style={{ background: i === 0 ? 'rgba(219, 242, 133, 0.08)' : undefined }}>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{seg(s.hora, i)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Logo nombre={s.canal} color={COL_TIPO[s.tipo]} size={32} />
                        <span>{s.canal}<div style={{ color: D.sub, fontSize: 11.5 }}>({s.plaza === 'Guadalajara' ? 'GDL' : s.plaza === 'Monterrey' ? 'MTY' : 'CDMX'})</div></span>
                      </div>
                    </td>
                    <td style={{ ...td, fontWeight: 500, color: '#FFFFFF' }}>{ANUNCIANTE[s.marca]}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>Publicidad</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{SUBTIPO_TXT[s.subtipo]}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{s.dur}s</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {spots.length === 0 && filtrarGrupo && vacio}
          </Modulo>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: 16 }}>
          {/* Módulo 4 */}
          <Modulo id="tv-prog" title="MÓDULO 4: Programación 24/7 (Log Completo de Transmisión)" right={<span style={{ fontSize: 13, color: D.sub }}>{reloj}</span>}>
            {prog24.length === 0 ? vacio : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Hora', 'Canal', 'Programa / Contenido', 'Género', 'Estatus'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{prog24.map(({ c, b, vivo }, i) => (
                <tr key={i}><td style={td}>{hhmm(b.inicio)} - {hhmm(b.fin % 24)}</td><td style={td}>{c}</td><td style={td}>{b.programa}</td><td style={td}>{b.genero}</td>
                  <td style={td}>{vivo ? <span style={{ background: 'linear-gradient(135deg, #729013, #5B7410)', color: '#fff', fontWeight: 700, fontSize: 11.5, padding: '4px 10px', borderRadius: 6, boxShadow: '0 2px 6px rgba(114, 144, 19, 0.25)' }}>En vivo</span> : b.condicion}</td></tr>
              ))}</tbody></table></div>}
          </Modulo>

          {/* Módulo 5 */}
          <Modulo id="tv-video" title="MÓDULO 5: Testigos de Video (Reproductor Multimedia)">
            <div style={{ fontSize: 13, color: D.sub, marginBottom: 8 }}>Reproduciendo: <span style={{ color: D.txt, fontWeight: 600 }}>Acción Especial - {clip.accion} ({clip.canal}) - {seg(clip.hora, sel)}</span></div>
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${D.borde}`, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)' }}>
              <VideoThumb seed={sel + 3} canal={clip.canal} dur={clip.dur} height={m ? 150 : 190} />
              <button onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pausar' : 'Reproducir'} style={{ position: 'absolute', inset: 0, margin: 'auto', width: 52, height: 52, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                {playing ? <Pause size={22} color="#0A170E" fill="#0A170E" /> : <Play size={22} color="#0A170E" fill="#0A170E" />}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
              <button onClick={() => setPlaying(p => !p)} aria-label="Reproducir/Pausar" style={{ background: 'none', border: 'none', color: D.txt, cursor: 'pointer', display: 'flex' }}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
              <input type="range" min={0} max={100} value={prog} onChange={e => setProg(+e.target.value)} style={{ flex: 1, accentColor: ACENTO, minWidth: 0 }} />
              <Volume2 size={16} color={D.sub} /><input type="range" min={0} max={100} value={vol} onChange={e => setVol(+e.target.value)} style={{ width: 56, accentColor: ACENTO }} />
              <Maximize2 size={16} color={D.sub} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Btn><Download size={14} /> Descargar Clip (.mp4)</Btn>
              <span style={{ fontSize: 12.5, color: D.sub }}>Histórico de 3 meses disponible · {TESTIGOS_VIDEO.length} clips</span>
            </div>
          </Modulo>
        </div>
      </div>
    </div>
  );
};
