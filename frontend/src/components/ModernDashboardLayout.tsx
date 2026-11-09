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
  Scale,
  ChevronDown,
  Radio,
  CheckCheck,
  Sparkles,
  ExternalLink,
  Activity,
  Clock,
} from 'lucide-react';
import logoMayia from '../assets/logo/mayiaEscuchaTrim.png';
import { useAuth } from '../features/auth';
import { navigate } from '../core/router';
import { ROUTES } from '../app/routes';
import { secciones, seccionesPrincipales, seccionesExtra, type ItemMenu } from '../config/menu';
import { SettingsModal } from './SettingsModal';
import { ConfirmDialog } from './ConfirmDialog';
import { LegalModal } from './LegalModal';

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
  academia: [
    'Todos los módulos',
    'Rutas por rol',
    'Guías operativas',
    'Tutoriales en video',
    'Manuales en PDF',
    'Preguntas frecuentes',
  ],
  noc: [
    'Centro NOC',
    'Salud de 147 streams',
    'Clusters de IA',
    'Log en vivo',
    'Mesa de Ayuda 24/7',
    'Levantar ticket',
  ],
  innovacion: [
    'Visión general',
    'Grafos de conocimiento',
    'Gemelos digitales',
    'Simulación What-If',
    'Brand Safety IA',
    'Roadmap 2027',
  ],
};

interface Notification {
  id: number;
  tipo: 'alerta' | 'exito' | 'info' | 'urgente' | 'radio';
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
  categoria?: 'radio' | 'tv' | 'impresos' | 'sistema';
  plaza?: string;
  linkSeccion?: string;
}

