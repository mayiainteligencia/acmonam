import { useState, useEffect } from 'react';
import { ArrowRight, Lock, User, X } from 'lucide-react';
import { Link } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import { useLoginForm } from '../application/useLoginForm';
import {
  getRememberedAccounts,
  removeRememberedAccount,
  type RememberedAccount,
} from '../application/rememberedAccounts';
import { GoogleIcon } from './GoogleIcon';
import { loginContent as t } from './loginContent';

interface LoginFormProps {
  /** Si no se provee, el botón de Google se muestra deshabilitado. */
  onGoogleLogin?: () => void;
}

/** Formulario glassmorphism con etiquetas flotantes y selector de cuentas locales. */
export function LoginForm({ onGoogleLogin }: LoginFormProps) {
  const { email, setEmail, password, setPassword, error, submitting, submit } = useLoginForm();
  const [remembered, setRemembered] = useState<RememberedAccount[]>([]);

  useEffect(() => {
    setRemembered(getRememberedAccounts());
  }, []);

  const handleSelectAccount = (acc: RememberedAccount) => {
    setEmail(acc.email);
    const passInput = document.getElementById('login-password') as HTMLInputElement | null;
    passInput?.focus();
  };

  const handleRemoveAccount = (e: React.MouseEvent, accEmail: string) => {
    e.stopPropagation();
    removeRememberedAccount(accEmail);
    setRemembered(getRememberedAccounts());
  };

  return (
    <div className="login-card">
      <div className="login-card__header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      {remembered.length > 0 && !email && (
        <div className="remembered-box">
          <div className="remembered-box__header">
            <span>Cuentas en este equipo</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.65 }}>Guardadas aquí</span>
          </div>
          <div className="remembered-box__list">
            {remembered.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="remembered-item"
                onClick={() => handleSelectAccount(acc)}
              >
                <div className="remembered-item__info">
                  <div className="remembered-item__avatar">
                    {(acc.name || acc.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="remembered-item__text">
                    <span className="remembered-item__name">{acc.name || acc.email}</span>
                    <span className="remembered-item__email">{acc.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="remembered-item__remove"
                  onClick={(e) => handleRemoveAccount(e, acc.email)}
                  title="Olvidar cuenta"
                  aria-label="Olvidar cuenta"
                >
                  <X size={14} />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="login-form" onSubmit={submit} noValidate autoComplete="off">
        <div className="float-field">
          <input
            id="login-email"
            name="mayia_account_identifier"
            type="email"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="login-email">
            <User size={16} aria-hidden="true" />
            {t.emailLabel}
          </label>
        </div>

        <div className="float-field">
          <input
            id="login-password"
            name="mayia_account_key"
            type="password"
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="login-password">
            <Lock size={16} aria-hidden="true" />
            {t.passwordLabel}
          </label>
        </div>

        <div className="login-form__aux">
          <a href="#" className="login-link-muted">{t.forgotPassword}</a>
        </div>

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" className="login-submit" disabled={submitting}>
          {submitting ? t.submitting : t.submit}
          {!submitting && <ArrowRight size={20} aria-hidden="true" />}
        </button>

        <div className="login-divider"><span>{t.divider}</span></div>

        <button
          type="button"
          className="login-google"
          onClick={onGoogleLogin}
          disabled={!onGoogleLogin}
          title={onGoogleLogin ? undefined : t.googleUnavailable}
        >
          <GoogleIcon />
          {t.google}
        </button>
      </form>

      <p className="login-card__footer">
        {t.noAccount} <Link to={ROUTES.register} className="login-link-accent">{t.createAccount}</Link>
      </p>
    </div>
  );
}

