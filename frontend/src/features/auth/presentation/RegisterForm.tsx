import { useState } from 'react';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { Link } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import { useRegisterForm } from '../application/useRegisterForm';
import { registerContent as t } from './registerContent';
import { LegalModal } from '../../../components/LegalModal';

/** Formulario de registro; reutiliza el estilo glass del login. */
export function RegisterForm() {
  const { name, setName, email, setEmail, password, setPassword, error, submitting, submit } = useRegisterForm();
  const [legalOpen, setLegalOpen] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [legalError, setLegalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!aceptoTerminos) {
      setLegalError('Debes aceptar los Términos de Servicio y el Acuerdo de Confidencialidad.');
      return;
    }
    setLegalError(null);
    submit(e);
  };

  return (
    <div className="login-card">
      <div className="login-card__header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <div className="float-field">
          <input
            id="register-name"
            name="mayia_new_name"
            type="text"
            autoComplete="off"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="register-name"><User size={16} aria-hidden="true" />{t.nameLabel}</label>
        </div>

        <div className="float-field">
          <input
            id="register-email"
            name="mayia_new_email"
            type="email"
            autoComplete="off"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="register-email"><Mail size={16} aria-hidden="true" />{t.emailLabel}</label>
        </div>

        <div className="float-field">
          <input
            id="register-password"
            name="mayia_new_secret"
            type="password"
            autoComplete="new-password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="register-password"><Lock size={16} aria-hidden="true" />{t.passwordLabel}</label>
        </div>

        {/* Checkbox Legal y de Confidencialidad */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          margin: '6px 0 14px',
          fontSize: '0.78rem',
          color: 'rgba(255, 255, 255, 0.75)',
          lineHeight: 1.4,
        }}>
          <input
            type="checkbox"
            id="acepto-terminos"
            checked={aceptoTerminos}
            onChange={(e) => {
              setAceptoTerminos(e.target.checked);
              if (e.target.checked) setLegalError(null);
            }}
            style={{
              marginTop: '3px',
              accentColor: '#DBF285',
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          <label htmlFor="acepto-terminos" style={{ cursor: 'pointer' }}>
            Acepto el{' '}
            <button
              type="button"
              onClick={() => setLegalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#DBF285',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontWeight: 600,
              }}
            >
              Acuerdo de Confidencialidad (NDA), Términos de Servicio y Política LFPDPPP
            </button>{' '}
            de ACAM.
          </label>
        </div>

        {(error || legalError) && (
          <p className="login-error" role="alert">{error || legalError}</p>
        )}

        <button type="submit" className="login-submit" disabled={submitting}>
          {submitting ? t.submitting : t.submit}
          {!submitting && <ArrowRight size={20} aria-hidden="true" />}
        </button>
      </form>

      <p className="login-card__footer">
        {t.hasAccount} <Link to={ROUTES.login} className="login-link-accent">{t.signIn}</Link>
      </p>

      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        onAccept={() => setAceptoTerminos(true)}
      />
    </div>
  );
}

