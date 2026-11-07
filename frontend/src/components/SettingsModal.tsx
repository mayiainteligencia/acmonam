import React, { useState, useEffect } from 'react';
import { X, Shield, Mail, Cpu, Lock, ArrowUpRight, Check, KeyRound, User as UserIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '../features/auth';
import { ConfirmDialog } from './ConfirmDialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { session, updateUser } = useAuth();

  const [name, setName] = useState(session?.user?.name || 'Martín Cortés');
  const [email, setEmail] = useState(session?.user?.email || 'martin@mayia.mx');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensajeExito, setMensajeExito] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const initialName = session?.user?.name || 'Martín Cortés';
  const initialEmail = session?.user?.email || 'martin@mayia.mx';
  const isDirty = (name !== initialName) || (email !== initialEmail) || Boolean(password);

  const handleRequestClose = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setName(initialName);
    setEmail(initialEmail);
    setPassword('');
    setConfirmPassword('');
    setErrorPassword('');
    setConfirmDiscardOpen(false);
    onClose();
  };

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name);
      setEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDiscardOpen) {
          setConfirmDiscardOpen(false);
        } else {
          handleRequestClose();
        }
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty, confirmDiscardOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword('');

    if (password && password.length < 6) {
      setErrorPassword('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorPassword('Las contraseñas no coinciden.');
      return;
    }

    updateUser({ name: name.trim(), email: email.trim() });
    setMensajeExito(true);
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setMensajeExito(false);
    }, 3000);
  };

  const inicial = (name || 'M').charAt(0).toUpperCase();

  return (
    <div
      onClick={handleRequestClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 4, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '960px',
          background: '#0b0f08',
          borderRadius: '36px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.95), 0 0 40px rgba(219, 242, 133, 0.05)',
          padding: '38px',
          position: 'relative',
          color: '#FFFFFF',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Botón de cerrar */}
        <button
          onClick={handleRequestClose}
          title="Cerrar"
          style={{
            position: 'absolute',
            top: '28px',
            right: '28px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'; }}
        >
          <X size={18} />
        </button>

        {/* Layout en 2 Columnas como en la imagen de referencia */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: '40px',
          alignItems: 'start',
        }}>
          {/* ─── COLUMNA IZQUIERDA: CONFIGURACIÓN & EDICIÓN ─── */}
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#DBF285',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: 'monospace',
            }}>
              Configuración de Cuenta · MAYIA Escucha
            </div>

            <h2 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              margin: '0 0 10px',
            }}>
              Perfil y Credenciales de Acceso
            </h2>

            <p style={{
              fontSize: '13px',
              color: '#9CA3AF',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}>
              Modifica la identidad del operador asignado, correo de notificaciones oficiales y contraseña de acceso al sistema de auditoría.
            </p>

            {/* Banner de alerta y prevención de errores */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              borderRadius: '16px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}>
              <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#F3F4F6', lineHeight: 1.45 }}>
                <span style={{ fontWeight: 700, color: '#FCD34D' }}>Cuidado con tus credenciales: </span>
                Modificar tu correo o contraseña alterará tus llaves de acceso a las sesiones de telemetría y auditoría en tiempo real. Verifica detenidamente antes de guardar.
              </div>
            </div>

            {mensajeExito && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid #10B981',
                borderRadius: '16px',
                padding: '12px 16px',
                color: '#10B981',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}>
                <Check size={16} /> ¡Datos de cuenta actualizados exitosamente!
              </div>
            )}

            {errorPassword && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #EF4444',
                borderRadius: '16px',
                padding: '12px 16px',
                color: '#EF4444',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
              }}>
                {errorPassword}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  marginBottom: '7px',
                }}>
                  Nombre Completo
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '14px',
                      padding: '12px 16px 12px 40px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#DBF285'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
                  />
                  <UserIcon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  marginBottom: '7px',
                }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '14px',
                      padding: '12px 16px 12px 40px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#DBF285'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    marginBottom: '7px',
                  }}>
                    Nueva Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '14px',
                        padding: '12px 14px 12px 38px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <KeyRound size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    marginBottom: '7px',
                  }}>
                    Confirmar Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '14px',
                        padding: '12px 14px 12px 38px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  </div>
                </div>
              </div>

              {/* Botón estilo VIEW CASE STUDIES ↗ de la referencia */}
              <div style={{ marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#FFFFFF',
                    color: '#0b0f08',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '14px 32px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DBF285'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                >
                  GUARDAR CAMBIOS <ArrowUpRight size={17} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>

          {/* ─── COLUMNA DERECHA: TARJETA DE PERFIL (IDÉNTICA A LA IMAGEN) ─── */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '28px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            {/* Foto con halo rojo/naranja/verde como en la imagen */}
            <div style={{
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444 0%, #DBF285 100%)',
              padding: '3px',
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3)',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#141d0e',
                color: '#DBF285',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                fontWeight: 900,
                border: '2px solid #0b0f08',
              }}>
                {inicial}
              </div>
            </div>

            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {name || 'Martín Cortés'}
            </div>

            <div style={{
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              margin: '6px 0 14px',
            }}>
              DIRECTOR DE MONITOREO · MAYIA ESCUCHA
            </div>

            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              lineHeight: 1.5,
              margin: '0 0 24px',
            }}>
              Supervisando la detección y transcripción en tiempo real sobre radio, TV y prensa con servidores propios de IA.
            </p>

            {/* Lista estilo enlaces Twitter, LinkedIn, GitHub con flecha ↗ */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF', fontWeight: 600 }}>
                  <Shield size={15} color="#DBF285" />
                  <span>Rol del Sistema</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
                  <span>Auditor Senior</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF', fontWeight: 600 }}>
                  <Mail size={15} color="#DBF285" />
                  <span>Contacto</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
                  <span>Verificado</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF', fontWeight: 600 }}>
                  <Cpu size={15} color="#DBF285" />
                  <span>Motor IA</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
                  <span>IA en Servidor Propio</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF', fontWeight: 600 }}>
                  <Lock size={15} color="#DBF285" />
                  <span>Seguridad</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
                  <span>JWT Cifrado</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para descartar cambios pendientes */}
      <ConfirmDialog
        isOpen={confirmDiscardOpen}
        title="¿Descartar los cambios pendientes?"
        subtitle="Alerta de Formulario"
        description="Has realizado modificaciones en tus datos o contraseñas que aún no has guardado."
        warnings={[
          "Los datos editados no guardados se perderán inmediatamente.",
          "Tus credenciales actuales seguirán activas sin modificaciones.",
        ]}
        confirmText="Descartar y salir"
        cancelText="Seguir editando"
        danger={true}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setConfirmDiscardOpen(false)}
      />
    </div>
  );
};

