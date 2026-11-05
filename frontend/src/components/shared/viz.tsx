import React from 'react';
import { Play } from 'lucide-react';
import { brandingConfig } from '../../config/branding';
import { rnd } from '../../data/medios';

const { colores } = brandingConfig;

// Medidor semicircular: valor 0-100 contra una meta.
export const Gauge: React.FC<{ value: number; meta: number; label: string }> = ({ value, meta, label }) => {
  const R = 70, C = Math.PI * R, ok = value >= meta;
  const pt = (v: number) => { const a = Math.PI * (1 - v / 100); return [90 + R * Math.cos(a), 90 - R * Math.sin(a)]; };
  const [mx, my] = pt(meta);
  return (
    <svg viewBox="0 0 180 110" style={{ width: '100%', maxWidth: 240 }}>
      <path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke={colores.borde} strokeWidth={14} strokeLinecap="round" />
      <path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke={ok ? colores.exito : colores.advertencia} strokeWidth={14} strokeLinecap="round"
        strokeDasharray={`${C * value / 100} ${C}`} />
      <circle cx={mx} cy={my} r={4} fill={colores.textoClaro} />
      <text x={90} y={82} textAnchor="middle" fontSize={26} fontWeight={800} fill={colores.textoClaro}>{value}%</text>
      <text x={90} y={102} textAnchor="middle" fontSize={11} fill={colores.textoOscuro}>{label}</text>
    </svg>
  );
};

// Forma de onda falsa pero estable (por semilla).
export const Waveform: React.FC<{ seed: number; color?: string; bars?: number; height?: number }> = ({ seed, color = colores.primario, bars = 48, height = 38 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2, height }}>
    {Array.from({ length: bars }, (_, i) => (
      <span key={i} style={{ flex: 1, height: `${20 + rnd(seed * 31 + i, 80)}%`, background: color, borderRadius: 2, opacity: .85 }} />
    ))}
  </div>
);

// Cuadro de video con botón de play (testigo de TV).
export const VideoThumb: React.FC<{ seed: number; canal: string; dur: number; height?: number }> = ({ seed, canal, dur, height = 110 }) => {
  const h = (seed * 47) % 360;
  return (
    <div style={{ height, borderRadius: 10, position: 'relative', background: `linear-gradient(135deg, hsl(${h} 45% 22%), hsl(${(h + 50) % 360} 50% 38%))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={16} color="#111" fill="#111" /></div>
      <span style={{ position: 'absolute', left: 8, top: 6, fontSize: 10.5, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.45)', padding: '2px 7px', borderRadius: 6 }}>{canal}</span>
      <span style={{ position: 'absolute', right: 8, bottom: 6, fontSize: 10.5, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.55)', padding: '2px 6px', borderRadius: 6 }}>0:{String(dur).padStart(2, '0')}</span>
    </div>
  );
};

// Página impresa simulada con el anuncio detectado resaltado.
export const PagePreview: React.FC<{ seed: number; cm2: number; color: boolean; height?: number }> = ({ seed, cm2, color, height = 190 }) => {
  const adH = Math.min(70, 28 + cm2 / 14), adW = 50 + (seed % 3) * 8;
  return (
    <div style={{ height, background: '#FAFAF7', border: `1px solid ${colores.borde}`, borderRadius: 6, padding: 10, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 8, width: '55%', background: '#333', marginBottom: 8 }} />
      {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ height: 3, width: `${60 + rnd(seed * 9 + i, 40)}%`, background: '#CFCFCF', marginBottom: 5 }} />)}
      <div style={{ position: 'absolute', right: 10, bottom: 10, width: `${adW}%`, height: `${adH}%`, background: color ? `hsl(${(seed * 53) % 360} 70% 55% / .85)` : '#9A9A9A', border: `2px dashed ${colores.peligro}`, borderRadius: 3 }} />
    </div>
  );
};

// Avatar circular de color con iniciales.
export const Avatar: React.FC<{ name: string; color: string; size?: number }> = ({ name, color, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, color: '#fff', fontWeight: 800, fontSize: size * .36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
  </div>
);

// Tooltip de recharts acorde al branding.
// eslint-disable-next-line react-refresh/only-export-components
export const tooltipStyle = { background: colores.fondoClaro, border: `1px solid ${colores.borde}`, borderRadius: 10, fontSize: 12 };
