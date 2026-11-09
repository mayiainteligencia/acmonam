import React, { useState, useRef, useEffect } from 'react';
import { Radio, Sparkles, Check, X, FileAudio, Cloud, Volume2, VolumeX, Play, Square, ChevronLeft, ChevronRight, Activity, Calendar, Sliders } from 'lucide-react';

interface BentoGridProps {
  onExploreSection?: (sectionId: string) => void;
}

const ESTACIONES_BENTO = [
  {
    nombre: 'W Radio',
    dial: '96.9 FM',
    siglas: 'XEW-FM',
    plaza: 'CDMX',
    grupo: 'Radiópolis',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_MEXICO_SC',
    cobertura: 'CDMX · Guadalajara · Monterrey'
  },
  {
    nombre: 'Radio 620',
    dial: '620 AM',
    siglas: 'XENK-AM',
    plaza: 'CDMX',
    grupo: 'Cadena Rasa',
    streamUrl: 'https://stream.zeno.fm/smm679phup8uv',
    cobertura: 'CDMX y Área Metropolitana'
  },
  {
    nombre: 'Radio Centro',
    dial: '1030 AM',
    siglas: 'XEQR-AM',
    plaza: 'CDMX',
    grupo: 'Grupo Radio Centro',
    streamUrl: 'https://27063.live.streamtheworld.com/XEQR_AM_SC',
    cobertura: 'Cadena Nacional Centro'
  },
  {
    nombre: 'Radio Fórmula',
    dial: '103.3 FM',
    siglas: 'XERFR-FM',
    plaza: 'CDMX',
    grupo: 'Radio Fórmula',
    streamUrl: 'https://www.radioformula.com.mx/en-vivo/1470-am',
    cobertura: 'Primera Cadena Nacional'
  },
  {
    nombre: 'Amor',
    dial: '95.3 FM',
    siglas: 'XHSH-FM',
    plaza: 'CDMX',
    grupo: 'Grupo ACIR',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/XHSHFM_SC',
    cobertura: 'Red Nacional Romántica'
  }
];

