import { ArrowRight, Lock, User } from 'lucide-react';
import { Link } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import { useLoginForm } from '../application/useLoginForm';
import { GoogleIcon } from './GoogleIcon';
import { loginContent as t } from './loginContent';

interface LoginFormProps {
  /** Si no se provee, el botón de Google se muestra deshabilitado. */
  onGoogleLogin?: () => void;
}

/** Formulario glassmorphism con etiquetas flotantes. */
export function LoginForm({ onGoogleLogin }: LoginFormProps) {
  const { email, setEmail, password, setPassword, error, submitting, submit } = useLoginForm();

  return (
    <div className="login-card">
      <div className="login-card__header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <form className="login-form" onSubmit={submit} noValidate>
        <div className="float-field">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
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
            type="password"
            autoComplete="current-password"
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

