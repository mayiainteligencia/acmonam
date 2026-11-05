import { useEffect, useMemo, useState } from 'react';
import { Download, Filter, Pause, Play, RefreshCw, SkipForward, Volume2, Radio as RadioIcon } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import { keyframes, Tabs, useIsMobile, inner } from './shared/ui';
import { Waveform } from './shared/viz';
import { ACENTO, CARD, D, Btn, GrupoLogo, Logo, Modulo, selDark, td, th } from './shared/dark';
import { FONDO_TECH } from '../config/tema';
import { TestigosIA } from './TestigosIA';
import { ESTACIONES, SPOTS_RADIO, GRUPOS_RADIO, colorGrupo, rnd, PLAZAS, type SpotRadio, type TipoRadio } from '../data/medios';

const { colores } = brandingConfig;
const ANUNCIANTE: Record<string, string> = { Aurora: 'Tiendas Aurora', Nuvo: 'Banco Nuvo', Valmar: 'Grupo Valmar', Nortia: 'Nortia Telecom', Vestia: 'Vestia Moda', Meridia: 'Grupo Meridia', Lumen: 'Lumen Salud', Cobalto: 'Cobalto Bebidas' };
const COL_TIPO: Record<TipoRadio, string> = { 'Spot Regular': ACENTO, Patrocinio: '#3B82F6', Autopromocional: '#F59E0B' };
const VISTAS = ['Panel de radio', 'Testigos IA · en vivo (real)'];
const Etiqueta = ({ tipo }: { tipo: TipoRadio }) => (
  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 7, color: tipo === 'Spot Regular' ? D.txt : '#fff', background: tipo === 'Spot Regular' ? 'transparent' : COL_TIPO[tipo] }}>{tipo}</span>
);

const seg = (s: SpotRadio, i: number) => `${s.hora}:${String(rnd(i, 60, 30)).padStart(2, '0')}`;
const infoEst = (s: SpotRadio) => ESTACIONES.find(e => `${e.nombre} ${e.dial}` === s.estacion);
const contar = (rows: SpotRadio[], k: 'marca' | 'categoria') => {
  const c: Record<string, number> = {};
  rows.forEach(s => { c[s[k]] = (c[s[k]] ?? 0) + 1 + rnd(s.dur, 20); });
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
};

