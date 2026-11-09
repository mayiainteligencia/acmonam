import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Play,
  Pause,
  CheckCircle2,
  Download,
  Search,
  ChevronRight,
  HelpCircle,
  FileText,
  Volume2,
  Tv,
  Newspaper,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ACENTO, D, Modulo } from './shared/dark';
import { inner, useIsMobile } from './shared/ui';
import { FONDO_TECH } from '../config/tema';

interface GuiaPaso {
  titulo: string;
  descripcion: string;
  detalle: string;
  icono: React.ElementType;
}

const GUIAS_OPERATIVAS: { id: string; titulo: string; rol: string; duracion: string; pasos: GuiaPaso[] }[] = [
  {
    id: 'auditar-spot',
    titulo: '¿Cómo auditar y validar un spot publicitario detectado?',
    rol: 'Auditor de Medios / Control de Calidad',
    duracion: '4 min de lectura',
    pasos: [
      {
        titulo: 'Paso 1: Localizar la alerta en Radio o TV',
        descripcion: 'Identifica la notificación de corte comercial en el panel de telemetría.',
        detalle: 'Ve a la sección Radio > Spots detectados o Televisión > Spoteo publicitario. Los eventos con icono amarillo indican detección reciente que requiere verificación de concordancia contra la pauta de compra.',
        icono: Search,
      },
      {
        titulo: 'Paso 2: Reproducir el testigo de audio o video',
        descripcion: 'Examina la evidencia física grabada por la IA.',
        detalle: 'Haz clic en el botón de reproducción del testigo. En radio observa el espectro de onda (waveform) y confirma que la mención de la marca sea inteligible y dure los segundos contratados (15s, 20s, 30s). En TV revisa el video clip a 1080p.',
        icono: Volume2,
      },
      {
        titulo: 'Paso 3: Cotejar contra el SLA de Precisión (97.5%)',
        descripcion: 'Confirma o corrige la transcripción automática de Whisper.',
        detalle: 'Si el nombre de la marca o la versión de la campaña fue detectado correctamente, pulsa "Confirmar Testigo". Si hubo un falso positivo (ej. mención de otra marca en canción), pulsa "Ajustar Detección" para alimentar el algoritmo de reentrenamiento.',
        icono: CheckCircle2,
      },
      {
        titulo: 'Paso 4: Certificar y emitir la evidencia',
        descripcion: 'Genera el comprobante con sello criptográfico de tiempo.',
        detalle: 'El sistema adjunta automáticamente el hash SHA-256 inmutable y el identificador de transmisión para la conciliación con la cadena emisora.',
        icono: ShieldCheck,
      },
    ],
  },
  {
    id: 'exportar-reportes',
    titulo: '¿Cómo exportar reportes contractuales y certificaciones?',
    rol: 'Planner / Dirección de Cuentas',
    duracion: '3 min de lectura',
    pasos: [
      {
        titulo: 'Paso 1: Filtrar por periodo y plaza',
        descripcion: 'Selecciona el rango de fechas (diario, semanal, mensual) y las plazas de interés.',
        detalle: 'Usa las píldoras superiores del panel (CDMX, Guadalajara, Monterrey) para acotar los datos de la cuenta auditada.',
        icono: Search,
      },
      {
        titulo: 'Paso 2: Seleccionar formato de salida',
        descripcion: 'Descarga en CSV para analítica o en Certificado PDF para el cliente.',
        detalle: 'El CSV contiene todos los metadatos crudos (timestamp exacto, dial/canal, anunciante, tarifa de lista y duración). El PDF incluye los gráficos de Share of Voice y las muestras de testigos con valor legal.',
        icono: FileText,
      },
      {
        titulo: 'Paso 3: Validar el cierre contractual mensual',
        descripcion: 'Comprueba el cumplimiento de la meta del 97.5%.',
        detalle: 'Verifica en el reporte que la precisión ponderada final supere el umbral contractual del 97.5% estipulado en la cláusula ACAM 2026.',
        icono: Award,
      },
    ],
  },
  {
    id: 'prensa-impresos',
    titulo: '¿Cómo auditar inserciones en periódicos y revistas a 300 DPI?',
    rol: 'Especialista en Medios Impresos',
    duracion: '5 min de lectura',
    pasos: [
      {
        titulo: 'Paso 1: Abrir el visor de planas digitalizadas',
        descripcion: 'Accede a la sección Impresos y selecciona la publicación matutina.',
        detalle: 'El módulo procesa automáticamente los e-papers a las 5:00 AM. Elige entre periódicos de circulación nacional o revistas especializadas.',
        icono: Newspaper,
      },
      {
        titulo: 'Paso 2: Comprobar el Bounding Box y cm²',
        descripcion: 'Verifica el recuadro delimitador y el formato de la plana.',
        detalle: 'La IA resalta con marco de acento la inserción publicitaria. Comprueba si corresponde a 1/8, 1/4, 1/2 plana o plana completa, y valida si la impresión fue a color o blanco y negro.',
        icono: CheckCircle2,
      },
      {
        titulo: 'Paso 3: Comparar tarifa de lista vs. contratada',
        descripcion: 'Evalúa la discrepancia comercial en tiempo real.',
        detalle: 'El sistema calcula el costo según el tarifario oficial registrado y lo contrasta contra la tarifa pactada por la agencia para identificar cobros indebidos.',
        icono: ShieldCheck,
      },
    ],
  },
];

