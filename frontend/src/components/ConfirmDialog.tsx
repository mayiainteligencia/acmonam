import React, { useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  description: string;
  warnings?: string[];
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  subtitle = 'Confirmación de seguridad',
  description,
  warnings,
  confirmText = 'Continuar',
  cancelText = 'Cancelar y volver',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(3, 7, 3, 0.82)',
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
          maxWidth: '490px',
          background: '#0b1108',
          borderRadius: '28px',
          border: danger
            ? '1px solid rgba(239, 68, 68, 0.35)'
            : '1px solid rgba(219, 242, 133, 0.25)',
          boxShadow: danger
            ? '0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(239, 68, 68, 0.12)'
            : '0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(219, 242, 133, 0.08)',
          padding: '28px 28px 24px',
          position: 'relative',
          color: '#FFFFFF',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onCancel}
          title="Cerrar modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.6)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          }}
        >
          <X size={16} />
        </button>

        {/* Header con icono de advertencia */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '18px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: danger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(219, 242, 133, 0.12)',
              border: danger ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(219, 242, 133, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: danger ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(219, 242, 133, 0.2)',
            }}
          >
            {danger ? (
              <ShieldAlert size={24} color="#EF4444" />
            ) : (
              <AlertTriangle size={24} color="#DBF285" />
            )}
          </div>

          <div style={{ flex: 1, paddingRight: '20px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: danger ? '#F87171' : '#DBF285',
                marginBottom: '4px',
              }}
            >
              {subtitle}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Descripción */}
        <p
          style={{
            margin: '0 0 16px',
            fontSize: '13.5px',
            color: '#D1D5DB',
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>

        {/* Puntos de advertencia / precaución */}
        {warnings && warnings.length > 0 && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '16px',
              padding: '12px 16px',
              marginBottom: '22px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#F87171',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={13} />
              Ten en cuenta antes de continuar:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12.5px',
                color: '#E5E7EB',
                lineHeight: 1.45,
              }}
            >
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Acciones */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
          }}
        >
          {/* Botón seguro (Cancelar) */}
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <Check size={16} />
            {cancelText}
          </button>

          {/* Botón de acción peligrosa (Cerrar sesión / Confirmar) */}
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              border: danger
                ? '1px solid rgba(239, 68, 68, 0.45)'
                : '1px solid rgba(219, 242, 133, 0.45)',
              background: danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(219, 242, 133, 0.15)',
              color: danger ? '#F87171' : '#DBF285',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = danger ? '#EF4444' : '#DBF285';
              e.currentTarget.style.color = danger ? '#FFFFFF' : '#0d130a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(219, 242, 133, 0.15)';
              e.currentTarget.style.color = danger ? '#F87171' : '#DBF285';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

