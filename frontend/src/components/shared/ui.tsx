import React, { useState } from 'react';
import { Brain, Check, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { brandingConfig } from '../../config/branding';
import { useToast } from './toast';
import { useConfirm } from './confirm';

const { colores } = brandingConfig;
const V = colores.primario;
const VV = colores.primarioVivo;   // limón brillante: solo sobre fondos oscuros

export const keyframes = `
@keyframes elFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes elPulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes elPop{0%{transform:scale(1)}45%{transform:scale(.97)}100%{transform:scale(1)}}
@media (prefers-reduced-motion: reduce){.el-anim,.el-pulse{animation:none!important}}
`;

// ── Punto "LIVE" parpadeante ──
export const LiveDot: React.FC<{ label?: string }> = ({ label = 'LIVE' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: colores.exito }}>
    <span className="el-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: colores.exito, animation: 'elPulse 1.4s ease-in-out infinite' }} />
    {label}
  </span>
);

// ── Panel / tarjeta contenedora ──
export const Panel: React.FC<{ title?: string; icon?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> =
({ title, icon, right, children, style }) => (
  <section style={{
    background: colores.fondoClaro, border: `1px solid ${colores.borde}`, borderRadius: 18,
    padding: 20, boxShadow: colores.sombra, animation: 'elFadeUp .4s ease both', ...style,
  }} className="el-anim">
    {(title || right) && (
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {icon}
          {title && <h3 style={{ fontSize: 15, fontWeight: 700, color: colores.textoClaro, margin: 0 }}>{title}</h3>}
        </div>
        {right}
      </header>
    )}
    {children}
  </section>
);

// ── KPI tile ──
export const Kpi: React.FC<{ label: string; value: string; delta?: string; up?: boolean; sub?: string }> =
({ label, value, delta, up, sub }) => (
  <div style={{ background: colores.fondoClaro, border: `1px solid ${colores.borde}`, borderRadius: 14, padding: 16, boxShadow: colores.sombra }}>
    <div style={{ fontSize: 12, color: colores.textoOscuro, fontWeight: 600, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: colores.textoClaro, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</div>
    {(delta || sub) && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, color: up === false ? colores.peligro : colores.exito, fontWeight: 600 }}>
        {up !== undefined && (up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
        <span style={{ color: delta ? undefined : colores.textoOscuro }}>{delta || sub}</span>
        {delta && sub && <span style={{ color: colores.textoOscuro, fontWeight: 500 }}>· {sub}</span>}
      </div>
    )}
  </div>
);

// ── Tarjeta de insight de MAYIA (Análisis / Predicción / Sugerencia) ──
type InsightKind = 'Análisis' | 'Predicción' | 'Sugerencia';
export const Insight: React.FC<{ kind: InsightKind; title: string; children: React.ReactNode; plan?: string }> =
({ kind, title, children, plan }) => {
  const { push } = useToast();
  const confirmar = useConfirm();
  const [state, setState] = useState<'idle' | 'activo' | 'descartado'>('idle');
  const activar = async () => {
    if (await confirmar({ titulo: title, descripcion: plan! })) {
      setState('activo');
      push({ kind: 'success', title: 'Plan activado', msg: plan! });
    }
  };
  const kindColor = kind === 'Predicción' ? '#0047AB' : kind === 'Sugerencia' ? V : colores.textoClaro;

  if (state === 'descartado') return null;

  return (
    <div className="el-anim" style={{
      background: state === 'activo' ? `${V}0D` : colores.fondoSecundario,
      border: `1px solid ${state === 'activo' ? V : colores.borde}`,
      borderRadius: 14, padding: 15, transition: 'background .3s, border-color .3s', animation: state === 'activo' ? 'elPop .35s ease' : undefined,
    }}>
      <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: kindColor, marginBottom: 7 }}>{kind}</span>
      <div style={{ fontSize: 14, fontWeight: 700, color: colores.textoClaro, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 13, color: colores.textoMedio, lineHeight: 1.5, margin: 0 }}>{children}</p>
      {plan && (
        state === 'activo' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, color: colores.exito, fontSize: 13, fontWeight: 700 }}>
            <Check size={16} /> Plan activado
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={activar}
              style={{ border: 'none', background: V, color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>
              Activar plan
            </button>
            <button onClick={() => setState('descartado')}
              style={{ border: `1px solid ${colores.borde}`, background: 'transparent', color: colores.textoMedio, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>
              Descartar
            </button>
          </div>
        )
      )}
    </div>
  );
};

// ── Cabecera de sección con panel "MAYIA · análisis en vivo" ──
export const SectionHero: React.FC<{ eyebrow: string; title: React.ReactNode; subtitle: string; right?: React.ReactNode; insights: React.ReactNode }> =
({ eyebrow, title, subtitle, right, insights }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18, marginBottom: 22 }} className="el-hero">
    <div style={{
      background: colores.gradientePrimario, borderRadius: 22, padding: 26, color: '#fff', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${VV}55, transparent 70%)` }} />
      <div style={{ position: 'relative' }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: VV }}>{eyebrow}</span>
        <h1 style={{ fontSize: 30, fontWeight: 300, margin: '10px 0 6px', letterSpacing: '-0.5px' }}>{title}</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', margin: 0, maxWidth: 560, lineHeight: 1.5 }}>{subtitle}</p>
        {right && <div style={{ marginTop: 16 }}>{right}</div>}
      </div>
    </div>
    <Panel title="ACAM · Análisis IA" icon={<div style={{ width: 30, height: 30, borderRadius: 9, background: `${V}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={17} color={V} /></div>} right={<LiveDot label="análisis en vivo" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{insights}</div>
    </Panel>
  </div>
);