const MODULOS_VIDEO = [
  { id: 1, titulo: '1. Introducción al Ecosistema de Monitoreo ACAM', duracion: '06:45', medio: 'General', completado: true },
  { id: 2, titulo: '2. Operación On-Air de Radio y Whisper Pipeline', duracion: '08:20', medio: 'Radio', completado: true },
  { id: 3, titulo: '3. Auditoría de TV: Spoteo, Menciones y Overlays', duracion: '07:15', medio: 'Televisión', completado: false },
  { id: 4, titulo: '4. Visor de Prensa a 300 DPI y Cálculo de cm²', duracion: '05:50', medio: 'Impresos', completado: false },
  { id: 5, titulo: '5. Conciliación de Discrepancias y Mesa de Ayuda', duracion: '09:10', medio: 'Soporte & NOC', completado: false },
];

const FAQS = [
  {
    pregunta: '¿Qué significa exactamente el 97.5% de precisión contractual?',
    respuesta: 'Es el estándar de calidad acordado con el cliente. De cada 1,000 spots transmitidos por las cadenas emisoras, el sistema de IA debe detectar y clasificar con total exactitud al menos 975 eventos sin error de marca ni omisión de horario frente a la auditoría humana de control.',
  },
  {
    pregunta: '¿Qué hago si una estación de radio aparece sin señal (offline)?',
    respuesta: 'El sistema activa un protocolo automático de reintento de stream vía Icecast/HLS. Si la interrupción supera los 3 minutos, el NOC recibe una alerta roja prioritaria y se genera un ticket técnico para conmutar a la sintonizadora de respaldo.',
  },
  {
    pregunta: '¿Los testigos de audio y video tienen validez legal ante las televisoras o radiodifusoras?',
    respuesta: 'Sí. Cada archivo almacenado en la nube genera una huella criptográfica SHA-256 junto con la marca de tiempo sincronizada con servidores oficiales de México (CENAM), garantizando la inmutabilidad de la prueba en caso de disputas comerciales.',
  },
  {
    pregunta: '¿Cómo se registran las menciones en vivo de locutores que no siguen un guión rígido?',
    respuesta: 'El modelo Whisper procesa fonéticamente la pista de voz del programa en tiempo real, identificando nombres de marcas y palabras clave asociadas mediante similitud fonética y análisis semántico, incluso cuando el conductor parafrasea el mensaje.',
  },
  {
    pregunta: '¿Con qué frecuencia se actualizan las tarifas de periódicos y revistas?',
    respuesta: 'Las tarifas de lista se actualizan trimestralmente conforme a las publicaciones tarifarias oficiales de los grupos editoriales (El Universal, Reforma, Milenio, Televisa Publishing, etc.).',
  },
];

