import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Cpu,
  Layers,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Compass,
  Sliders,
  CheckCircle2,
  Eye,
  GitBranch,
  Network,
  Users,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { ACENTO, D, Modulo } from './shared/dark';
import { inner, useIsMobile } from './shared/ui';
import { FONDO_TECH } from '../config/tema';

interface NodoGrafo {
  id: string;
  nombre: string;
  tipo: 'marca' | 'medio' | 'horario' | 'audiencia' | 'insight';
  color: string;
  x: number;
  y: number;
  detalles: string;
}

const NODOS: NodoGrafo[] = [
  { id: 'n1', nombre: 'Tiendas Aurora', tipo: 'marca', color: ACENTO, x: 50, y: 35, detalles: 'Anunciante líder en Retail. Inversión prioritaria en pauta matutina.' },
  { id: 'n2', nombre: 'Radio Fórmula 103.3 FM', tipo: 'medio', color: '#38BDF8', x: 25, y: 20, detalles: 'Mayor Share of Voice en noticias y análisis de 7:00 a 10:00 AM.' },
  { id: 'n3', nombre: 'Las Estrellas (Prime Time)', tipo: 'medio', color: '#818CF8', x: 75, y: 22, detalles: 'Cobertura masiva nacional. Alta retención en franja de 20:00 a 22:00 hrs.' },
  { id: 'n4', nombre: 'Franja Matutina 07:00-09:00', tipo: 'horario', color: '#F59E0B', x: 22, y: 65, detalles: 'Momento de mayor efectividad radial para llamadas a la acción comercial.' },
  { id: 'n5', nombre: 'NSE A/B & C+ (CDMX/GDL/MTY)', tipo: 'audiencia', color: '#EC4899', x: 78, y: 65, detalles: 'Público objetivo con alto poder adquisitivo y respuesta a retail.' },
  { id: 'n6', nombre: 'Correlación Cruzada +34%', tipo: 'insight', color: '#10B981', x: 50, y: 80, detalles: 'Patrón inferido: la combinación de Radio a las 8:00 AM con TV a las 9:00 PM incrementa la recordación un +34%.' },
];

