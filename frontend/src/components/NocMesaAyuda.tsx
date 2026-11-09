import React, { useState } from 'react';
import {
  Activity,
  Headphones,
  Server,
  Radio,
  Tv,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PhoneCall,
  MessageSquare,
  Mail,
  Send,
  Zap,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Search,
  Check,
  XCircle,
} from 'lucide-react';
import { ACENTO, D, Modulo, th, td } from './shared/dark';
import { inner, useIsMobile } from './shared/ui';
import { FONDO_TECH } from '../config/tema';

interface Ticket {
  id: string;
  fecha: string;
  asunto: string;
  medio: string;
  plaza: string;
  severidad: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  estatus: 'En análisis' | 'En atención' | 'Resuelto';
  tecnico: string;
}

const TICKETS_INICIALES: Ticket[] = [
  {
    id: 'TICK-2026-4091',
    fecha: '09-11-2026 09:15',
    asunto: 'Discrepancia de duración spot Tiendas Aurora (declarado 30s, detectado 20s)',
    medio: 'Radio (Los 40 101.7 FM)',
    plaza: 'CDMX',
    severidad: 'Media',
    estatus: 'En análisis',
    tecnico: 'Ing. Rodrigo Vega (NOC)',
  },
  {
    id: 'TICK-2026-4089',
    fecha: '09-11-2026 08:30',
    asunto: 'Micro-corte de audio en stream Icecast de La Mejor 93.9 FM',
    medio: 'Radio (La Mejor GDL)',
    plaza: 'Guadalajara',
    severidad: 'Alta',
    estatus: 'Resuelto',
    tecnico: 'Ing. Samantha Ruiz (NOC)',
  },
  {
    id: 'TICK-2026-4082',
    fecha: '08-11-2026 19:40',
    asunto: 'Validación de super-imposición (overlay) en transmisión nocturna de fútbol',
    medio: 'Televisión (Canal 5)',
    plaza: 'Nacional',
    severidad: 'Baja',
    estatus: 'Resuelto',
    tecnico: 'Lic. Mariana Soto (Auditoría)',
  },
];

const SENALES_NOC = [
  { nombre: 'Radio Fórmula 103.3 FM', tipo: 'Radio FM', plaza: 'CDMX', bitrate: '128 kbps', latencia: '1.1s', db: '-14 LUFS', estado: 'online' },
  { nombre: 'W Radio 96.9 FM', tipo: 'Radio FM', plaza: 'CDMX', bitrate: '128 kbps', latencia: '0.9s', db: '-13.8 LUFS', estado: 'online' },
  { nombre: 'Los 40 101.7 FM', tipo: 'Radio FM', plaza: 'CDMX', bitrate: '128 kbps', latencia: '1.2s', db: '-14.2 LUFS', estado: 'online' },
  { nombre: 'La Mejor GDL 93.9 FM', tipo: 'Radio FM', plaza: 'Guadalajara', bitrate: '128 kbps', latencia: '1.4s', db: '-14.0 LUFS', estado: 'online' },
  { nombre: 'Exa FM 91.1 FM', tipo: 'Radio FM', plaza: 'Guadalajara', bitrate: '128 kbps', latencia: '1.3s', db: '-13.9 LUFS', estado: 'online' },
  { nombre: 'Multimedios Stereo 101.7 FM', tipo: 'Radio FM', plaza: 'Monterrey', bitrate: '128 kbps', latencia: '1.5s', db: '-14.1 LUFS', estado: 'online' },
  { nombre: 'Las Estrellas HD', tipo: 'TV Abierta', plaza: 'CDMX / Nal', bitrate: '6.2 Mbps', latencia: '2.1s', db: '1080p60', estado: 'online' },
  { nombre: 'Azteca 7 HD', tipo: 'TV Abierta', plaza: 'CDMX / Nal', bitrate: '5.8 Mbps', latencia: '2.0s', db: '1080p60', estado: 'online' },
  { nombre: 'ESPN México Feed 1', tipo: 'TV Paga', plaza: 'Nacional', bitrate: '7.5 Mbps', latencia: '2.4s', db: '1080p60', estado: 'degradado' },
];

