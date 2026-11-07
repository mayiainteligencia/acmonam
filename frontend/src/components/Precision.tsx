import { Area, Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import { keyframes, useIsMobile, inner } from './shared/ui';
import { ACENTO, CARD, D, Btn, Modulo, td, th } from './shared/dark';
import { PRECISION, META_PRECISION, rnd, fmt } from '../data/medios';
import { FONDO_TECH } from '../config/tema';

const { colores } = brandingConfig;

const TEXTO: Record<string, [string, string]> = {
  radio: ['147 Estaciones AM/FM CDMX, GDL y MTY', 'Detecciones exitosas vs. auditoría humana'],
  tv: ['100+ Canales Abiertos y de Paga', 'Spoteo y programación 24/7 sin errores críticos'],
  impresos: ['70 Periódicos, Revistas y Especiales', 'Inserciones y tarifas sin discrepancias'],
};
const BITACORA = [
  { f: '16-10-2026 16:20', medio: 'Radio', canal: 'Radio Fórmula 103.3 FM', ia: 'Spot Aurora (20s)', hum: 'Confirmado: Spot Aurora (20s)', res: 'Correcto (100%)' },
  { f: '16-10-2026 15:55', medio: 'Televisión', canal: 'Las Estrellas', ia: 'Mención en Vivo - Nortia', hum: 'Confirmado: Mención en Vivo - Nortia', res: 'Correcto (100%)' },
  { f: '16-10-2026 14:30', medio: 'Impresos', canal: 'El Universal', ia: 'Inserción Nuvo (1/2 Plana, Color)', hum: 'Confirmado: Inserción Nuvo (1/2 Plana, Color)', res: 'Correcto (100%)' },
  { f: '16-10-2026 12:15', medio: 'Radio', canal: 'Los 40 101.7 FM', ia: 'Autopromocional (30s)', hum: 'Ajuste: Duración real 28s', res: 'Ajustado (Falso Positivo corregido)' },
  { f: '16-10-2026 11:40', medio: 'Televisión', canal: 'Azteca 7', ia: 'Super-imposición Valmar (10s)', hum: 'Confirmado: Super-imposición Valmar (10s)', res: 'Correcto (100%)' },
  { f: '16-10-2026 10:05', medio: 'Impresos', canal: 'Forbes México', ia: 'Inserción Vestia (Plana Entera, Color)', hum: 'Confirmado: Inserción Vestia (Plana Entera)', res: 'Correcto (100%)' },
];
// Serie diaria de precisión ponderada (30 días), estable entre cargas.
const DIAS = Array.from({ length: 30 }, (_, i) => ({ d: `${String(i + 1).padStart(2, '0')}/10`, v: +(97.4 + rnd(i, 14, 50) / 10 - 0.3).toFixed(1) }));

// Medidor semicircular grande con el valor al centro.
const pt = (pct: number, r: number) => { const a = Math.PI * (1 - pct / 100); return [130 + r * Math.cos(a), 130 - r * Math.sin(a)]; };
const Medidor = ({ value, ok, id }: { value: number; ok: boolean; id: string }) => {
  const R = 100, C = Math.PI * R, col = ok ? ACENTO : colores.advertencia;
  const g = `g-${id}`;
  const [ex, ey] = pt(value, R);
  const [m1x, m1y] = pt(META_PRECISION, R + 11), [m2x, m2y] = pt(META_PRECISION, R - 11);
  return (
    <svg viewBox="0 0 260 150" style={{ width: '100%', maxWidth: 235 }}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ok ? '#729013' : '#B45309'} />
          <stop offset="100%" stopColor={ok ? '#DBF285' : '#FBBF24'} />
        </linearGradient>
        <filter id={`${g}-glow`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
        <radialGradient id={`${g}-bg`} cx="50%" cy="100%" r="70%"><stop offset="0%" stopColor={col} stopOpacity=".16" /><stop offset="100%" stopColor={col} stopOpacity="0" /></radialGradient>
      </defs>
      <path d="M40 130 A90 90 0 0 1 220 130 Z" fill={`url(#${g}-bg)`} />
      {/* Marcas de escala */}
      {Array.from({ length: 41 }, (_, i) => { const big = i % 5 === 0; const [x1, y1] = pt(i * 2.5, R - 13), [x2, y2] = pt(i * 2.5, R - (big ? 23 : 19)); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i * 2.5 <= value ? col : 'rgba(255, 255, 255, 0.14)'} strokeOpacity={i * 2.5 <= value ? .9 : 1} strokeWidth={big ? 1.6 : 1} />; })}
      <path d="M30 130 A100 100 0 0 1 230 130" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth={11} strokeLinecap="round" />
      <path d="M30 130 A100 100 0 0 1 230 130" fill="none" stroke={col} strokeOpacity={.4} strokeWidth={11} strokeLinecap="round" strokeDasharray={`${C * value / 100} ${C}`} filter={`url(#${g}-glow)`} />
      <path d="M30 130 A100 100 0 0 1 230 130" fill="none" stroke={`url(#${g})`} strokeWidth={11} strokeLinecap="round" strokeDasharray={`${C * value / 100} ${C}`} />
      <circle cx={ex} cy={ey} r={6.5} fill="#729013" stroke="#fff" strokeWidth={2.5} />
      {/* Marcador de meta contractual */}
      <line x1={m1x} y1={m1y} x2={m2x} y2={m2y} stroke="#EF4444" strokeWidth={1.8} strokeDasharray="2 2" opacity={.9} />
      <text x={24} y={146} fontSize={10} fill="#9CA3AF" fontWeight={600}>0</text>
      <text x={236} y={146} fontSize={10} textAnchor="end" fill="#9CA3AF" fontWeight={600}>100</text>
      <text x={130} y={100} textAnchor="middle" fontSize={40} fontWeight={800} fill={col} style={{ letterSpacing: '-1px' }}>{value}%</text>
      <text x={130} y={122} textAnchor="middle" fontSize={13} fontWeight={600} fill="#D1D5DB">de Precisión</text>
    </svg>
  );
};