export const Radio = () => {
  const m = useIsMobile();
  const [vista, setVista] = useState(VISTAS[0]);
  const [rot, setRot] = useState(0);
  const [grupo, setGrupo] = useState('Todos');
  const [csvGrupo, setCsvGrupo] = useState(false);
  const [menciones, setMenciones] = useState<TipoRadio[]>(['Patrocinio', 'Autopromocional']);
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [prog, setProg] = useState(34);
  const [vol, setVol] = useState(70);
  const [rGrupo, setRGrupo] = useState('Todos');

  // Los ítems del submenú lateral disparan este evento para ir a un módulo.
  useEffect(() => {
    const h = (e: Event) => {
      setVista(VISTAS[0]);
      const id = (e as CustomEvent<string>).detail;
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    };
    window.addEventListener('seccion:goto', h);
    return () => window.removeEventListener('seccion:goto', h);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProg(p => (p >= 100 ? 0 : p + 1)), 400);
    return () => clearInterval(t);
  }, [playing]);

  const activas = ESTACIONES.filter(e => e.activa);
  const vivo = useMemo(() => {
    const dest = ['Radio Fórmula|103.3 FM', 'W Radio|96.9 FM', 'Los 40|101.7 FM', 'La Mejor|97.7 FM', 'La Mejor GDL|93.9 FM', 'Exa FM|104.9 FM', 'Amor|95.3 FM', 'Los 40 GDL|88.7 FM'];
    return dest.map(d => ESTACIONES.find(e => `${e.nombre}|${e.dial}` === d && e.activa)).filter(Boolean).slice(0, 4).map((e, i) => ({ e: e!, i: i + rot }));
  }, [rot]);
  const regulares = SPOTS_RADIO.filter(s => s.tipo === 'Spot Regular' && (grupo === 'Todos' || s.grupo === grupo));
  const especiales = SPOTS_RADIO.filter(s => s.tipo !== 'Spot Regular' && menciones.includes(s.tipo));
  const audios = SPOTS_RADIO.slice(0, 6);
  const actual = audios[sel];
  const rRows = SPOTS_RADIO.filter(s => rGrupo === 'Todos' || s.grupo === rGrupo);
  const topMarcas = contar(rRows, 'marca').slice(0, 3);
  const topCats = contar(rRows, 'categoria').slice(0, 3);

  const exportar = () => {
    const filas = [['Hora', 'Estacion', 'Plaza', 'Marca', 'Categoria', 'Duracion', 'Tipo'], ...(csvGrupo ? regulares : SPOTS_RADIO).map(s => [s.hora, s.estacion, s.plaza, s.marca, s.categoria, `${s.dur}s`, s.tipo])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([filas.map(f => f.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'spots-radio.csv'; a.click();
  };
  const g2 = { display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1.15fr', gap: 18, marginBottom: 18 } as const;
  const g3 = { display: 'grid', gridTemplateColumns: m ? '1fr' : '1.15fr 1fr', gap: 18, marginBottom: 18 } as const;

  return (
    <div style={{ minHeight: '100%', padding: m ? 16 : 30, ...FONDO_TECH }}><style>{keyframes}</style>
      <div style={inner}>
        {/* Cabecera */}
        <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', justifyContent: 'space-between', alignItems: m ? 'flex-start' : 'center', gap: 20, marginBottom: 22 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACENTO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monitoreo de Radio – Cobertura Nacional</div>
            <h1 style={{ fontSize: m ? 26 : 34, fontWeight: 800, color: D.txt, margin: '6px 0 6px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Monitoreo de Radio IA</h1>
            <p style={{ margin: 0, fontSize: 14, color: D.sub, maxWidth: 520, lineHeight: 1.5 }}>Verificación automática de marcas, spots, patrocinios y autopromocionales en tiempo real.</p>
          </div>
          <div style={{ background: CARD, border: `1px solid ${D.borde}`, borderRadius: 16, padding: '16px 20px', color: D.txt, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)', display: 'grid', gridTemplateColumns: m ? '1fr' : 'auto auto', gap: 20, alignItems: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: ACENTO }}>{ESTACIONES.length}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Estaciones AM/FM</span>
              </div>
              <div style={{ fontSize: 12.5, color: D.sub, margin: '2px 0 10px' }}>{activas.length} al aire ahora</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{PLAZAS.map(p => <span key={p} style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid rgba(56, 189, 248, 0.3)`, background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 600, fontSize: 12.5 }}>{p}</span>)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, minWidth: '260px' }}>
              {GRUPOS_RADIO.concat([{ id: 'Más', color: '#6B7280' }]).slice(0, 12).map(gr => <GrupoLogo key={gr.id} nombre={gr.id} color={gr.color} />)}
            </div>
          </div>
        </div>

        <Tabs tabs={VISTAS} active={vista} onChange={setVista} />

        {vista === VISTAS[1] ? <div style={{ margin: m ? '0 -16px' : '0 -30px', borderRadius: 16, overflow: 'hidden', background: colores.fondoPrincipal }}><TestigosIA /></div> : <>
          <div style={g2}>
            {/* Monitoreo en vivo */}
            <Modulo id="radio-vivo" title="Monitoreo en Vivo (Estaciones Activas)" right={<>
              <Btn onClick={() => setRot(r => r + 1)}><RefreshCw size={14} /></Btn>
              <Btn onClick={() => setVista(VISTAS[1])}><RadioIcon size={14} /> Abrir Testigos IA</Btn></>}>
              {vivo.map(({ e, i }) => (
                <div key={e.nombre + e.dial} style={{ display: 'flex', flexDirection: m ? 'column' : 'row', alignItems: m ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', marginBottom: 8, background: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${D.fila}`, borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: m ? '100%' : '170px' }}>
                    <Logo nombre={e.nombre} color={colorGrupo(e.grupo)} size={34} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#FFFFFF' }}>{e.nombre}</div>
                      <div style={{ fontSize: 11.5, color: D.sub }}>{e.dial} · {e.plaza === 'Guadalajara' ? 'GDL' : e.plaza === 'Monterrey' ? 'MTY' : 'CDMX'}</div>
                    </div>
                  </div>
                  {!m && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: '#DC2626', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>● EN VIVO</span>
                      <div style={{ flex: 1 }}><Waveform seed={i * 3 + 1} color={ACENTO} bars={20} height={24} /></div>
                    </div>
                  )}
                  <div style={{ textAlign: m ? 'left' : 'right', minWidth: '150px' }}>
                    <div style={{ fontSize: 11, color: D.sub }}>Última detección</div>
                    <div style={{ color: D.txt, fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' }}>Hace {8 + rnd(i, 50, 31)}s · <span style={{ color: ACENTO }}>{SPOTS_RADIO[(i * 3) % SPOTS_RADIO.length].marca}</span></div>
                  </div>
                </div>
              ))}
            </Modulo>

            {/* Spots detectados */}
            <Modulo id="radio-spots" title="Spots Detectados (Monitoreo Automático)" right={<>
              <Btn onClick={exportar}><Download size={14} /> Exportar CSV</Btn>
              <Btn active={csvGrupo} onClick={() => setCsvGrupo(v => !v)}><Filter size={14} /> Filtrar por grupo</Btn>
              {csvGrupo && <select style={selDark} value={grupo} onChange={e => setGrupo(e.target.value)}>{['Todos', ...GRUPOS_RADIO.map(x => x.id)].map(x => <option key={x}>{x}</option>)}</select>}</>}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Hora', 'Estación', 'Marca / Anunciante', 'Categoría', 'Duración', 'Tipo'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>{regulares.slice(0, 5).map((s, i) => (
                    <tr key={i}>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{seg(s, i)}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Logo nombre={infoEst(s)?.nombre ?? s.estacion} color={colorGrupo(s.grupo)} size={32} />
                          <span>{s.estacion}<div style={{ color: D.sub, fontSize: 11.5 }}>{s.plaza}</div></span>
                        </div>
                      </td>
                      <td style={{ ...td, color: '#FFFFFF', fontWeight: 500 }}>{s.marca} <span style={{ color: D.sub, fontWeight: 400 }}>({ANUNCIANTE[s.marca]})</span></td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{s.categoria}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{s.dur}s</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}><Etiqueta tipo={s.tipo} /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {regulares.length === 0 && <div style={{ color: D.sub, fontSize: 13, padding: 12 }}>Sin spots para ese grupo.</div>}
            </Modulo>
          </div>

          <div style={g3}>
            {/* Módulo 3 */}
            <Modulo id="radio-patro" title="MÓDULO 3: Patrocinios y Autopromocionales">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', fontSize: 13 }}>Menciones:
                {(['Patrocinio', 'Autopromocional'] as TipoRadio[]).map(t => {
                  const on = menciones.includes(t);
                  return <button key={t} onClick={() => setMenciones(v => on ? v.filter(x => x !== t) : [...v, t])} style={{ border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: '#fff', background: COL_TIPO[t], opacity: on ? 1 : .35, padding: '5px 12px', borderRadius: 7 }}>{t}</button>;
                })}</div>
              <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Hora', 'Estación', 'Marca / Anunciante', 'Categoría', 'Duración'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>{especiales.slice(0, 3).map((s, i) => (
                  <tr key={i}><td style={td}>{seg(s, i)}</td><td style={td}>{s.estacion}</td>
                    <td style={td}>{s.tipo} - {s.marca} {s.tipo === 'Patrocinio' ? 'presenta la hora' : 'Próximo programa'}<div style={{ marginTop: 4 }}><Etiqueta tipo={s.tipo} /></div></td>
                    <td style={td}>{s.categoria}</td><td style={td}>{s.dur}s</td></tr>
                ))}</tbody></table></div>
            </Modulo>

            {/* Módulo 4 */}
            <Modulo id="radio-audio" title="MÓDULO 4: Testigos de Audio (Reproductor + Histórico)">
              <div style={{ fontSize: 13, color: D.sub, marginBottom: 8 }}>Reproduciendo: <span style={{ color: D.txt, fontWeight: 600 }}>Spot - {actual.marca} ({actual.estacion}) - {seg(actual, sel)}</span></div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${D.fila}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <Waveform seed={sel + 60} color={ACENTO} bars={70} height={64} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                <button onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pausar' : 'Reproducir'} style={{ width: 42, height: 42, borderRadius: '50%', border: `1px solid ${ACENTO}`, background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
                <button onClick={() => { setSel(s => (s + 1) % audios.length); setProg(0); }} aria-label="Siguiente" style={{ background: 'none', border: 'none', color: D.txt, cursor: 'pointer' }}><SkipForward size={18} /></button>
                <input type="range" min={0} max={100} value={prog} onChange={e => setProg(+e.target.value)} style={{ flex: 1, accentColor: ACENTO, minWidth: 0 }} />
                <Volume2 size={17} color={D.sub} /><input type="range" min={0} max={100} value={vol} onChange={e => setVol(+e.target.value)} style={{ width: 60, accentColor: ACENTO }} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}><Btn><Download size={14} /> Descargar Audio (.mp3)</Btn><Btn>Ver Histórico de Audio</Btn></div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Audios recientes listos para reproducir</div>
              {audios.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => { setSel(i); setPlaying(true); setProg(0); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', background: 'none', border: 'none', borderTop: `1px solid ${D.fila}`, color: i === sel ? ACENTO : D.txt, fontWeight: i === sel ? 700 : 500, fontSize: 12.5, cursor: 'pointer', textAlign: 'left' }}>
                  <Play size={12} fill="currentColor" /> Spot - {s.marca} ({s.estacion}) - {seg(s, i)}</button>
              ))}
            </Modulo>

            {/* Módulo 5 */}
            <Modulo id="radio-ranking" title="MÓDULO 5: Ranking de Anunciantes y Categorías" style={{ gridColumn: m ? undefined : '1 / -1' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', fontSize: 13 }}>Grupo:
                <select style={selDark} value={rGrupo} onChange={e => setRGrupo(e.target.value)}>{['Todos', ...GRUPOS_RADIO.map(x => x.id)].map(x => <option key={x}>{x}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14 }}>
                <div><div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Top Anunciantes (Hoy)</div>
                  {topMarcas.map(([n, v], i) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, fontSize: 12.5 }}>
                      <span style={{ fontWeight: 600, color: D.sub }}>{i + 1}.</span>
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${v / topMarcas[0][1] * 100}%`, background: 'linear-gradient(90deg, #0284C7, #38BDF8)', borderRadius: 6, padding: '4px 8px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{n}</div></div>
                      <b style={{ color: D.txt }}>{v}</b>
                    </div>
                  ))}</div>
                <div><div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Top Categorías</div>
                  {topCats.map(([n, v], i) => (
                    <div key={n} style={{ marginBottom: 8, fontSize: 12.5 }}>{i + 1}. {n}
                      <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, marginTop: 4 }}><div style={{ width: `${v / topCats[0][1] * 100}%`, height: '100%', background: ACENTO, borderRadius: 2 }} /></div></div>
                  ))}</div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5 }}>Filtros: {['Radio Fórmula', 'Grupo ACIR', 'Estación'].map(f => <span key={f} onClick={() => f !== 'Estación' && setRGrupo(f)} style={{ display: 'inline-block', margin: '4px 6px 0 0', padding: '5px 12px', borderRadius: 8, border: `1px solid ${rGrupo === f ? ACENTO : D.borde}`, background: rGrupo === f ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)', color: rGrupo === f ? '#38BDF8' : D.txt, fontWeight: rGrupo === f ? 700 : 500, cursor: 'pointer' }}>{f}</span>)}</div>
            </Modulo>
          </div>
        </>}
      </div>
    </div>
  );
};