export const AestheticBentoGrid: React.FC<BentoGridProps> = ({ onExploreSection }) => {
  // Fecha real de hoy
  const hoy = new Date();
  const diaHoy = hoy.getDate(); // ej: 9
  const mesNombreCorto = hoy.toLocaleDateString('es-MX', { month: 'short' }); // "nov"
  const mesNombreLargo = hoy.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }); // "noviembre 2026"
  const totalDiasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate(); // 30

  const [selectedDay, setSelectedDay] = useState(diaHoy);
  const [selectedMode, setSelectedMode] = useState<'auto' | 'audit'>('audit');
  const [whiteCard1Active, setWhiteCard1Active] = useState(true);
  const [whiteCard2Active, setWhiteCard2Active] = useState(true);
  const [activePlaza, setActivePlaza] = useState<'CDMX' | 'GDL' | 'MTY'>('CDMX');

  // Control de estación activa y streaming en vivo
  const [indiceEstacion, setIndiceEstacion] = useState(0);
  const estacion = ESTACIONES_BENTO[indiceEstacion];
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mute, setMute] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lista de días con detección registrada
  const diasConTestigos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 22, 25];

  const handleTogglePlay = () => {
    if (reproduciendo) {
      audioRef.current?.pause();
      setReproduciendo(false);
    } else {
      if (audioRef.current && estacion.streamUrl) {
        audioRef.current.src = estacion.streamUrl;
        audioRef.current.play().then(() => setReproduciendo(true)).catch(() => {});
      }
    }
  };

  const handleCambiarEstacion = (delta: number) => {
    const sig = (indiceEstacion + delta + ESTACIONES_BENTO.length) % ESTACIONES_BENTO.length;
    setIndiceEstacion(sig);
    if (reproduciendo && audioRef.current) {
      audioRef.current.src = ESTACIONES_BENTO[sig].streamUrl;
      audioRef.current.play().catch(() => {});
    }
  };

  // Días del calendario (hasta 28 o 30)
  const days = Array.from({ length: Math.min(28, totalDiasMes) }, (_, i) => i + 1);

  // KPIs dinámicos y objetivos según modo
  const kpiModo = {
    audit: { precision: '≥ 97.5%', label: '/ meta SLA', desc: 'Auditoría comercial forense ACAM' },
    auto: { precision: 'Activo', label: '/ telemetría', desc: 'Detección continua Whisper 24/7' }
  }[selectedMode];

  // Datos reales de plaza activa
  const infoPlaza = {
    CDMX: { estaciones: '62', estado: '24/7 En directo', detalle: '42 FM · 20 AM al aire' },
    GDL: { estaciones: '45', estado: '24/7 En directo', detalle: '38 FM · 7 AM (Jalisco/Zapopan)' },
    MTY: { estaciones: '40', estado: '24/7 En directo', detalle: '38 FM · 2 AM (Nuevo León)' }
  }[activePlaza];

  return (
    <div
      className="aesthetic-bento-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)',
        gap: '20px',
        marginBottom: '28px',
      }}
    >
      <style>{`
        @keyframes bentoEqualizer {
          0%, 100% { height: 18%; }
          50% { height: 95%; }
        }
        @keyframes pulseGlowLime {
          0%, 100% { box-shadow: 0 0 0 0 rgba(219, 242, 133, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(219, 242, 133, 0); }
        }
      `}</style>

      {/* Reproductor oculto */}
      <audio
        ref={audioRef}
        muted={mute}
        onEnded={() => setReproduciendo(false)}
        onError={() => setReproduciendo(false)}
      />

      {/* ─── 1. TARJETA NEGRA TECH (Izquierda) ─── */}
      <div style={{
        background: '#0d130a',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cabecera de la tarjeta: Estación activa interactiva + Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Botón de reproducción de audio en vivo */}
            <button
              onClick={handleTogglePlay}
              title={reproduciendo ? 'Pausar audio de transmisión' : 'Escuchar transmisión on-air en vivo'}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: reproduciendo ? '#DBF285' : '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: reproduciendo ? '0 0 20px rgba(219, 242, 133, 0.6)' : '0 4px 12px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {reproduciendo ? (
                <Square size={18} color="#0d130a" fill="#0d130a" />
              ) : (
                <Play size={20} color="#0d130a" fill="#0d130a" style={{ marginLeft: '2px' }} />
              )}
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {estacion.nombre} {estacion.dial}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: reproduciendo ? '#0d130a' : '#DBF285',
                  background: reproduciendo ? '#DBF285' : 'rgba(219, 242, 133, 0.15)',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: reproduciendo ? '#0d130a' : '#10B981'
                  }} className="animate-pulse" />
                  {reproduciendo ? 'TRANSMITIENDO EN VIVO' : 'ON-AIR 24/7'}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#9CA3AF', marginTop: '2px' }}>
                {estacion.siglas} · {estacion.grupo} · {estacion.cobertura}
              </div>
            </div>
          </div>

          {/* Selector de estaciones y Plazas Clave */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Plazas insignias */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { label: 'CD', title: 'CDMX: 62 estaciones' },
                { label: 'GD', title: 'Guadalajara: 45 estaciones' },
                { label: 'MT', title: 'Monterrey: 40 estaciones' }
              ].map((p, i) => (
                <div
                  key={i}
                  title={p.title}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: ['#3f5728', '#2e411d', '#557237'][i],
                    border: '2px solid #0d130a',
                    marginLeft: i > 0 ? '-8px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: 'default'
                  }}
                >
                  {p.label}
                </div>
              ))}
              <div
                title="147 estaciones totales AM/FM auditadas"
                style={{
                  padding: '0 8px',
                  height: '32px',
                  borderRadius: '999px',
                  background: 'rgba(219, 242, 133, 0.18)',
                  border: '2px solid #0d130a',
                  marginLeft: '-8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#DBF285',
                }}
              >
                147
              </div>
            </div>

            {/* Flechas para cambiar entre estaciones destacadas */}
            <button
              onClick={() => handleCambiarEstacion(-1)}
              title="Estación anterior"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => handleCambiarEstacion(1)}
              title="Siguiente estación"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* 3 Sub-bloques interiores */}
        <div
          className="aesthetic-bento-inner-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.1fr 1.3fr',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          {/* Sub-bloque 1: Calendario Dinámico y Real de Captura */}
          <div style={{
            background: '#161c12',
            borderRadius: '24px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} color="#DBF285" /> Fecha de captura
                </div>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: selectedDay === diaHoy ? '#0d130a' : '#DBF285',
                  background: selectedDay === diaHoy ? '#DBF285' : 'rgba(219, 242, 133, 0.15)',
                  padding: '2px 7px',
                  borderRadius: '999px'
                }}>
                  {selectedDay === diaHoy ? `Hoy · ${diaHoy} ${mesNombreCorto}` : `${selectedDay} ${mesNombreCorto}`}
                </span>
              </div>

              {/* Días de la semana */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '2px',
                textAlign: 'center',
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#6B7280',
                marginBottom: '4px'
              }}>
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>

              {/* Matriz de Días */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                textAlign: 'center',
                fontSize: '11px',
              }}>
                {days.map((d) => {
                  const isSelected = d === selectedDay;
                  const isToday = d === diaHoy;
                  const hasWitnesses = diasConTestigos.includes(d);

                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      title={isToday ? `Hoy (${d} de ${mesNombreLargo}): Auditoría en curso` : `Día ${d}: Auditoría de emisiones`}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? '#FFFFFF' : isToday ? 'rgba(219, 242, 133, 0.25)' : 'transparent',
                        color: isSelected ? '#000000' : isToday ? '#DBF285' : '#9CA3AF',
                        fontWeight: isSelected || isToday ? 800 : 500,
                        border: isToday && !isSelected ? '1.5px solid #DBF285' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 'auto',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{d}</span>
                      {hasWitnesses && !isSelected && (
                        <span style={{
                          position: 'absolute',
                          bottom: '1px',
                          width: '3px',
                          height: '3px',
                          borderRadius: '50%',
                          background: isToday ? '#DBF285' : '#4ADE80'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize: '10.5px', color: '#6B7280', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
              {mesNombreLargo.toUpperCase()} · 100% REGISTROS 24/7
            </div>
          </div>

          {/* Sub-bloque 2: Modo de detección interactivo */}
          <div style={{
            background: '#161c12',
            borderRadius: '24px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sliders size={13} color="#DBF285" /> Modo de monitoreo
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'audit', label: 'Auditoría' },
                  { id: 'auto', label: 'Automático' }
                ].map(m => {
                  const activo = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMode(m.id as 'auto' | 'audit')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: activo ? 800 : 500,
                        background: activo ? '#DBF285' : 'rgba(255,255,255,0.04)',
                        color: activo ? '#0d130a' : '#FFFFFF',
                        border: activo ? 'none' : '1px solid rgba(255,255,255,0.12)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{m.label}</span>
                      {activo && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d130a' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
              <div>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {kpiModo.precision}
                </span>
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '4px' }}>
                  {kpiModo.label}
                </span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280', marginTop: '2px' }}>
                {kpiModo.desc}
              </div>
            </div>
          </div>

          {/* Sub-bloque 3: Módulo Verde Orgánico con Visualizador en Vivo */}
          <div style={{
            background: '#3f5728',
            borderRadius: '24px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#DBF285', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DBF285' }} className="animate-pulse" />
                  Señal activa
                </span>
                <span>{infoPlaza.estado}</span>
              </div>

              {/* Espectro / Ecualizador dinámico en vivo */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '6px',
                height: '46px',
                margin: '8px 0',
                padding: '4px 8px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px'
              }}>
                {[
                  { delay: '0.1s', dur: '1.2s' },
                  { delay: '0.4s', dur: '0.9s' },
                  { delay: '0.2s', dur: '1.5s' },
                  { delay: '0.6s', dur: '1.1s' },
                  { delay: '0.3s', dur: '1.4s' },
                  { delay: '0.5s', dur: '1.0s' },
                  { delay: '0.2s', dur: '1.3s' },
                ].map((b, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: i % 2 === 0 ? '#DBF285' : '#FFFFFF',
                      borderRadius: '4px',
                      animation: `bentoEqualizer ${b.dur} ease-in-out infinite alternate`,
                      animationDelay: b.delay,
                      minHeight: '12%'
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '10.5px', color: '#E0F3BB', fontWeight: 600 }}>
                {infoPlaza.estaciones} estaciones en {activePlaza} · {infoPlaza.detalle}
              </div>
            </div>

            {/* Selector de Plazas CDMX / GDL / MTY */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {(['CDMX', 'GDL', 'MTY'] as const).map(plaza => (
                <button
                  key={plaza}
                  onClick={() => setActivePlaza(plaza)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    borderRadius: '999px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    background: activePlaza === plaza ? '#141d0e' : 'rgba(0,0,0,0.15)',
                    color: activePlaza === plaza ? '#DBF285' : '#FFFFFF',
                    border: activePlaza === plaza ? '1px solid #DBF285' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {plaza}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fila Inferior con Métricas Clave y Botón de Exploración */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Emisión
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              {selectedDay}
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#DBF285' }}>
                {mesNombreCorto} {selectedDay === diaHoy ? '(Hoy)' : ''}
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Estaciones
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>
              147 <span style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF' }}>AM/FM</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Spots detectados
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              --- <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>(En captura)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Motor IA
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#DBF285', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Local
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34D399' }} className="animate-pulse" />
            </div>
          </div>

          {/* Botón Circular Checkmark Verde para Ir a Radio / Monitoreo */}
          <button
            onClick={() => onExploreSection?.('radio')}
            title="Abrir Monitoreo On-Air y Testigos IA"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#8ec052',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d130a',
              boxShadow: '0 8px 24px rgba(142, 192, 82, 0.4)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Check size={26} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* ─── 2. COLUMNA DERECHA: DOS TARJETAS BLANCAS AESTHETIC ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Tarjeta Blanca 1: Testigos IA */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '32px',
          padding: '24px 26px',
          color: '#111810',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#111810',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                <FileAudio size={18} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#111810' }}>
                  Testigos en Vivo
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Audio MP3 & Transcripción Whisper
                </div>
              </div>
            </div>

            <button
              onClick={() => onExploreSection?.('radio')}
              title="Ir a Testigos IA"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#F9FAFB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#374151',
              }}
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div style={{ margin: '18px 0 6px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              Detecciones de pauta hoy
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#111810', letterSpacing: '-0.03em', lineHeight: 1 }}>
                ---<span style={{ fontSize: '15px', fontWeight: 600, color: '#6B7280', marginLeft: '6px' }}>en proceso</span>
              </div>

              {/* Cápsula Toggle Switch con × y ✓ */}
              <div
                onClick={() => setWhiteCard1Active(!whiteCard1Active)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#E5E7EB',
                  borderRadius: '999px',
                  padding: '3px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  gap: '3px',
                }}
              >
                <div style={{
                  padding: '5px 9px',
                  borderRadius: '999px',
                  background: !whiteCard1Active ? '#FFFFFF' : 'transparent',
                  color: !whiteCard1Active ? '#111810' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <X size={14} strokeWidth={2.5} />
                </div>
                <div style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: whiteCard1Active ? '#8ec052' : 'transparent',
                  color: whiteCard1Active ? '#0d130a' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: whiteCard1Active ? '0 2px 8px rgba(142, 192, 82, 0.4)' : 'none',
                }}>
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Blanca 2: Nube FLAI */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '32px',
          padding: '24px 26px',
          color: '#111810',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#111810',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                <Cloud size={18} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#111810' }}>
                  Cobertura Multimedia
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Radio 147 · TV 100 · Impresos 70
                </div>
              </div>
            </div>

            <button style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,0.1)',
              background: '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#374151',
            }}>
              <Sparkles size={16} />
            </button>
          </div>

          <div style={{ margin: '18px 0 6px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              Canales y medios en telemetría continua
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '46px', fontWeight: 900, color: '#111810', letterSpacing: '-0.03em', lineHeight: 1 }}>
                317<span style={{ fontSize: '18px', fontWeight: 600, color: '#6B7280', marginLeft: '4px' }}>medios</span>
              </div>

              {/* Cápsula Toggle Switch con × y ✓ */}
              <div
                onClick={() => setWhiteCard2Active(!whiteCard2Active)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#E5E7EB',
                  borderRadius: '999px',
                  padding: '3px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  gap: '3px',
                }}
              >
                <div style={{
                  padding: '5px 9px',
                  borderRadius: '999px',
                  background: !whiteCard2Active ? '#FFFFFF' : 'transparent',
                  color: !whiteCard2Active ? '#111810' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <X size={14} strokeWidth={2.5} />
                </div>
                <div style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: whiteCard2Active ? '#8ec052' : 'transparent',
                  color: whiteCard2Active ? '#0d130a' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: whiteCard2Active ? '0 2px 8px rgba(142, 192, 82, 0.4)' : 'none',
                }}>
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