export const Precision = () => {
  const m = useIsMobile();
  const cumple = PRECISION.every(p => p.actual >= META_PRECISION);
  const muestras = PRECISION.reduce((s, p) => s + p.verificados, 0);
  const correcciones = PRECISION.reduce((s, p) => s + p.errores, 0);
  const falsos = Math.round(correcciones * 0.2);
  const exportar = () => {
    const filas = [['Fecha/Hora', 'Medio', 'Canal/Emisora/Publicacion', 'Deteccion IA', 'Verificacion Humana', 'Resultado', 'Estatus'], ...BITACORA.map(b => [b.f, b.medio, b.canal, b.ia, b.hum, b.res, 'Verificado'])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([filas.map(f => f.map(c => `"${c}"`).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'reporte-precision.csv'; a.click();
  };

  return (
    <div style={{ minHeight: '100%', padding: m ? 16 : 30, ...FONDO_TECH }}><style>{keyframes}</style>
      <div style={inner}>
        {/* Cabecera de sección */}
        <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', justifyContent: 'space-between', alignItems: m ? 'flex-start' : 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: ACENTO, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Auditoría Contractual Continua</div>
            <h2 style={{ fontSize: m ? 20 : 26, fontWeight: 800, color: '#FFFFFF', margin: '4px 0', letterSpacing: '-0.02em' }}>Módulos de Precisión por Medio</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0d130a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 999, padding: '8px 18px', color: '#FFFFFF' }}>
            {cumple ? <CheckCircle2 size={18} color="#10B981" /> : <AlertTriangle size={18} color={colores.advertencia} />}
            <span style={{ fontSize: 13, fontWeight: 700 }}>Estado Contractual: <span style={{ color: cumple ? '#10B981' : colores.advertencia }}>{cumple ? '98.5% Cumplido' : 'En atención'}</span></span>
          </div>
        </div>

        {/* Medidores */}
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          {PRECISION.map((p, i) => {
            const ok = p.actual >= META_PRECISION;
            return (
              <Modulo key={p.id} title={`MÓDULO ${i + 1}: ${p.medio.toUpperCase()}`}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', justifyContent: 'space-between' }}>
                  <Medidor value={p.actual} ok={ok} id={p.id} />
                  <div style={{ color: ok ? '#DBF285' : colores.advertencia, fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                    {ok ? `Meta del ${META_PRECISION}% cumplida` : `${(META_PRECISION - p.actual).toFixed(1)} pts bajo la meta`}
                  </div>
                  <div style={{ marginTop: 12, minHeight: 46, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: D.txt, lineHeight: 1.3 }}>{TEXTO[p.id][0]}</div>
                    <div style={{ fontSize: 12.5, color: D.sub, marginTop: 3 }}>{TEXTO[p.id][1]}</div>
                  </div>
                </div>
              </Modulo>
            );
          })}
        </div>

        {/* Fila 2: Tendencia Histórica y Resumen Contractual */}
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1.15fr 1fr', gap: 16, marginBottom: 20, alignItems: 'stretch' }}>
          {/* Tendencia */}
          <Modulo title="MÓDULO 3: Gráfico de Tendencia Histórica de Precisión" style={{ height: '100%' }}>
            <div style={{ height: 215 }}><ResponsiveContainer>
              <ComposedChart data={DIAS} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tend-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#729013" stopOpacity={.3} /><stop offset="100%" stopColor="#729013" stopOpacity={0} /></linearGradient>
                  <linearGradient id="tend-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DBF285" stopOpacity={.7} /><stop offset="100%" stopColor="#DBF285" stopOpacity={.15} /></linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: D.sub, fontSize: 11 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis domain={[96, 99]} ticks={[96, 97, 98, 99]} tickFormatter={v => `${v}%`} tick={{ fill: D.sub, fontSize: 11 }} width={42} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ stroke: 'rgba(219, 242, 133, 0.4)', strokeDasharray: '3 3', fill: 'transparent' }} contentStyle={{ background: '#0A170E', border: `1px solid ${D.borde}`, borderRadius: 10, fontSize: 12, color: '#FFFFFF', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }} labelStyle={{ color: D.sub }} formatter={v => [`${v}%`, 'Precisión']} />
                <ReferenceLine y={META_PRECISION} stroke="#EF4444" strokeDasharray="5 4" strokeOpacity={.85} label={{ value: `Meta ${META_PRECISION}%`, fill: '#EF4444', fontSize: 10.5, position: 'insideTopRight' }} />
                <Bar dataKey="v" name="Precisión" fill="url(#tend-bar)" barSize={5} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                <Area dataKey="v" type="monotone" stroke="none" fill="url(#tend-area)" isAnimationActive={false} />
                <Line dataKey="v" type="monotone" stroke="#DBF285" strokeWidth={2.4} dot={false} activeDot={{ r: 4.5, fill: '#fff', stroke: '#729013', strokeWidth: 2 }} />
              </ComposedChart></ResponsiveContainer></div>
          </Modulo>

          {/* Resumen contractual */}
          <Modulo title="MÓDULO 4: Resumen de Auditoría Contractual" style={{ height: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([['Muestras auditadas (mes)', fmt(muestras)], ['Confirmaciones exitosas', fmt(muestras - correcciones)], ['Correcciones / ajustes', String(correcciones)], ['Tasa de falsos positivos', falsos / muestras < 0.012 ? '<1.2%' : `${(falsos / muestras * 100).toFixed(1)}%`]] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${D.borde}`, borderRadius: 12, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11.5, color: D.sub }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: ACENTO, marginTop: 3, letterSpacing: '-.5px' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <Btn onClick={exportar}><Download size={14} /> Descargar Reporte de Precisión</Btn>
              <svg viewBox="0 0 90 90" width={64} style={{ opacity: .85 }} aria-label="Sello de auditoría">
                <circle cx={45} cy={45} r={42} fill="none" stroke="#6B7280" strokeWidth={1.5} strokeDasharray="3 2" /><circle cx={45} cy={45} r={33} fill="none" stroke="#6B7280" strokeWidth={1} />
                <text x={45} y={42} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#D1D5DB">Auditoría Interna</text><text x={45} y={53} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#DBF285">& IA - MAYIA</text>
              </svg>
            </div>
          </Modulo>
        </div>

        {/* Fila 3: Tabla de Auditoría (Ancho Completo, legible, sin amontonamiento) */}
        <Modulo title="MÓDULO 2: Tabla de Auditoría y Verificación de Precisión (Bitácora de Ajustes)" right={<Btn onClick={exportar}><Download size={14} /> Exportar CSV</Btn>}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: '140px' }}>Fecha / Hora</th>
                  <th style={{ ...th, width: '100px' }}>Medio</th>
                  <th style={{ ...th, width: '220px' }}>Canal / Emisora</th>
                  <th style={th}>Detección IA</th>
                  <th style={th}>Verificación Humana</th>
                  <th style={{ ...th, width: '150px' }}>Resultado</th>
                  <th style={{ ...th, width: '110px', textAlign: 'center' }}>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {BITACORA.map((b, i) => (
                  <tr key={i} style={{ transition: 'background-color 0.15s' }}>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: D.sub }}>{b.f}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', fontWeight: 600 }}>{b.medio}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: '#FFFFFF', fontWeight: 500 }}>{b.canal}</td>
                    <td style={{ ...td, color: '#D1D5DB' }}>{b.ia}</td>
                    <td style={{ ...td, color: '#9CA3AF' }}>{b.hum}</td>
                    <td style={{ ...td, color: b.res.includes('Ajustado') ? colores.advertencia : '#DBF285', fontWeight: 600 }}>{b.res}</td>
                    <td style={{ ...td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ background: 'linear-gradient(135deg, #729013, #5B7410)', color: '#fff', fontWeight: 700, fontSize: 11.5, padding: '4px 12px', borderRadius: 6, boxShadow: '0 2px 8px rgba(114, 144, 19, 0.35)', whiteSpace: 'nowrap', display: 'inline-block' }}>Verificado</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modulo>
      </div>
    </div>
  );
};