const notificacionesEstaticas: Notification[] = [
  {
    id: 1,
    tipo: 'radio',
    titulo: 'Detección On-Air · XEW-FM 96.9',
    mensaje: 'Spot de 20s para "Tiendas Aurora" verificado con 99.4% de coincidencia acústica.',
    tiempo: 'Hace 2 min',
    leida: false,
    categoria: 'radio',
    plaza: 'CDMX',
    linkSeccion: 'radio'
  },
  {
    id: 2,
    tipo: 'urgente',
    titulo: 'Televisión: Meta de precisión',
    mensaje: 'Canal Las Estrellas registró 96.8% en franja matutina (umbral contractual: 97.5%).',
    tiempo: 'Hace 8 min',
    leida: false,
    categoria: 'tv',
    plaza: 'Nacional',
    linkSeccion: 'tv'
  },
  {
    id: 3,
    tipo: 'exito',
    titulo: 'Catálogo Radio 147 Estaciones',
    mensaje: 'Sincronización completa de los 147 flujos AM/FM (CDMX: 62, GDL: 45, MTY: 40).',
    tiempo: 'Hace 45 min',
    leida: true,
    categoria: 'radio',
    linkSeccion: 'radio'
  },
  {
    id: 4,
    tipo: 'info',
    titulo: 'Impresos: Pauta de periódicos',
    mensaje: 'Digitalización OCR de 70 publicaciones diarias procesada sin discrepancias.',
    tiempo: 'Hace 2 horas',
    leida: true,
    categoria: 'impresos',
    linkSeccion: 'impresos'
  },
  {
    id: 5,
    tipo: 'exito',
    titulo: 'Motor Whisper Local v3 Activo',
    mensaje: 'Inferencia paralela en GPU local con latencia media de 1.4s por chunk de audio.',
    tiempo: 'Hace 3 horas',
    leida: true,
    categoria: 'sistema',
    linkSeccion: 'noc'
  }
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
  const [legalOpen, setLegalOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [toastAlerta, setToastAlerta] = useState<{ visible: boolean; mensaje: string; tipo: 'exito' | 'advertencia' }>({
    visible: false,
    mensaje: '',
    tipo: 'exito',
  });
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notification[]>(notificacionesEstaticas);
  const notifRef = useRef<HTMLDivElement>(null);

  const [menuExtrasAbierto, setMenuExtrasAbierto] = useState(false);
  const menuExtrasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuExtrasRef.current && !menuExtrasRef.current.contains(e.target as Node)) {
        setMenuExtrasAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const [filtroNotif, setFiltroNotif] = useState<'todas' | 'noleidas' | 'radio' | 'sistema'>('todas');

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarComoLeida = (id: number) =>
    setNotificaciones(notificaciones.map(n => (n.id === id ? { ...n, leida: true } : n)));

  const marcarTodasComoLeidas = () =>
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtroNotif === 'noleidas') return !n.leida;
    if (filtroNotif === 'radio') return n.categoria === 'radio';
    if (filtroNotif === 'sistema') return n.categoria === 'sistema' || n.categoria === 'tv' || n.categoria === 'impresos';
    return true;
  });

  const getIconoPorTipo = (tipo: Notification['tipo']) => {
    switch (tipo) {
      case 'radio':
        return (
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(219, 242, 133, 0.15)',
            border: '1px solid rgba(219, 242, 133, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DBF285'
          }}>
            <Radio size={16} />
          </div>
        );
      case 'urgente':
        return (
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F87171'
          }}>
            <AlertTriangle size={16} />
          </div>
        );
      case 'alerta':
        return (
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBBF24'
          }}>
            <AlertTriangle size={16} />
          </div>
        );
      case 'exito':
        return (
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399'
          }}>
            <CheckCircle size={16} />
          </div>
        );
      case 'info':
      default:
        return (
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8'
          }}>
            <Info size={16} />
          </div>
        );
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
    mostrarToast('Bitácora descargada correctamente.', 'exito');
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
      case 'academia':
        return 'Academia & Capacitación';
      case 'noc':
        return 'NOC & Mesa de Ayuda';
      case 'innovacion':
        return 'Innovación & Futuro';
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

        {/* CENTRO: BARRA FLOTANTE DE PESTAÑAS (PILL NAVBAR LIMPIA + MENÚ DESPLEGABLE EXTRAS) */}
        <nav style={{
          background: 'rgba(20, 28, 14, 0.7)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '999px',
          padding: '5px 7px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.55)',
          position: 'relative',
        }}>
          {/* Secciones Principales de Uso Operativo Directo */}
          {seccionesPrincipales.map((sec: ItemMenu) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  onSectionChange(sec.id);
                  setMenuExtrasAbierto(false);
                }}
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

          {/* Separador vertical sutil */}
          <div style={{
            width: '1px',
            height: '20px',
            background: 'rgba(255, 255, 255, 0.15)',
            margin: '0 4px',
          }} />

          {/* Botón de Menú Desplegable: Opciones Extra */}
          <div ref={menuExtrasRef} style={{ position: 'relative' }}>
            {(() => {
              const seccionExtraActiva = seccionesExtra.find(s => s.id === activeSection);
              return (
                <>
                  <button
                    onClick={() => setMenuExtrasAbierto(!menuExtrasAbierto)}
                    style={{
                      border: seccionExtraActiva ? '1px solid rgba(219, 242, 133, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      padding: '8px 18px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: seccionExtraActiva ? 700 : 600,
                      background: seccionExtraActiva ? '#0d130a' : menuExtrasAbierto ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                      color: seccionExtraActiva ? '#DBF285' : 'rgba(255, 255, 255, 0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: seccionExtraActiva ? '0 4px 14px rgba(219, 242, 133, 0.2)' : 'none',
                      transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{seccionExtraActiva ? seccionExtraActiva.nombre : 'Opciones Extra'}</span>
                    <ChevronDown
                      size={14}
                      style={{
                        transform: menuExtrasAbierto ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                        color: seccionExtraActiva ? '#DBF285' : 'rgba(255, 255, 255, 0.6)',
                      }}
                    />
                  </button>

                  {/* Popover Dropdown de Opciones Extra */}
                  {menuExtrasAbierto && (
                    <div style={{
                      position: 'absolute',
                      top: '48px',
                      right: '0',
                      width: '320px',
                      background: '#0d130a',
                      border: '1px solid rgba(219, 242, 133, 0.25)',
                      borderRadius: '22px',
                      boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 30px rgba(219, 242, 133, 0.08)',
                      padding: '8px',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      animation: 'fadeIn 0.15s ease',
                    }}>
                      <div style={{
                        padding: '10px 14px 6px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#9CA3AF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span>Servicios & Herramientas Extra</span>
                        <span style={{ color: '#DBF285', fontSize: '10px' }}>3 módulos</span>
                      </div>

                      {seccionesExtra.map((extra) => {
                        const Icon = extra.icono;
                        const isAct = activeSection === extra.id;
                        return (
                          <button
                            key={extra.id}
                            onClick={() => {
                              onSectionChange(extra.id);
                              setMenuExtrasAbierto(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '14px',
                              border: isAct ? '1px solid rgba(219, 242, 133, 0.35)' : '1px solid transparent',
                              background: isAct ? 'rgba(219, 242, 133, 0.1)' : 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              width: '100%',
                            }}
                            onMouseEnter={(e) => {
                              if (!isAct) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isAct) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '12px',
                              background: isAct ? '#DBF285' : 'rgba(255, 255, 255, 0.06)',
                              color: isAct ? '#0d130a' : '#DBF285',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Icon size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: isAct ? '#DBF285' : '#FFFFFF',
                                marginBottom: '2px',
                              }}>
                                {extra.nombre}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#9CA3AF',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.3,
                              }}>
                                {extra.descripcion}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
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
              title="Centro de Alertas & Telemetría"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: notificacionesAbiertas ? '#0d130a' : 'rgba(20, 28, 14, 0.5)',
                border: notificacionesAbiertas ? '1px solid #DBF285' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: notificacionesAbiertas ? '#DBF285' : '#FFFFFF',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <Bell size={16} />
              {notificacionesNoLeidas > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '999px',
                  background: '#DBF285',
                  color: '#0d130a',
                  fontSize: '9.5px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #0d130a',
                  padding: '0 3px',
                  boxShadow: '0 0 10px rgba(219, 242, 133, 0.6)'
                }}>
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>

            {/* Popover Dropdown de Notificaciones Mejorado */}
            {notificacionesAbiertas && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '390px',
                maxHeight: '520px',
                background: 'rgba(13, 19, 10, 0.96)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 24px 60px -10px rgba(0,0,0,0.85), 0 0 1px 1px rgba(219, 242, 133, 0.15)',
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
                  background: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(219, 242, 133, 0.15)',
                      border: '1px solid rgba(219, 242, 133, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#DBF285'
                    }}>
                      <Bell size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                        Alertas & Telemetría
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        {notificacionesNoLeidas} alertas sin leer · Monitoreo 24/7
                      </div>
                    </div>
                  </div>

                  {notificacionesNoLeidas > 0 && (
                    <button
                      onClick={marcarTodasComoLeidas}
                      style={{
                        background: 'rgba(219, 242, 133, 0.1)',
                        border: '1px solid rgba(219, 242, 133, 0.25)',
                        color: '#DBF285',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <CheckCheck size={12} /> Marcar leídas
                    </button>
                  )}
                </div>

                {/* Filtros de notificaciones */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  {[
                    { id: 'todas', label: 'Todas', count: notificaciones.length },
                    { id: 'noleidas', label: 'Sin leer', count: notificacionesNoLeidas },
                    { id: 'radio', label: 'Radio (147)', count: notificaciones.filter(n => n.categoria === 'radio').length },
                    { id: 'sistema', label: 'Sistema & TV', count: notificaciones.filter(n => n.categoria !== 'radio').length },
                  ].map(f => {
                    const activo = filtroNotif === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFiltroNotif(f.id as any)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: activo ? 800 : 500,
                          cursor: 'pointer',
                          border: activo ? '1px solid #DBF285' : '1px solid rgba(255, 255, 255, 0.08)',
                          background: activo ? 'rgba(219, 242, 133, 0.15)' : 'transparent',
                          color: activo ? '#DBF285' : '#9CA3AF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {f.label}
                        <span style={{ fontSize: '9.5px', opacity: activo ? 0.9 : 0.6 }}>({f.count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lista de alertas */}
                <div style={{ maxHeight: '330px', overflowY: 'auto' }}>
                  {notificacionesFiltradas.length === 0 ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center', color: '#6B7280', fontSize: '12.5px' }}>
                      Sin notificaciones en esta vista.
                    </div>
                  ) : (
                    notificacionesFiltradas.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => marcarComoLeida(notif.id)}
                        style={{
                          padding: '13px 18px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          borderLeft: notif.leida ? '3px solid transparent' : '3px solid #DBF285',
                          background: notif.leida ? 'transparent' : 'rgba(219, 242, 133, 0.04)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.leida ? 'transparent' : 'rgba(219, 242, 133, 0.04)'; }}
                      >
                        <div style={{ marginTop: '1px', flexShrink: 0 }}>
                          {getIconoPorTipo(notif.tipo)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '13px', fontWeight: notif.leida ? 600 : 700, color: '#FFFFFF' }}>
                              {notif.titulo}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {notif.plaza && (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: '#DBF285',
                                  background: 'rgba(219, 242, 133, 0.12)',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {notif.plaza}
                                </span>
                              )}
                              {!notif.leida && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DBF285', flexShrink: 0 }} className="animate-pulse" />
                              )}
                            </div>
                          </div>

                          <div style={{ fontSize: '12px', color: '#D1D5DB', margin: '3px 0 6px', lineHeight: 1.4 }}>
                            {notif.mensaje}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '10.5px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} /> {notif.tiempo}
                            </div>

                            {notif.linkSeccion && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  marcarComoLeida(notif.id);
                                  onSectionChange(notif.linkSeccion!);
                                  setNotificacionesAbiertas(false);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#DBF285',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: '2px 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                Ver módulo <ExternalLink size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer del dropdown */}
                <div style={{
                  padding: '12px 18px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399' }} className="animate-pulse" />
                    <span>147 flujos activos en CDMX, GDL y MTY</span>
                  </div>
                  <button
                    onClick={() => {
                      onSectionChange('noc');
                      setNotificacionesAbiertas(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DBF285',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    NOC & Salud ↗
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Marco Legal & Confidencialidad */}
          <button
            onClick={() => setLegalOpen(true)}
            title="Marco Legal, Confidencialidad & Términos ACAM"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: legalOpen ? '#0d130a' : 'rgba(20, 28, 14, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              transition: 'all 0.15s ease',
            }}
          >
            <Scale size={16} />
          </button>

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

      {/* Diálogo de Confirmación de Cierre de Sesión Minimalista */}
      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        title="Cerrar sesión"
        subtitle="Sesión"
        description="¿Deseas salir de tu cuenta? Podrás volver a ingresar en cualquier momento con tus credenciales."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        danger={true}
        onConfirm={confirmarLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />

      {/* Modal de Información Legal, Confidencialidad & Términos ACAM */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
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
