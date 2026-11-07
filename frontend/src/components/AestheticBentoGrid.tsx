import React, { useState } from 'react';
import { Radio, Sparkles, Check, X, Sliders, Maximize2, FileAudio, Cloud, Volume2 } from 'lucide-react';

interface BentoGridProps {
  onExploreSection?: (sectionId: string) => void;
}

export const AestheticBentoGrid: React.FC<BentoGridProps> = ({ onExploreSection }) => {
  const [selectedDay, setSelectedDay] = useState(18);
  const [selectedMode, setSelectedMode] = useState<'auto' | 'audit' | 'electoral'>('audit');
  const [whiteCard1Active, setWhiteCard1Active] = useState(true);
  const [whiteCard2Active, setWhiteCard2Active] = useState(true);
  const [activePlaza, setActivePlaza] = useState('CDMX');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
        {/* Cabecera de la tarjeta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <Radio size={22} color="#0d130a" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                W Radio 96.9 FM
              </div>
              <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                Emisión on-air · Transmisión 24/7
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Avatares apilados */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['CD', 'GD', 'MT', 'SL'].map((init, i) => (
                <div key={i} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: ['#3f5728', '#2e411d', '#557237', '#729013'][i],
                  border: '2px solid #0d130a',
                  marginLeft: i > 0 ? '-10px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}>
                  {init}
                </div>
              ))}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#1a2315',
                border: '2px solid #0d130a',
                marginLeft: '-10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: '#DBF285',
              }}>
                +4
              </div>
            </div>

            <button style={{
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
            }}>
              <Sliders size={14} />
            </button>
            <button style={{
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
            }}>
              <Maximize2 size={14} />
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
            marginBottom: '26px',
          }}
        >
          {/* Sub-bloque 1: Calendario de fecha */}
          <div style={{
            background: '#161c12',
            borderRadius: '24px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px', fontWeight: 600 }}>
              Fecha de captura
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              fontSize: '11px',
            }}>
              {days.slice(0, 28).map((d) => {
                const isSelected = d === selectedDay;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isSelected ? '#FFFFFF' : 'transparent',
                      color: isSelected ? '#000000' : '#9CA3AF',
                      fontWeight: isSelected ? 800 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 'auto',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-bloque 2: Modo de detección */}
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
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '10px', fontWeight: 600 }}>
                Modo de monitoreo
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => setSelectedMode('auto')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: selectedMode === 'auto' ? '#000000' : 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Automático
                </button>
                <button
                  onClick={() => setSelectedMode('audit')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: selectedMode === 'audit' ? '#000000' : 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Auditoría
                </button>
                <button
                  onClick={() => setSelectedMode('electoral')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: selectedMode === 'electoral' ? '#FFFFFF' : 'transparent',
                    color: selectedMode === 'electoral' ? '#000000' : '#FFFFFF',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Electoral
                </button>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                98.5%
              </span>
              <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '4px' }}>
                / precisión
              </span>
            </div>
          </div>

          {/* Sub-bloque 3: Módulo Verde Orgánico */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#DBF285', fontWeight: 600, marginBottom: '6px' }}>
                <span>Señal activa</span>
                <span>78,890 h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '48px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '60%', background: '#e0f3bb', borderRadius: '10px' }} />
                <div style={{ flex: 1, height: '100%', background: '#1c2813', borderRadius: '10px' }} />
                <div style={{ flex: 1, height: '80%', background: '#a5d070', borderRadius: '10px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              {['CDMX', 'GDL', 'MTY'].map(plaza => (
                <button
                  key={plaza}
                  onClick={() => setActivePlaza(plaza)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: activePlaza === plaza ? '#141d0e' : 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  {plaza}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fila Inferior con Métricas Clave y Botón Checkmark Verde */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Emisión</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>18<span style={{ fontSize: '14px', fontWeight: 500 }}>th</span></div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Estaciones</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>147</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Spots detectados</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>375</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Motor IA</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#DBF285' }}>Local</div>
          </div>

          {/* Botón Circular Checkmark Verde */}
          <button
            onClick={() => onExploreSection?.('radio')}
            title="Ir a Radio en Vivo"
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
                  Audio MP3 & Transcripción
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
              <Volume2 size={16} />
            </button>
          </div>

          <div style={{ margin: '18px 0 6px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              Detecciones hoy, en tiempo real
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '46px', fontWeight: 900, color: '#111810', letterSpacing: '-0.03em', lineHeight: 1 }}>
                375<span style={{ fontSize: '20px', fontWeight: 600, color: '#6B7280' }}>/sp</span>
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
                  Almacenamiento FLAI
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Evidencias & Testigos Legales
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
              Horas registradas sin costo extra
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '46px', fontWeight: 900, color: '#111810', letterSpacing: '-0.03em', lineHeight: 1 }}>
                2,566<span style={{ fontSize: '20px', fontWeight: 600, color: '#6B7280' }}>h</span>
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
