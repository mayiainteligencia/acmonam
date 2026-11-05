import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import { secciones as menuItems, colorEstado } from '../config/menu';
import { FONDO_OSCURO, SECCIONES_OSCURAS } from '../config/tema';

interface ResponsiveLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  header: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarR?: React.ReactNode;
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  activeSection,
  onSectionChange,
  header,
  sidebar,
  sidebarR,
  children,
}) => {
  const { colores, empresa } = brandingConfig;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setDrawerOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const activeItem = menuItems.find(m => m.id === activeSection);
  // Secciones ya rediseñadas en oscuro: todo el contenedor usa el mismo fondo (sin franjas blancas).
  const fondo = SECCIONES_OSCURAS.includes(activeSection) ? FONDO_OSCURO : colores.fondoPrincipal;

  /* ─── DESKTOP ≥1024px ─── */
  if (!isMobile) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: fondo,
      }}>
        {sidebar}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: fondo }}>
          {header}
          <div style={{ flex: 1, overflowY: 'auto', background: fondo }}>
            {children}
          </div>
        </div>
        {sidebarR}
      </div>
    );
  }

  /* ─── MOBILE / TABLET <1024px ─── */
  return (
    <>
      {/*
        En móvil usamos el flujo normal del documento (no flex column con height fija).
        El body/html hacen el scroll natural. Solo la top bar y el bottom nav son sticky.
      */}
      <style>{`
        html, body { height: auto; overflow: auto; }

        /* Top bar fija */
        .rl-topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: ${colores.fondoSecundario};
          border-bottom: 1px solid ${colores.borde};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          z-index: 500;
        }

        /* Espacio para la topbar */
        .rl-topbar-spacer { height: 56px; }

        /* Bottom nav fija */
        .rl-bottomnav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: ${colores.fondoSecundario};
          border-top: 1px solid ${colores.borde};
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 6px 4px;
          z-index: 500;
          padding-bottom: calc(6px + env(safe-area-inset-bottom));
        }

        /* Espacio para el bottom nav */
        .rl-bottomnav-spacer { height: calc(64px + env(safe-area-inset-bottom)); }

        /* Contenido: scroll horizontal si el contenido es más ancho */
        .rl-content {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Escala el contenido del dashboard para que entre en pantalla */
        .rl-content-inner {
          min-width: 0;
          width: 100%;
        }

        /* Drawer overlay */
        .rl-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(3px);
          z-index: 900;
          animation: rl-fadein 0.2s ease;
        }

        /* Drawer panel */
        .rl-drawer {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 280px;
          background: ${colores.fondoSecundario};
          border-right: 1px solid ${colores.borde};
          display: flex;
          flex-direction: column;
          z-index: 1000;
          animation: rl-slidein 0.25s ease;
          box-shadow: 8px 0 40px rgba(0,0,0,0.4);
        }

        @keyframes rl-fadein {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes rl-slidein {
          from { transform: translateX(-100%); } to { transform: translateX(0); }
        }

        /* Botón hamburguesa */
        .rl-hambtn {
          width: 40px; height: 40px; border-radius: 10px;
          background: ${colores.fondoTerciario};
          border: 1px solid ${colores.borde};
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        /* Pill sección activa */
        .rl-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          background: ${colores.primario}20;
          border: 1px solid ${colores.primario}40;
          font-size: 12px; font-weight: 700;
          color: ${colores.primario};
          white-space: nowrap;
        }

        /* Bottom nav item */
        .rl-navitem {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          background: none; border: none; cursor: pointer;
          padding: 5px 8px; border-radius: 12px;
          min-width: 52px;
          transition: all 0.2s;
        }
        .rl-navitem span {
          font-size: 9px;
          text-align: center;
          max-width: 52px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1;
        }

        /* Drawer nav item */
        .rl-draweritem {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px; margin-bottom: 4px;
          border: none; cursor: pointer; text-align: left;
          transition: all 0.2s;
        }
      `}</style>

      {/* ── Top bar ── */}
      <div className="rl-topbar">
        <button className="rl-hambtn" onClick={() => setDrawerOpen(true)}>
          <Menu size={20} color={colores.textoClaro} />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center',
          background: '#000000', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 10, padding: '5px 12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        }}>
          <img
            src={empresa.logo}
            alt={empresa.nombre}
            style={{ height: '22px', objectFit: 'contain' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="rl-pill">
          {activeItem && <activeItem.icono size={12} color={colores.primario} />}
          <span>{activeItem?.nombre ?? 'Dashboard'}</span>
        </div>
      </div>

      {/* Spacer para la top bar */}
      <div className="rl-topbar-spacer" />

      {/* ── Contenido principal — scroll libre ── */}
      <div className="rl-content" style={{ background: fondo, minHeight: '100vh' }}>
        <div className="rl-content-inner">
          {children}
        </div>
      </div>

      {/* Spacer para el bottom nav */}
      <div className="rl-bottomnav-spacer" />

      {/* ── Bottom nav ── */}
      <div className="rl-bottomnav">
        {menuItems.map(item => {
          const Icon = item.icono;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              className="rl-navitem"
              onClick={() => handleSectionChange(item.id)}
              style={{ backgroundColor: isActive ? `${colores.primario}20` : 'transparent' }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isActive ? colores.primario : colores.fondoTerciario,
                transition: 'all 0.2s',
              }}>
                <Icon size={16} color={isActive ? '#fff' : colores.textoMedio} />
              </div>
              <span style={{
                fontWeight: isActive ? 700 : 500,
                color: isActive ? colores.primario : colores.textoOscuro,
              }}>
                {item.nombre}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <>
          <div className="rl-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="rl-drawer">
            {/* Header drawer */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${colores.borde}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  height: '40px', borderRadius: '10px', overflow: 'hidden',
                  background: '#000000', border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px 10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                }}>
                  <img
                    src={empresa.logo}
                    alt={empresa.nombre}
                    style={{ height: '28px', objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: colores.textoClaro }}>
                    {empresa.nombre}
                  </div>
                  <div style={{ fontSize: '11px', color: colores.textoMedio }}>Auditoría y Monitoreo</div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: colores.fondoTerciario, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} color={colores.textoMedio} />
              </button>
            </div>

            {/* Label */}
            <div style={{ padding: '16px 20px 8px' }}>
              <span style={{
                fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: colores.textoOscuro,
              }}>
                Navegación
              </span>
            </div>

            {/* Items */}
            <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
              {menuItems.map(item => {
                const Icon = item.icono;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    className="rl-draweritem"
                    onClick={() => handleSectionChange(item.id)}
                    style={{
                      backgroundColor: isActive ? colores.primario : 'transparent',
                      color: isActive ? '#fff' : colores.textoMedio,
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colores.fondoTerciario,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={isActive ? '#fff' : colores.textoMedio} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, flex: 1 }}>
                      {item.nombre}
                    </span>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: colorEstado(item.estado),
                    }} />
                    {isActive && <ChevronRight size={16} color="rgba(255,255,255,0.7)" />}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: `1px solid ${colores.borde}`,
              fontSize: '11px', color: colores.textoOscuro, textAlign: 'center',
            }}>
              Hub Digital · {empresa.nombre}
            </div>
          </div>
        </>
      )}
    </>
  );
};