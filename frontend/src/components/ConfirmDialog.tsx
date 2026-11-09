import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
  subtitle,
  description,
  warnings,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
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
        background: 'rgba(4, 8, 3, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#0d130a',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.5)',
          padding: '24px 26px 20px',
          position: 'relative',
          color: '#FFFFFF',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          animation: 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Botón cerrar sutil */}
        <button
          onClick={onCancel}
          title="Cerrar"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.45)',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'; }}
        >
          <X size={16} />
        </button>

        {/* Subtítulo discreto */}
        {subtitle && (
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#DBF285',
            marginBottom: '4px',
          }}>
            {subtitle}
          </div>
        )}

        {/* Título limpio */}
        <h3 style={{
          margin: '0 0 8px',
          fontSize: '19px',
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          paddingRight: '24px',
        }}>
          {title}
        </h3>

        {/* Mensaje principal */}
        <p style={{
          margin: '0 0 16px',
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>

        {/* Notas breves (si existen) de forma sobria */}
        {warnings && warnings.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '18px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <ul style={{
              margin: 0,
              paddingLeft: '14px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: 1.45,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Acciones minimalistas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          marginTop: '6px',
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '9px 20px',
              borderRadius: '12px',
              border: danger ? '1px solid rgba(239, 68, 68, 0.4)' : 'none',
              background: danger ? 'rgba(239, 68, 68, 0.18)' : '#DBF285',
              color: danger ? '#FCA5A5' : '#0d130a',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (danger) {
                e.currentTarget.style.background = '#EF4444';
                e.currentTarget.style.color = '#FFFFFF';
              } else {
                e.currentTarget.style.background = '#e8fab5';
              }
            }}
            onMouseLeave={(e) => {
              if (danger) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                e.currentTarget.style.color = '#FCA5A5';
              } else {
                e.currentTarget.style.background = '#DBF285';
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