export const Innovacion: React.FC = () => {
  const m = useIsMobile();
  const [nodoSeleccionado, setNodoSeleccionado] = useState<NodoGrafo>(NODOS[0]);

  // Simulador de Gemelos Digitales (What-if Analysis)
  const [deltaRadio, setDeltaRadio] = useState(15);
  const [deltaTV, setDeltaTV] = useState(-5);
  const [deltaImpresos, setDeltaImpresos] = useState(0);

  // Cálculos reactivos simulados del gemelo digital
  const alcanceBase = 68.4;
  const sovBase = 24.2;
  const alcanceProyectado = Math.min(94, Math.max(50, +(alcanceBase + deltaRadio * 0.45 + deltaTV * 0.6 + deltaImpresos * 0.15).toFixed(1)));
  const sovProyectado = Math.min(48, Math.max(12, +(sovBase + deltaRadio * 0.38 + deltaTV * 0.25).toFixed(1)));
  const personasImpactadas = Math.round(alcanceProyectado * 215000);
  const saturacionFrecuencia = +(3.2 + (deltaRadio > 20 ? 0.8 : 0) + (deltaTV > 10 ? 0.6 : 0)).toFixed(1);

  return (
    <div style={{ minHeight: '100%', padding: m ? 16 : 28, ...FONDO_TECH }}>
      <div style={inner}>
        {/* Cabecera Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #121c0e 0%, #080f06 100%)',
          border: '1px solid rgba(219, 242, 133, 0.25)',
          borderRadius: 28,
          padding: m ? '20px' : '26px 32px',
          marginBottom: 24,
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(219, 242, 133, 0.05)',
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
              <Sparkles size={15} />
              Next-Gen Media Intelligence & Roadmap
            </div>
            <h1 style={{
              fontSize: m ? 24 : 32,
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Innovación: Grafos de Conocimiento & Gemelos Digitales
            </h1>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: D.sub,
              maxWidth: 720,
              lineHeight: 1.5,
            }}>
              Descubre cómo la plataforma trasciende el monitoreo tradicional mediante modelos de conocimiento conectado, gemelos digitales de audiencia y visión computacional multimodal.
            </p>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(219, 242, 133, 0.2)',
            borderRadius: 20,
            padding: '16px 22px',
            flexShrink: 0,
            textAlign: m ? 'left' : 'right',
          }}>
            <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Entidades en Grafo IA</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: ACENTO, marginTop: 2 }}>14,820+</div>
            <div style={{ fontSize: '11px', color: '#FFFFFF' }}>Relaciones causales inferidas</div>
          </div>
        </div>

        {/* ─── MÓDULO 1: GRAFOS DE CONOCIMIENTO (KNOWLEDGE GRAPH) ─── */}
        <Modulo
          id="inno-grafos"
          title="GRAFOS DE CONOCIMIENTO PUBLICITARIO (CROSS-MEDIA KNOWLEDGE GRAPH)"
          right={
            <span style={{ fontSize: '12px', color: ACENTO, fontWeight: 600 }}>
              Mapeo semántico de marcas, medios y correlaciones
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: m ? '1fr' : '1.35fr 1fr',
            gap: 20,
            alignItems: 'stretch',
          }}>
            {/* Lienzo Interactivo del Grafo */}
            <div style={{
              background: '#040804',
              borderRadius: 22,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              position: 'relative',
              minHeight: '360px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>
                  Red de Interconexiones de Medios (Haz clic en un nodo)
                </span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 999, background: 'rgba(219, 242, 133, 0.1)', color: ACENTO }}>
                  Interactivo
                </span>
              </div>

              {/* Conexiones SVG entre nodos */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <line x1="50%" y1="35%" x2="25%" y2="20%" stroke="rgba(219, 242, 133, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="35%" x2="75%" y2="22%" stroke="rgba(219, 242, 133, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="25%" y1="20%" x2="22%" y2="65%" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
                <line x1="75%" y1="22%" x2="78%" y2="65%" stroke="rgba(129, 140, 248, 0.3)" strokeWidth="1.5" />
                <line x1="50%" y1="35%" x2="50%" y2="80%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" />
                <line x1="22%" y1="65%" x2="50%" y2="80%" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="2 2" />
                <line x1="78%" y1="65%" x2="50%" y2="80%" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>

              {/* Nodos renderizados sobre el lienzo */}
              <div style={{ position: 'relative', width: '100%', height: '280px', margin: '20px 0' }}>
                {NODOS.map(nodo => {
                  const seleccionado = nodoSeleccionado.id === nodo.id;
                  return (
                    <button
                      key={nodo.id}
                      onClick={() => setNodoSeleccionado(nodo)}
                      style={{
                        position: 'absolute',
                        left: `${nodo.x}%`,
                        top: `${nodo.y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: seleccionado ? nodo.color : '#0d160b',
                        color: seleccionado ? '#0d130a' : '#FFFFFF',
                        border: `2px solid ${nodo.color}`,
                        borderRadius: 14,
                        padding: '8px 14px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: seleccionado ? `0 0 20px ${nodo.color}66` : '0 4px 12px rgba(0,0,0,0.5)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: seleccionado ? 20 : 10,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {nodo.nombre}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 12, fontSize: '11px', color: '#9CA3AF', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: ACENTO }} /> Marcas</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }} /> Radio</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#818CF8' }} /> Televisión</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Insight Causal</span>
              </div>
            </div>

            {/* Panel de Detalle del Nodo Seleccionado */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 22,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: nodoSeleccionado.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Entidad del Grafo: {nodoSeleccionado.tipo}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '6px 0 12px' }}>
                  {nodoSeleccionado.nombre}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#D1D5DB', lineHeight: 1.6, margin: '0 0 16px' }}>
                  {nodoSeleccionado.detalles}
                </p>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 14,
                  padding: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: 16,
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                    ¿Por qué importa este grafo para ACAM?
                  </div>
                  <div style={{ fontSize: '12px', color: D.sub, lineHeight: 1.5 }}>
                    Un grafo de conocimiento no solo audita si un comercial salió al aire, sino que infiere <strong>efectos sinérgicos</strong> entre medios y ayuda a renegociar pautas en las franjas de mayor rendimiento para la marca.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Modelo: Graph-RAG Neoj4 / Vector Embeddings</span>
                <span style={{ fontSize: '11.5px', color: ACENTO, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Explorar sub-grafo <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        </Modulo>

        {/* ─── MÓDULO 2: GEMELOS DIGITALES DE AUDIENCIA (DIGITAL TWIN) ─── */}
        <Modulo
          id="inno-gemelos"
          title="SIMULADOR DE GEMELOS DIGITALES DE AUDIENCIA (WHAT-IF ANALYSIS)"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
              <Users size={14} /> 12.8M perfiles simulados
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: m ? '1fr' : '1.15fr 1.35fr',
            gap: 24,
            alignItems: 'stretch',
          }}>
            {/* Controles de Simulación (Sliders) */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 22,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 20,
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                  Ajuste de Mix de Medios Simulado
                </div>
                <div style={{ fontSize: '12px', color: D.sub, marginBottom: 20 }}>
                  Modifica la inversión estimada en cada medio y observa cómo el gemelo digital proyecta el impacto poblacional.
                </div>

                {/* Slider Radio */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Pauta en Radio AM/FM</span>
                    <strong style={{ color: ACENTO }}>{deltaRadio > 0 ? `+${deltaRadio}%` : `${deltaRadio}%`}</strong>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="50"
                    step="5"
                    value={deltaRadio}
                    onChange={e => setDeltaRadio(Number(e.target.value))}
                    style={{ width: '100%', accentColor: ACENTO, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9CA3AF', marginTop: 2 }}>
                    <span>-40%</span>
                    <span>Base 0</span>
                    <span>+50%</span>
                  </div>
                </div>

                {/* Slider Televisión */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Pauta en Televisión</span>
                    <strong style={{ color: '#38BDF8' }}>{deltaTV > 0 ? `+${deltaTV}%` : `${deltaTV}%`}</strong>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="50"
                    step="5"
                    value={deltaTV}
                    onChange={e => setDeltaTV(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38BDF8', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9CA3AF', marginTop: 2 }}>
                    <span>-40%</span>
                    <span>Base 0</span>
                    <span>+50%</span>
                  </div>
                </div>

                {/* Slider Impresos */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Prensa Escrita & Revistas</span>
                    <strong style={{ color: '#F59E0B' }}>{deltaImpresos > 0 ? `+${deltaImpresos}%` : `${deltaImpresos}%`}</strong>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="50"
                    step="5"
                    value={deltaImpresos}
                    onChange={e => setDeltaImpresos(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9CA3AF', marginTop: 2 }}>
                    <span>-40%</span>
                    <span>Base 0</span>
                    <span>+50%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setDeltaRadio(15);
                  setDeltaTV(-5);
                  setDeltaImpresos(0);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '8px 14px',
                  color: '#9CA3AF',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                Restablecer Escenario Base
              </button>
            </div>

            {/* Resultados Proyectados por el Gemelo Digital */}
            <div style={{
              background: '#040804',
              borderRadius: 22,
              border: '1px solid rgba(219, 242, 133, 0.2)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: '12px', color: ACENTO, fontWeight: 700, textTransform: 'uppercase' }}>
                    Proyecciones del Gemelo Digital
                  </span>
                  <span style={{ fontSize: '11px', color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 999 }}>
                    Simulación Activa
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>Alcance Proyectado (Reach)</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0' }}>
                      {alcanceProyectado}%
                    </div>
                    <div style={{ fontSize: '11px', color: ACENTO }}>
                      ~{personasImpactadas.toLocaleString('es-MX')} personas únicas
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>Share of Voice Estimado</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#38BDF8', margin: '4px 0' }}>
                      {sovProyectado}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      Frente al set competitivo
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(219, 242, 133, 0.05)',
                  border: '1px solid rgba(219, 242, 133, 0.2)',
                  borderRadius: 14,
                  padding: '14px 18px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>Frecuencia Media de Impacto</span>
                    <strong style={{ color: ACENTO, fontSize: '14px' }}>{saturacionFrecuencia}x</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: D.sub, lineHeight: 1.45 }}>
                    {saturacionFrecuencia > 4.0
                      ? '⚠️ Advertencia del Gemelo Digital: Frecuencia elevada; riesgo de saturación publicitaria en franja matutina.'
                      : '✅ Equilibrio óptimo: frecuencia suficiente para fijar recordación sin fatiga publicitaria.'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 10 }}>
                Motor: Synthetic Population Model (Censo INEGI + IBOPE México + Monitoreo ACAM)
              </div>
            </div>
          </div>
        </Modulo>

        {/* ─── MÓDULO 3: MODELOS MULTIMODALES & BRAND SAFETY ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: m ? '1fr' : '1fr 1fr',
          gap: 20,
          marginBottom: 24,
        }}>
          {/* Brand Safety Contextual */}
          <Modulo title="BRAND SAFETY CONTEXTUAL CON VISIÓN Y LENGUAJE">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '13px', color: D.sub, margin: 0, lineHeight: 1.5 }}>
                La IA evalúa la emoción y temática del contenido que antecede y precede al corte comercial para proteger la reputación de la marca.
              </p>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '14px', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>Emisión Segura (Brand Safe)</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Hoy 08:45 AM</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>Spot Aurora (30s) en Radio Fórmula</div>
                <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: 4 }}>Contexto: Nota deportiva y pronóstico de clima. Cero adyacencia negativa.</div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: 14, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>Alerta de Adyacencia Detectada</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Ayer 21:12 PM</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>Corte comercial tras reportaje de catástrofe vial</div>
                <div style={{ fontSize: '11.5px', color: '#E5E7EB', marginTop: 4 }}>Recomendación IA: Reposición automática solicitada a la televisora conforme a política de marca.</div>
              </div>
            </div>
          </Modulo>

          {/* Roadmap Tecnológico */}
          <Modulo id="inno-roadmap" title="HOJA DE RUTA TECNOLÓGICA (ROADMAP 2026 - 2028)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { fase: 'Fase 1 (Activa)', titulo: 'Monitoreo On-Air 97.5% SLA', desc: 'Whisper en radio, spoteo TV y planas 300 DPI.', status: 'En producción', color: '#10B981' },
                { fase: 'Fase 2 (Q1 2027)', titulo: 'Cross-Media Knowledge Graph', desc: 'Mapeo causal de marcas y conciliación automática.', status: 'En desarrollo', color: ACENTO },
                { fase: 'Fase 3 (Q3 2027)', titulo: 'Gemelos Digitales de Audiencia', desc: 'Simulaciones What-If poblacionales para optimizar mix.', status: 'Investigación', color: '#38BDF8' },
                { fase: 'Fase 4 (2028)', titulo: 'Agentes Autónomos de Reposición', desc: 'Compensación de pautas caídas mediante contratos digitales.', status: 'Roadmap', color: '#818CF8' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{item.titulo}</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: item.color }}>{item.status}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Modulo>
        </div>
      </div>
    </div>
  );
};

