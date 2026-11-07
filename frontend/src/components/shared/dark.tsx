/* eslint-disable react-refresh/only-export-components */
// Módulos visuales MAYIA Escucha: fondo obsidiana con acento cyber lime.
import { useState } from 'react';
import { brandingConfig } from '../../config/branding';
import { Avatar } from './viz';

const { colores } = brandingConfig;
export const ACENTO = '#DBF285'; // Verde lima luminoso para resaltar sobre fondo oscuro
export const D = { 
  bg: '#0A170E', 
  borde: 'rgba(219, 242, 133, 0.18)', 
  fila: 'rgba(255, 255, 255, 0.07)', 
  txt: '#FFFFFF', 
  sub: '#9CA3AF' 
};
export const CARD = 'linear-gradient(180deg, #0F1F14 0%, #0A170E 100%)';
export const th: React.CSSProperties = { 
  textAlign: 'left', 
  fontSize: 11.5, 
  fontWeight: 700, 
  color: '#9CA3AF', 
  textTransform: 'uppercase', 
  letterSpacing: '.05em', 
  padding: '12px 14px', 
  borderBottom: `1px solid rgba(219, 242, 133, 0.16)`, 
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  lineHeight: 1.3,
  whiteSpace: 'nowrap'
};
export const td: React.CSSProperties = { 
  fontSize: 12.5, 
  color: D.txt, 
  padding: '12px 14px', 
  borderBottom: `1px solid ${D.fila}`, 
  verticalAlign: 'middle', 
  lineHeight: 1.4, 
};
export const selDark: React.CSSProperties = { 
  padding: '7px 11px', 
  borderRadius: 9, 
  border: `1px solid rgba(219, 242, 133, 0.3)`, 
  background: '#0A170E', 
  color: '#FFFFFF', 
  fontSize: 12.5, 
  colorScheme: 'dark',
  outline: 'none',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)'
};

// Logo por convención: /assets/emisoras/<nombre sin espacios ni acentos, minúsculas>.png; si no existe, avatar de color.
export const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
export const Logo = ({ nombre, color, size = 44 }: { nombre: string; color: string; size?: number }) => {
  const [ok, setOk] = useState(true);
  return ok
    ? <img src={`/assets/emisoras/${slug(nombre)}.png`} alt={nombre} onError={() => setOk(false)} style={{ width: size, height: size, objectFit: 'contain', background: '#fff', borderRadius: 10, padding: 3, border: '1px solid #E5E7EB', flexShrink: 0 }} />
    : <Avatar name={nombre} color={color} size={size} />;
};

// Casilla blanca de logo: imagen si existe, texto si no.
export const GrupoLogo = ({ nombre, color }: { nombre: string; color: string }) => {
  const [ok, setOk] = useState(true);
  return (
    <div title={nombre} style={{ height: 42, borderRadius: 10, background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4px 6px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
      {ok ? <img src={`/assets/emisoras/${slug(nombre)}.png`} alt={nombre} onError={() => setOk(false)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        : <span style={{ fontSize: 9.5, fontWeight: 800, color, textAlign: 'center', lineHeight: 1.1 }}>{nombre}</span>}
    </div>
  );
};

export const Modulo = ({ id, title, right, children, style }: { id?: string; title: string; right?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }) => (
  <section id={id} className="tech-card" style={{ background: '#0d130a', border: `1px solid ${D.borde}`, borderRadius: 28, padding: 24, color: D.txt, boxShadow: '0 18px 40px -10px rgba(0, 0, 0, 0.6)', scrollMarginTop: 16, minWidth: 0, ...style }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '.01em', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span className="tech-dot" />{title}
      </h3>
      {right && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{right}</div>}
    </header>
    {children}
  </section>
);

export const Btn = ({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) => (
  <button onClick={onClick} style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: 6, 
    padding: '7px 13px', 
    borderRadius: 9, 
    fontSize: 12.5, 
    fontWeight: 600, 
    cursor: 'pointer', 
    color: active ? '#DBF285' : '#D1D5DB', 
    background: active ? 'rgba(219, 242, 133, 0.16)' : 'rgba(255, 255, 255, 0.05)', 
    border: `1px solid ${active ? ACENTO : 'rgba(255, 255, 255, 0.12)'}`,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.15s ease'
  }}>{children}</button>
);

/** Botón de filtro: relleno azul degradado con resplandor neón cuando está activo */
export const Filtro = ({ children, on, onClick }: { children: React.ReactNode; on: boolean; onClick: () => void }) => (
  <button onClick={onClick} style={{ 
    padding: '9px 18px', 
    borderRadius: 10, 
    fontSize: 13.5, 
    fontWeight: 700, 
    cursor: 'pointer', 
    color: '#FFFFFF', 
    background: on ? 'linear-gradient(135deg, #729013 0%, #5B7410 100%)' : 'rgba(255, 255, 255, 0.04)', 
    border: `1px solid ${on ? ACENTO : 'rgba(255, 255, 255, 0.12)'}`,
    boxShadow: on ? '0 4px 14px rgba(114, 144, 19, 0.45)' : 'none',
    transition: 'all 0.18s ease'
  }}>{children}</button>
);