export const NocMesaAyuda: React.FC = () => {
  const m = useIsMobile();
  const [tabPrincipal, setTabPrincipal] = useState<'noc' | 'mesa'>('noc');
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_INICIALES);
  const [filtroPlaza, setFiltroPlaza] = useState('Todas');

  // Formulario de Ticket
  const [asunto, setAsunto] = useState('');
  const [medio, setMedio] = useState('Radio');
  const [plazaTicket, setPlazaTicket] = useState('CDMX');
  const [severidad, setSeveridad] = useState<'Crítica' | 'Alta' | 'Media' | 'Baja'>('Media');
  const [descripcion, setDescripcion] = useState('');
  const [ticketEnviado, setTicketEnviado] = useState(false);
  const [ultimoFolio, setUltimoFolio] = useState('');

  const handleCrearTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim() || !descripcion.trim()) return;

    const folio = `TICK-2026-${Math.floor(4100 + Math.random() * 800)}`;
    const fechaActual = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
      new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

    const nuevoTicket: Ticket = {
      id: folio,
      fecha: fechaActual,
      asunto,
      medio: `${medio} (${plazaTicket})`,
      plaza: plazaTicket,
      severidad,
      estatus: 'En análisis',
      tecnico: 'Guardia NOC (Asignando)',
    };

    setTickets([nuevoTicket, ...tickets]);
    setUltimoFolio(folio);
    setTicketEnviado(true);
    setAsunto('');
    setDescripcion('');
  };

  const senalesFiltradas = SENALES_NOC.filter(
    s => filtroPlaza === 'Todas' || s.plaza.includes(filtroPlaza)
  );

  return (
    <div style={{ minHeight: '100%', padding: m ? 16 : 28, ...FONDO_TECH }}>
      <div style={inner}>
        {/* Cabecera Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0d160b 0%, #070d06 100%)',
          border: '1px solid rgba(219, 242, 133, 0.2)',
          borderRadius: 28,
          padding: m ? '20px' : '26px 30px',
          marginBottom: 24,
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: m ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: m ? 'flex-start' : 'center',
          gap: 20,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 999,
              background: 'rgba(219, 242, 133, 0.12)',
              border: '1px solid rgba(219, 242, 133, 0.3)',
              color: ACENTO,
              fontSize: '11.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}>
              <Activity size={15} />
              Telemetría de Red & Mesa de Ayuda 24/7
            </div>
            <h1 style={{
              fontSize: m ? 24 : 32,
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              NOC & Mesa de Ayuda ACAM
            </h1>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: D.sub,
              maxWidth: 680,
              lineHeight: 1.5,
            }}>
              Supervisión de salud de señales en vivo (147 emisoras y canales de TV) y centro de contacto directo para resolución de incidencias técnicas.
            </p>
          </div>

          {/* Selector de Pestañas NOC vs Mesa de Ayuda */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 999,
            padding: '5px',
            display: 'flex',
            gap: 4,
          }}>
            <button
              onClick={() => setTabPrincipal('noc')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 999,
                border: 'none',
                background: tabPrincipal === 'noc' ? ACENTO : 'transparent',
                color: tabPrincipal === 'noc' ? '#0d130a' : '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Activity size={16} />
              Centro NOC (Telemetría)
            </button>
            <button
              onClick={() => setTabPrincipal('mesa')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 999,
                border: 'none',
                background: tabPrincipal === 'mesa' ? ACENTO : 'transparent',
                color: tabPrincipal === 'mesa' ? '#0d130a' : '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Headphones size={16} />
              Mesa de Ayuda (Soporte)
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════ */}
        {/* VISTA 1: CENTRO DE OPERACIONES DE RED (NOC)               */}
        {/* ═════════════════════════════════════════════════════════ */}
        {tabPrincipal === 'noc' && (
          <>
            {/* Tarjetas de Métricas de Salud del NOC */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: m ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}>
              {[
                { label: 'Uptime Global SLA', valor: '99.98%', sub: 'Meta contractual: 99.9%', icono: ShieldAlert, color: '#10B981' },
                { label: 'Estaciones de Radio', valor: '147 / 147', sub: '100% on-air en CDMX, GDL, MTY', icono: Radio, color: ACENTO },
                { label: 'Canales de TV 24/7', valor: '98 / 100', sub: '2 canales en re-enrutamiento', icono: Tv, color: '#F59E0B' },
                { label: 'Latencia Inferencia IA', valor: '1.18 s', sub: 'Whisper chunking 5.0s', icono: Zap, color: ACENTO },
              ].map((kpi, idx) => {
                const Icon = kpi.icono;
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#0d130a',
                      border: '1px solid rgba(219, 242, 133, 0.15)',
                      borderRadius: 22,
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>{kpi.label}</span>
                      <Icon size={18} color={kpi.color} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                      {kpi.valor}
                    </div>
                    <div style={{ fontSize: '11px', color: D.sub }}>{kpi.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Fila: Grid de Salud de Señales y Consola de Eventos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: m ? '1fr' : '1.35fr 1fr',
              gap: 20,
              marginBottom: 24,
            }}>
              {/* Tabla de Salud de Señales */}
              <Modulo
                id="noc-streams"
                title="ESTADO DE TRANSMISIÓN DE EMISORAS & CANALES"
                right={
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Todas', 'CDMX', 'Guadalajara', 'Monterrey'].map(p => (
                      <button
                        key={p}
                        onClick={() => setFiltroPlaza(p)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: 'none',
                          background: filtroPlaza === p ? ACENTO : 'rgba(255,255,255,0.06)',
                          color: filtroPlaza === p ? '#0d130a' : '#9CA3AF',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                }
              >
                <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr>
                        <th style={th}>Emisora / Canal</th>
                        <th style={th}>Plaza</th>
                        <th style={th}>Bitrate / Calidad</th>
                        <th style={th}>Latencia</th>
                        <th style={th}>Estatus NOC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {senalesFiltradas.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={td}>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{s.nombre}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{s.tipo}</div>
                          </td>
                          <td style={td}>{s.plaza}</td>
                          <td style={td}>{s.bitrate} <span style={{ color: '#9CA3AF', fontSize: '11px' }}>({s.db})</span></td>
                          <td style={td}>{s.latencia}</td>
                          <td style={td}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 8px',
                              borderRadius: 999,
                              fontSize: '11px',
                              fontWeight: 700,
                              background: s.estado === 'online' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: s.estado === 'online' ? '#10B981' : '#F59E0B',
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.estado === 'online' ? '#10B981' : '#F59E0B' }} />
                              {s.estado === 'online' ? 'En línea' : 'Monitoreando'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Modulo>

              {/* Consola de Eventos y Carga de Nodos IA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Carga de Nodos de Inferencia */}
                <Modulo title="INFRAESTRUCTURA DE CLUSTERS IA">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { nodo: 'Cluster CDMX (Whisper-v3 Procs)', cpu: '38%', mem: '14.2 / 32 GB', temp: '54°C', ok: true },
                      { nodo: 'Cluster GDL (Audio & Video OCR)', cpu: '44%', mem: '18.1 / 32 GB', temp: '58°C', ok: true },
                      { nodo: 'Cluster MTY (Transcoder Stream)', cpu: '32%', mem: '11.5 / 32 GB', temp: '51°C', ok: true },
                    ].map((nodo, i) => (
                      <div key={i} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{nodo.nodo}</span>
                          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>Saludable</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
                          <span>Carga CPU: <strong style={{ color: '#FFFFFF' }}>{nodo.cpu}</strong></span>
                          <span>RAM: <strong style={{ color: '#FFFFFF' }}>{nodo.mem}</strong></span>
                          <span>Temp: <strong style={{ color: '#FFFFFF' }}>{nodo.temp}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Modulo>

                {/* Log Terminal de Eventos NOC */}
                <Modulo title="LOG DE INCIDENCIAS EN VIVO (TERMINAL NOC)">
                  <div style={{
                    background: '#040703',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: '12px 14px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#A7F3D0',
                    lineHeight: 1.6,
                    maxHeight: '160px',
                    overflowY: 'auto',
                  }}>
                    <div>[09:54:02] [NOC-CORE] Sincronización NTP CENAM verificada. Offset: &lt;1.2ms.</div>
                    <div>[09:52:18] [INGEST] Chunk #8194 transcrito en 1.14s (Los 40 101.7 FM).</div>
                    <div>[09:48:41] [WHISPER] Detección de keyword "Aurora" confirmada con score 0.98.</div>
                    <div>[09:41:09] [STREAM] Reintento de buffer HLS TV-ESPN mitigado sin pérdida.</div>
                    <div>[09:30:00] [HEALTH] 147 estaciones transmitiendo señal estable.</div>
                  </div>
                </Modulo>
              </div>
            </div>
          </>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* VISTA 2: MESA DE AYUDA Y SOPORTE 24/7                     */}
        {/* ═════════════════════════════════════════════════════════ */}
        {tabPrincipal === 'mesa' && (
          <>
            {/* Canales de Contacto Rápido */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: m ? '1fr' : 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}>
              <div style={{
                background: '#0d130a',
                border: '1px solid rgba(219, 242, 133, 0.25)',
                borderRadius: 22,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 16,
                  background: 'rgba(219, 242, 133, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: ACENTO,
                  flexShrink: 0,
                }}>
                  <PhoneCall size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: 600 }}>Línea Directa Urgencias NOC</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>+52 55 8000-ACAM</div>
                  <div style={{ fontSize: '11px', color: ACENTO }}>Atención 24/7 · Ext. 911</div>
                </div>
              </div>

              <div style={{
                background: '#0d130a',
                border: '1px solid rgba(219, 242, 133, 0.25)',
                borderRadius: 22,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 16,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  flexShrink: 0,
                }}>
                  <MessageSquare size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: 600 }}>WhatsApp Guardia Técnica</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>+52 55 9876 5432</div>
                  <div style={{ fontSize: '11px', color: '#10B981' }}>Tiempo de respuesta &lt; 5 min</div>
                </div>
              </div>

              <div style={{
                background: '#0d130a',
                border: '1px solid rgba(219, 242, 133, 0.25)',
                borderRadius: 22,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 16,
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  flexShrink: 0,
                }}>
                  <Mail size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: 600 }}>Mesa de Tickets Oficial</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>soporte@edgenet.ai</div>
                  <div style={{ fontSize: '11px', color: '#38BDF8' }}>SLA contractual garantizado</div>
                </div>
              </div>
            </div>

            {/* Fila: Formulario para Reportar Falla & Bitácora de Tickets */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: m ? '1fr' : '1.15fr 1.35fr',
              gap: 20,
              alignItems: 'flex-start',
            }}>
              {/* Formulario */}
              <Modulo
                id="noc-tickets"
                title="REPORTAR DISCREPANCIA O SOLICITAR ASISTENCIA"
                right={<span style={{ fontSize: '11px', color: ACENTO }}>Folio automático inmediato</span>}
              >
                {ticketEnviado && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10B981',
                    borderRadius: 14,
                    padding: '14px 18px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '12.5px', color: '#FFFFFF' }}>
                      Ticket <strong>{ultimoFolio}</strong> creado con éxito. Un ingeniero del NOC ha tomado la asignación.
                    </div>
                  </div>
                )}

                <form onSubmit={handleCrearTicket} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                      Asunto o Resumen de la Falla *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Discrepancia en spot de Tiendas Aurora en 103.3 FM..."
                      value={asunto}
                      onChange={e => setAsunto(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                        Medio
                      </label>
                      <select
                        value={medio}
                        onChange={e => setMedio(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: '#0d130a',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      >
                        <option value="Radio">Radio AM/FM</option>
                        <option value="Televisión">Televisión</option>
                        <option value="Impresos">Prensa Escrita</option>
                        <option value="Plataforma">Acceso / Plataforma</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                        Plaza
                      </label>
                      <select
                        value={plazaTicket}
                        onChange={e => setPlazaTicket(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: '#0d130a',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      >
                        <option value="CDMX">CDMX</option>
                        <option value="Guadalajara">Guadalajara</option>
                        <option value="Monterrey">Monterrey</option>
                        <option value="Nacional">Nacional / Todas</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                        Severidad
                      </label>
                      <select
                        value={severidad}
                        onChange={e => setSeveridad(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: '#0d130a',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      >
                        <option value="Baja">Baja (Consulta)</option>
                        <option value="Media">Media (Ajuste)</option>
                        <option value="Alta">Alta (Urgente)</option>
                        <option value="Crítica">Crítica (SLA en riesgo)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                      Descripción Detallada *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe la inconsistencia detectada, hora aproximada, dial o canal, y cualquier detalle relevante para la auditoría..."
                      value={descripcion}
                      onChange={e => setDescripcion(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: ACENTO,
                      color: '#0d130a',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 20px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 4px 16px rgba(219, 242, 133, 0.3)',
                    }}
                  >
                    <Send size={16} />
                    Enviar Ticket a Mesa de Ayuda
                  </button>
                </form>
              </Modulo>

              {/* Bitácora de Tickets */}
              <Modulo
                title="ESTADO DE TICKETS & REPORTES ABIERTOS"
                right={<span style={{ fontSize: '12px', color: '#9CA3AF' }}>{tickets.length} solicitudes activas</span>}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 16,
                        padding: '14px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: ACENTO }}>{tkt.id}</span>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: tkt.severidad === 'Crítica' ? '#EF4444' : tkt.severidad === 'Alta' ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                          }}>
                            {tkt.severidad}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 999,
                          background: tkt.estatus === 'Resuelto' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(219, 242, 133, 0.15)',
                          color: tkt.estatus === 'Resuelto' ? '#10B981' : ACENTO,
                        }}>
                          {tkt.estatus}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                        {tkt.asunto}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', flexWrap: 'wrap', gap: 6 }}>
                        <span>Medio: <strong style={{ color: '#FFFFFF' }}>{tkt.medio}</strong></span>
                        <span>Asignado: <strong style={{ color: '#FFFFFF' }}>{tkt.tecnico}</strong></span>
                        <span>{tkt.fecha}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Modulo>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