export const Academia: React.FC = () => {
  const m = useIsMobile();
  const [guiaSeleccionada, setGuiaSeleccionada] = useState(GUIAS_OPERATIVAS[0]);
  const [pasoActivo, setPasoActivo] = useState(0);
  const [videoActivo, setVideoActivo] = useState(MODULOS_VIDEO[1]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);

  const faqsFiltradas = FAQS.filter(
    f => f.pregunta.toLowerCase().includes(busqueda.toLowerCase()) || f.respuesta.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100%', padding: m ? 16 : 28, ...FONDO_TECH }}>
      <div style={inner}>
        {/* Cabecera Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #111a0d 0%, #0d150a 100%)',
          border: '1px solid rgba(219, 242, 133, 0.22)',
          borderRadius: 28,
          padding: m ? '20px' : '28px 32px',
          marginBottom: 24,
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.65)',
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
              <GraduationCap size={15} />
              Centro de Capacitación & Habilitación ACAM
            </div>
            <h1 style={{
              fontSize: m ? 24 : 32,
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Academia de Monitoreo & Auditoría de Medios
            </h1>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: D.sub,
              maxWidth: 680,
              lineHeight: 1.5,
            }}>
              Aprende a operar el tablero, validar testigos en vivo, conciliar discrepancias con emisoras y garantizar el estándar del <strong>97.5% de precisión contractual</strong>.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '16px 20px',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Progreso de Capacitación</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: ACENTO, marginTop: 2 }}>
                60% <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 500 }}>completado</span>
              </div>
              <div style={{ width: '130px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: ACENTO, borderRadius: '999px' }} />
              </div>
            </div>
            <Award size={36} color={ACENTO} style={{ opacity: 0.9 }} />
          </div>
        </div>

        {/* ─── SECCIÓN 1: GUÍAS OPERATIVAS "QUÉ HACER Y CÓMO HACERLO" ─── */}
        <Modulo
          id="acad-guias"
          title="GUÍAS PASO A PASO: OPERACIÓN DEL MONITOREO"
          right={
            <div style={{ fontSize: '12px', color: ACENTO, fontWeight: 600 }}>
              {GUIAS_OPERATIVAS.length} manuales interactivos
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          {/* Selector de Guía */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: m ? '1fr' : 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}>
            {GUIAS_OPERATIVAS.map((guia) => {
              const activa = guiaSeleccionada.id === guia.id;
              return (
                <button
                  key={guia.id}
                  onClick={() => {
                    setGuiaSeleccionada(guia);
                    setPasoActivo(0);
                  }}
                  style={{
                    background: activa ? 'rgba(219, 242, 133, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activa ? ACENTO : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: 18,
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '11px', color: activa ? ACENTO : '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>
                    {guia.rol}
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', margin: '6px 0 8px', lineHeight: 1.3 }}>
                    {guia.titulo}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#9CA3AF' }}>
                    <Clock size={12} />
                    {guia.duracion}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visualizador del Paso a Paso */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 22,
            padding: m ? 16 : 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 6 }}>
              {guiaSeleccionada.pasos.map((paso, idx) => {
                const activo = pasoActivo === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setPasoActivo(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: 'none',
                      background: activo ? ACENTO : 'rgba(255, 255, 255, 0.06)',
                      color: activo ? '#0d130a' : '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: activo ? 800 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Paso {idx + 1}</span>
                    {activo && <ChevronRight size={14} />}
                  </button>
                );
              })}
            </div>

            {/* Contenido del paso actual */}
            {(() => {
              const paso = guiaSeleccionada.pasos[pasoActivo];
              const Icon = paso.icono;
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: m ? '1fr' : 'auto 1fr',
                  gap: 20,
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: 18,
                    background: 'rgba(219, 242, 133, 0.15)',
                    border: '1px solid rgba(219, 242, 133, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: ACENTO,
                    flexShrink: 0,
                  }}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: ACENTO, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Paso {pasoActivo + 1} de {guiaSeleccionada.pasos.length}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 8px' }}>
                      {paso.titulo}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#E5E7EB', margin: '0 0 10px', lineHeight: 1.5, fontWeight: 500 }}>
                      {paso.descripcion}
                    </p>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 14,
                      padding: '14px 18px',
                      fontSize: '13px',
                      color: D.sub,
                      lineHeight: 1.6,
                    }}>
                      <strong style={{ color: '#FFFFFF' }}>Instrucción operativa: </strong>
                      {paso.detalle}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </Modulo>

        {/* ─── SECCIÓN 2: SIMULADOR DE VIDEO TUTORIALES ─── */}
        <Modulo
          id="acad-videos"
          title="TUTORIALES EN VIDEO & CAPACITACIÓN AUDIOVISUAL"
          right={<span style={{ fontSize: '12px', color: '#9CA3AF' }}>5 lecciones modulares</span>}
          style={{ marginBottom: 24 }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: m ? '1fr' : '1.3fr 1fr',
            gap: 20,
            alignItems: 'stretch',
          }}>
            {/* Reproductor de Video Simulado */}
            <div style={{
              background: '#050a04',
              borderRadius: 22,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Badge de Medio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(219, 242, 133, 0.15)',
                  border: '1px solid rgba(219, 242, 133, 0.3)',
                  color: ACENTO,
                  fontSize: '11px',
                  fontWeight: 700,
                }}>
                  {videoActivo.medio}
                </span>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>HD 1080p · Formato In-Class</span>
              </div>

              {/* Botón Central de Play/Pause */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0' }}>
                <button
                  onClick={() => setVideoPlaying(!videoPlaying)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: videoPlaying ? '#EF4444' : ACENTO,
                    color: '#0d130a',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(219, 242, 133, 0.4)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {videoPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
                </button>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: 14 }}>
                  {videoPlaying ? 'Reproduciendo lección interactiva...' : 'Haga clic para reproducir módulo'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: 4 }}>
                  {videoActivo.titulo}
                </div>
              </div>

              {/* Barra de progreso */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginBottom: 6 }}>
                  <span>{videoPlaying ? '02:40' : '00:00'}</span>
                  <span>{videoActivo.duracion}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: videoPlaying ? '40%' : '0%', height: '100%', background: ACENTO, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            {/* Lista de Capítulos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                Índice del Curso de Certificación ACAM
              </div>
              {MODULOS_VIDEO.map((v) => {
                const seleccionado = videoActivo.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVideoActivo(v);
                      setVideoPlaying(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 16,
                      border: `1px solid ${seleccionado ? ACENTO : 'rgba(255, 255, 255, 0.06)'}`,
                      background: seleccionado ? 'rgba(219, 242, 133, 0.08)' : 'rgba(0, 0, 0, 0.25)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      {v.completado ? (
                        <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #9CA3AF', flexShrink: 0 }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: seleccionado ? 700 : 500, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.titulo}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{v.medio} · {v.duracion}</div>
                      </div>
                    </div>
                    <Play size={14} color={seleccionado ? ACENTO : '#9CA3AF'} style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        </Modulo>

        {/* ─── SECCIÓN 3: PREGUNTAS FRECUENTES (FAQ) Y RECURSOS ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: m ? '1fr' : '1.4fr 1fr',
          gap: 20,
        }}>
          {/* FAQ con buscador */}
          <Modulo
            id="acad-recursos"
            title="PREGUNTAS FRECUENTES (FAQ)"
            right={
              <div style={{ position: 'relative', width: m ? '100%' : '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Buscar duda..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: 999,
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    outline: 'none',
                  }}
                />
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqsFiltradas.map((faq, i) => {
                const abierta = faqAbierta === i;
                return (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setFaqAbierta(abierta ? null : i)}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'left',
                        cursor: 'pointer',
                        gap: 12,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <HelpCircle size={16} color={ACENTO} style={{ flexShrink: 0 }} />
                        {faq.pregunta}
                      </span>
                      <ChevronRight size={16} color="#9CA3AF" style={{ transform: abierta ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0 }} />
                    </button>
                    {abierta && (
                      <div style={{
                        padding: '0 18px 16px 44px',
                        fontSize: '12.5px',
                        color: D.sub,
                        lineHeight: 1.55,
                      }}>
                        {faq.respuesta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Modulo>

          {/* Descargas y Material de Apoyo */}
          <Modulo title="MANUALES Y RECURSOS EN PDF">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { nom: 'Manual Operativo ACAM 2026.pdf', peso: '3.4 MB', desc: 'Protocolo de auditoría y conciliación' },
                { nom: 'Criterios de Validación SLA 97.5%.pdf', peso: '1.8 MB', desc: 'Reglas para clasificación de falsos positivos' },
                { nom: 'Tarifarios Oficiales Prensa 2026.pdf', peso: '4.1 MB', desc: 'Tarifas brutas de periódicos CDMX, GDL y MTY' },
                { nom: 'Directorio de Contactos de Emisoras.xlsx', peso: '850 KB', desc: 'Frecuencias, cabinas y teléfonos de radio' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <FileText size={18} color={ACENTO} style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.nom}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{doc.desc} · {doc.peso}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([`Descarga simulada de: ${doc.nom}\nFecha: ${new Date().toISOString()}`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = doc.nom;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Descargar documento"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Modulo>
        </div>
      </div>
    </div>
  );
};