export const wrap = (isMobile: boolean): React.CSSProperties => ({
  minHeight: '100%', padding: isMobile ? 16 : 30, background: colores.fondoPrincipal,
});
export const inner: React.CSSProperties = { maxWidth: 1500, margin: '0 auto' };

export function useIsMobile() {
  const [m, setM] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  React.useEffect(() => {
    const f = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return m;
}

// ── Pestañas ACAM ──
export const Tabs: React.FC<{ tabs: string[]; active: string; onChange: (t: string) => void; dark?: boolean }> = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
    {tabs.map(t => {
      const isAct = active === t;
      return (
        <button key={t} onClick={() => onChange(t)}
          style={{
            padding: '9px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            border: `1px solid ${isAct ? '#38BDF8' : 'rgba(56, 189, 248, 0.2)'}`,
            background: isAct ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'rgba(255, 255, 255, 0.05)',
            color: isAct ? '#FFFFFF' : '#CBD5E1',
            boxShadow: isAct ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
            transition: 'all 0.18s ease'
          }}>{t}</button>
      );
    })}
  </div>
);

// ── Tabla simple ──
export function Tabla<T>({ cols, rows }: { cols: { h: string; r: (x: T) => React.ReactNode }[]; rows: T[] }) {
  const th: React.CSSProperties = { textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: colores.textoOscuro, padding: '8px 10px', borderBottom: `1px solid ${colores.borde}`, whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { fontSize: 13, color: colores.textoClaro, padding: '10px', borderBottom: `1px solid ${colores.borde}`, whiteSpace: 'nowrap' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{cols.map(c => <th key={c.h} style={th}>{c.h}</th>)}</tr></thead>
        <tbody>{rows.map((x, i) => <tr key={i}>{cols.map(c => <td key={c.h} style={td}>{c.r(x)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

// ── Etiqueta de color ──
export const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = colores.textoMedio }) => (
  <span style={{ fontSize: 11.5, fontWeight: 700, color, background: `${color}18`, padding: '3px 9px', borderRadius: 999 }}>{children}</span>
);

// ── Cabecera de página ──
export const PageHead: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h1 style={{ fontSize: 30, fontWeight: 700, color: colores.textoClaro, margin: 0 }}>{title}</h1>
    <p style={{ fontSize: 13, color: colores.textoOscuro, margin: '4px 0 0' }}>{sub}</p>
  </div>
);
