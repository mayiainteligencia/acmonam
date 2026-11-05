import React, { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, ChevronDown } from 'lucide-react';
import { brandingConfig } from '../config/branding';
import {
  seccionesPrincipales as menuItems,
  seccionesExtra as extraSections,
  colorEstado,
  tituloEstado,
  type EstadoSeccion,
} from '../config/menu';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

/** Punto de estado con tooltip: verde = activo, ámbar = demo, gris = en activación. */
const PuntoEstado: React.FC<{ estado: EstadoSeccion }> = ({ estado }) => (
  <span
    title={tituloEstado[estado]}
    style={{
      width: 7,
      height: 7,
      borderRadius: '50%',
      backgroundColor: colorEstado(estado),
      flexShrink: 0,
      boxShadow: `0 0 6px ${colorEstado(estado)}66`,
    }}
  />
);

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { empresa, colores } = brandingConfig;
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [activeSection]: true,
  });
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  // Asegurar que la sección activa siempre tenga su submenú abierto
  useEffect(() => {
    setExpandedSections(prev => ({
      ...prev,
      [activeSection]: true,
    }));
  }, [activeSection]);

  const toggleAccordion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = (id: string) => {
    onSectionChange(id);
    setExpandedSections(prev => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleSubItemClick = (subId: string) => {
    setActiveSubId(subId);
    window.dispatchEvent(new CustomEvent('seccion:goto', { detail: subId }));
  };

  return (
    <aside
      style={{
        width: collapsed ? '78px' : '256px',
        height: '100vh',
        backgroundColor: '#080F1E',
        borderRight: `1px solid rgba(56, 189, 248, 0.14)`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.45)',
        zIndex: 20,
      }}
    >
      <style>{`
        .sb-nav { scrollbar-width: thin; scrollbar-color: rgba(56, 189, 248, 0.2) transparent; }
        .sb-nav::-webkit-scrollbar { width: 4px; }
        .sb-nav::-webkit-scrollbar-track { background: transparent; }
        .sb-nav::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 999px; }
        .sb-nav::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.4); }

        .sub-accordion {
          transition: max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
        }
      `}</style>

      {/* Top Header con Logo y Botón de Colapso */}
      <div
        style={{
          padding: collapsed ? '16px 12px 12px' : '18px 18px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: `1px solid rgba(56, 189, 248, 0.14)`,
          flexShrink: 0,
          background: '#080F1E',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div
            style={{
              height: collapsed ? '38px' : '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '10px',
              padding: collapsed ? '4px 6px' : '5px 12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            <img
              src={empresa.logo}
              alt={empresa.nombre}
              style={{
                maxWidth: collapsed ? '36px' : '125px',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Colapsar menú"
            aria-label="Colapsar menú"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid rgba(56, 189, 248, 0.18)`,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#CBD5E1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
              e.currentTarget.style.color = '#38BDF8';
              e.currentTarget.style.borderColor = '#38BDF8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#CBD5E1';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.18)';
            }}
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <button
            onClick={() => setCollapsed(false)}
            title="Expandir menú"
            aria-label="Expandir menú"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: `1px solid rgba(56, 189, 248, 0.2)`,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#CBD5E1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
              e.currentTarget.style.color = '#38BDF8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#CBD5E1';
            }}
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>
      )}

      {/* Título de Sección */}
      {!collapsed && (
        <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: '#94A3B8',
            }}
          >
            SERVICIOS DE MONITOREO
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.28)',
            }}
          >
            EN LÍNEA
          </span>
        </div>
      )}

      {/* Menú Principal con Accordion Fluido */}
      <nav
        className="sb-nav"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          padding: collapsed ? '8px 8px' : '4px 12px 16px',
          overflowY: 'auto',
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icono;
          const isActive = activeSection === item.id;
          const isExpanded = !!expandedSections[item.id];
          const hasSub = !!item.sub && item.sub.length > 0;

          return (
            <div key={item.id} style={{ marginBottom: '4px' }}>
              {/* Botón Principal del Servicio */}
              <div
                onClick={() => handleItemClick(item.id)}
                title={collapsed ? item.nombre : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  gap: '10px',
                  padding: collapsed ? '10px 0' : '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'transparent',
                  background: isActive ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? '0 4px 16px rgba(2, 132, 199, 0.35)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.10)';
                    e.currentTarget.style.color = '#38BDF8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#CBD5E1';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isActive ? '#FFFFFF' : '#38BDF8',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  {!collapsed && (
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? 600 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.nombre}
                    </span>
                  )}
                </div>

                {!collapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <PuntoEstado estado={item.estado} />
                    {hasSub && (
                      <button
                        onClick={(e) => toggleAccordion(item.id, e)}
                        title={isExpanded ? 'Ocultar opciones' : 'Ver opciones'}
                        aria-label="Alternar submenú"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 2,
                          color: isActive ? 'rgba(255, 255, 255, 0.85)' : '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-opciones con animación fluida tipo acordeón */}
              {hasSub && !collapsed && (
                <div
                  className="sub-accordion"
                  style={{
                    maxHeight: isExpanded ? `${item.sub!.length * 36 + 10}px` : '0px',
                    opacity: isExpanded ? 1 : 0,
                    overflow: 'hidden',
                    margin: isExpanded ? '4px 0 6px 20px' : '0 0 0 20px',
                    paddingLeft: '10px',
                    borderLeft: `2px solid ${isActive ? '#38BDF8' : 'rgba(56, 189, 248, 0.22)'}`,
                  }}
                >
                  {item.sub!.map((sb) => {
                    const isSubActive = activeSubId === sb.id;
                    return (
                      <button
                        key={sb.id}
                        onClick={() => handleSubItemClick(sb.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 10px',
                          fontSize: '12.5px',
                          color: isSubActive ? '#38BDF8' : '#94A3B8',
                          fontWeight: isSubActive ? 600 : 400,
                          backgroundColor: isSubActive ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          marginBottom: '2px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
                            e.currentTarget.style.color = '#38BDF8';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSubActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: isSubActive ? '#38BDF8' : 'rgba(255, 255, 255, 0.3)',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sb.nombre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info de ACAM */}
      {!collapsed ? (
        <div
          style={{
            padding: '14px 18px',
            borderTop: `1px solid rgba(56, 189, 248, 0.14)`,
            background: '#080F1E',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                ACAM Medios
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Auditoría 2026 en vivo
              </div>
            </div>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px #10B981AA',
              }}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '12px 0',
            borderTop: `1px solid rgba(56, 189, 248, 0.14)`,
            display: 'flex',
            justifyContent: 'center',
            background: '#080F1E',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981AA',
            }}
          />
        </div>
      )}
    </aside>
  );
};