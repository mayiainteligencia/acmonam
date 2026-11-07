import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Settings,
  LogOut,
  Upload,
  SlidersHorizontal,
  Plus,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import logoMayia from '../assets/logo/mayiaEscuchaTrim.png';
import { useAuth } from '../features/auth';
import { navigate } from '../core/router';
import { ROUTES } from '../app/routes';
import { secciones, type ItemMenu } from '../config/menu';
import { SettingsModal } from './SettingsModal';
import { ConfirmDialog } from './ConfirmDialog';

const sectionFilterPills: Record<string, string[]> = {
  precision: [
    'Todos los medios',
    'Conforme (≥97.5%)',
    'En observación',
    'Auditoría 2026',
    'Evidencias IA',
    'Bitácora Hoy',
    'SLA Activo',
  ],
  radio: [
    'Todas las emisoras',
    'AM / FM On-Air',
    'Spots comerciales',
    'Patrocinios',
    'Autopromos',
    'CDMX (96.9 FM)',
    'GDL (93.9 FM)',
    'MTY',
  ],
  tv: [
    'Todos los canales',
    'TV Abierta nacional',
    'TV de Paga',
    'Spoteo 24/7',
    'Acciones especiales',
    'Testigos de video',
    'CDMX',
    'Plazas locales',
  ],
  impresos: [
    'Todas las publicaciones',
    'Periódicos nacionales',
    'Revistas especializadas',
    'Plana entera',
    'Media plana',
    'Color / B&N',
    '300 DPI Legal',
  ],
};

interface Notification {
  id: number;
  tipo: 'alerta' | 'exito' | 'info' | 'urgente';
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
}

const notificacionesEstaticas: Notification[] = [
  { id: 1, tipo: 'urgente', titulo: 'TV: precisión bajo la meta', mensaje: 'Televisión está en 96.8%, por debajo del 97.5% contractual.', tiempo: 'Hace 3 min', leida: false },
  { id: 2, tipo: 'alerta',  titulo: 'Detección on-air · Radio',   mensaje: 'Nuevo spot detectado en W Radio 96.9 FM. Testigo registrado.', tiempo: 'Hace 8 min', leida: false },
  { id: 3, tipo: 'info',    titulo: 'Impresos: lista preliminar', mensaje: 'El cliente aún enviará la lista definitiva de periódicos.', tiempo: 'Hace 1 hora', leida: true },
  { id: 4, tipo: 'exito',   titulo: 'Cobertura de radio completa', mensaje: '147 de 147 estaciones AM/FM configuradas.', tiempo: 'Hace 2 horas', leida: true },
];

interface ModernDashboardLayoutProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  children: React.ReactNode;
}

export const ModernDashboardLayout: React.FC<ModernDashboardLayoutProps> = ({
  activeSection,
  onSectionChange,
  children,
}) => {
  const { session, logout } = useAuth();
  const currentPills = sectionFilterPills[activeSection] || sectionFilterPills.precision;
  const [activeFilterPill, setActiveFilterPill] = useState(currentPills[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [toastAlerta, setToastAlerta] = useState<{ visible: boolean; mensaje: string; tipo: 'exito' | 'advertencia' }>({
    visible: false,
    mensaje: '',
    tipo: 'exito',
  });
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notification[]>(notificacionesEstaticas);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pills = sectionFilterPills[activeSection] || sectionFilterPills.precision;
    setActiveFilterPill(pills[0]);
  }, [activeSection]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificacionesAbiertas(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarComoLeida = (id: number) =>
    setNotificaciones(notificaciones.map(n => (n.id === id ? { ...n, leida: true } : n)));

  const marcarTodasComoLeidas = () =>
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));

  const getIconoPorTipo = (tipo: Notification['tipo']) => {
    switch (tipo) {
      case 'alerta':  return <AlertTriangle size={15} color="#F59E0B" />;
      case 'exito':   return <CheckCircle   size={15} color="#10B981" />;
      case 'urgente': return <AlertTriangle size={15} color="#EF4444" />;
      case 'info':    return <Info          size={15} color="#DBF285" />;
    }
  };

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'advertencia' = 'exito') => {
    setToastAlerta({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToastAlerta(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const exportarAuditoriaCSV = () => {
    const bitacoraMock = [
      ['Fecha/Hora', 'Medio', 'Canal/Emisora', 'Deteccion IA', 'Verificacion', 'Resultado', 'Estatus'],
      ['18-10-2026 16:20', 'Radio', 'W Radio 96.9 FM', 'Spot Aurora (20s)', 'Confirmado', 'Correcto (100%)', 'Verificado'],
      ['18-10-2026 15:55', 'Television', 'Las Estrellas', 'Mencion en Vivo - Nortia', 'Confirmado', 'Correcto (100%)', 'Verificado'],
      ['18-10-2026 14:30', 'Impresos', 'El Universal', 'Insercion Nuvo (1/2 Plana)', 'Confirmado', 'Correcto (100%)', 'Verificado'],
      ['18-10-2026 12:15', 'Radio', 'Los 40 101.7 FM', 'Autopromocional (30s)', 'Ajuste 28s', 'Corregido', 'Verificado'],
    ];
    const csvContent = bitacoraMock.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-monitoreo-${activeSection}.csv`;
    link.click();
    mostrarToast('Bitácora descargada. Precaución: los registros contienen telemetría sensible.', 'advertencia');
  };

  const pedirConfirmacionLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const confirmarLogout = async () => {
    setConfirmLogoutOpen(false);
    await logout();
    navigate(ROUTES.landing, { replace: true });
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'radio':
        return 'Radio en Vivo';
      case 'tv':
        return 'Televisión 24/7';
      case 'impresos':
        return 'Prensa e Impresos';
      default:
        return 'Monitoreo en Vivo';
    }
  };

  const handlePillClick = (pill: string) => {
    setActiveFilterPill(pill);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollBehavior: 'smooth',
      background: 'radial-gradient(130% 120% at 50% 0%, #465d34 0%, #354726 45%, #243219 100%)',
      color: '#FFFFFF',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ─── 1. TOP HEADER CON BARRA FLOTANTE INTEGRADA ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        zIndex: 50,
        background: 'rgba(53, 71, 38, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        {/* LOGO IZQUIERDA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={logoMayia}
            alt="MAYIA Escucha"
            style={{
              height: '38px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            }}
          />
        </div>

        {/* CENTRO: BARRA FLOTANTE DE PESTAÑAS (PILL NAVBAR) */}
        <nav style={{
          background: 'rgba(20, 28, 14, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '999px',
          padding: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.5)',
        }}>
          {secciones.map((sec: ItemMenu) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onSectionChange(sec.id)}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: isActive ? '8px 22px' : '8px 18px',
                  borderRadius: '999px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#0d130a' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                  boxShadow: isActive ? '0 4px 14px rgba(0, 0, 0, 0.45)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {sec.nombre}
              </button>
            );
          })}
        </nav>

        {/* DERECHA: PERFIL DE USUARIO Y BOTONES RÁPIDOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Tarjeta de usuario compacta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(20, 28, 14, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            padding: '4px 14px 4px 5px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#DBF285',
              color: '#0d130a',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                {session?.user?.name || 'Martín Cortés'}
              </div>
              <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.65)' }}>
                Auditoría & Monitoreo
              </div>
            </div>
          </div>

          {/* Notificaciones Interactivas */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
              title="Notificaciones"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: notificacionesAbiertas ? '#0d130a' : 'rgba(20, 28, 14, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <Bell size={16} />
              {notificacionesNoLeidas > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #141d0e',
                  padding: '0 2px',
                }}>
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>

            {/* Popover Dropdown de Notificaciones */}
            {notificacionesAbiertas && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '360px',
                maxHeight: '460px',
                background: '#0d130a',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.7)',
                overflow: 'hidden',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Header del dropdown */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Notificaciones</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{notificacionesNoLeidas} alertas sin leer</div>
                  </div>
                  {notificacionesNoLeidas > 0 && (
                    <button
                      onClick={marcarTodasComoLeidas}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#DBF285',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 8px',
                      }}
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>

                {/* Lista de alertas */}
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notificaciones.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => marcarComoLeida(notif.id)}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: notif.leida ? 'transparent' : 'rgba(219, 242, 133, 0.04)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.leida ? 'transparent' : 'rgba(219, 242, 133, 0.04)'; }}
                    >
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {getIconoPorTipo(notif.tipo)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: notif.leida ? 600 : 700, color: '#FFFFFF' }}>
                            {notif.titulo}
                          </div>
                          {!notif.leida && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DBF285', flexShrink: 0 }} />
                          )}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#9CA3AF', margin: '2px 0 4px', lineHeight: 1.35 }}>
                          {notif.mensaje}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                          {notif.tiempo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ajustes / Configuración de Perfil */}
          <button
            onClick={() => setSettingsOpen(true)}
            title="Configuración de Cuenta y Credenciales"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: settingsOpen ? '#0d130a' : 'rgba(20, 28, 14, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              transition: 'all 0.15s ease',
            }}
          >
            <Settings size={16} />
          </button>

          {/* Logout */}
          <button
            onClick={pedirConfirmacionLogout}
            title="Cerrar sesión"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(20, 28, 14, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ─── 2. SECCIÓN PRINCIPAL HERO / TELEMETRÍA ─── */}
      <div style={{
        maxWidth: '1360px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 28px 40px',
        flex: 1,
      }}>
        {/* Fila de Título Grande & Métricas de Telemetría */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '26px',
        }}>
          {/* Título e Indicador circular */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <h1 style={{
              fontSize: '44px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: 0,
              lineHeight: 1.05,
              color: '#FFFFFF',
            }}>
              {getSectionTitle()}
            </h1>

            {/* Medidor circular como en el screenshot */}
            <div style={{
              position: 'relative',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#1d2714',
              border: '2px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <svg width="56" height="56" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle
                  cx="28" cy="28" r="23"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="28" cy="28" r="23"
                  fill="transparent"
                  stroke="#DBF285"
                  strokeWidth="3.5"
                  strokeDasharray="144"
                  strokeDashoffset="14"
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                98%
              </span>
            </div>
          </div>

          {/* 3 Métricas Grandes al estilo de la referencia */}
          <div className="modern-telemetry-kpis" style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, marginBottom: '4px' }}>
                Total menciones
              </div>
              <div style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
                256,612<span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>$</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, marginBottom: '4px' }}>
                Spots detectados
              </div>
              <div style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
                167,612<span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>$</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, marginBottom: '4px' }}>
                Testigos en vivo
              </div>
              <div style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
                25,612<span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>$</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. BARRA HORIZONTAL DE SUB-FILTROS PILL ─── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '26px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {currentPills.map((pill) => {
              const isSelected = activeFilterPill === pill;
              return (
                <button
                  key={pill}
                  onClick={() => handlePillClick(pill)}
                  style={{
                    border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.22)',
                    background: isSelected ? '#0d130a' : 'transparent',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pill}
                </button>
              );
            })}
            <button
              title="Añadir filtro"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                background: 'transparent',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={exportarAuditoriaCSV}
              title="Exportar reporte CSV"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                background: 'transparent',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(219, 242, 133, 0.15)'; e.currentTarget.style.borderColor = '#DBF285'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)'; }}
            >
              <Upload size={16} />
            </button>
            <button
              title="Ajustes de visualización"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                background: 'transparent',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ─── 4. CONTENIDO / VISTAS DEL DASHBOARD ─── */}
        <div style={{ width: '100%' }}>
          {children}
        </div>
      </div>

      {/* Modal de Configuración y Credenciales de Cuenta */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Diálogo de Confirmación de Cierre de Sesión con Advertencias Claras */}
      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        title="¿Seguro que quieres cerrar sesión?"
        subtitle="Alerta de Seguridad · MAYIA Escucha"
        description="Estás a punto de salir de la consola de telemetría y auditoría en tiempo real de medios."
        warnings={[
          "Se detendrá la recepción de alertas y monitoreo on-air en este navegador.",
          "Cualquier filtro o consulta no guardada se restablecerá.",
          "El motor de detección en servidor continuará operando y registrando testigos 24/7.",
        ]}
        confirmText="Sí, cerrar sesión"
        cancelText="Permanecer conectado"
        danger={true}
        onConfirm={confirmarLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />

      {/* Banner flotante de precaución y confirmación de acciones del operador */}
      {toastAlerta.visible && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: toastAlerta.tipo === 'advertencia' ? '#181f13' : '#0d130a',
            border: toastAlerta.tipo === 'advertencia' ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(219, 242, 133, 0.35)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.15)',
            padding: '12px 18px',
            borderRadius: '16px',
            color: '#FFFFFF',
            fontSize: '13px',
            maxWidth: '420px',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {toastAlerta.tipo === 'advertencia' ? (
            <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle size={18} color="#DBF285" style={{ flexShrink: 0 }} />
          )}
          <span style={{ lineHeight: 1.4 }}>{toastAlerta.mensaje}</span>
        </div>
      )}
    </div>
  );
};
