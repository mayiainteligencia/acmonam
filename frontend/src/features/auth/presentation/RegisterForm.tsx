import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { Link } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import { useRegisterForm } from '../application/useRegisterForm';
import { registerContent as t } from './registerContent';

/** Formulario de registro; reutiliza el estilo glass del login. */
export function RegisterForm() {
  const { name, setName, email, setEmail, password, setPassword, error, submitting, submit } = useRegisterForm();

  return (
    <div className="login-card">
      <div className="login-card__header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <form className="login-form" onSubmit={submit} noValidate>
        <div className="float-field">
          <input id="register-name" type="text" autoComplete="name" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} required />
          <label htmlFor="register-name"><User size={16} aria-hidden="true" />{t.nameLabel}</label>
        </div>

        <div className="float-field">
          <input id="register-email" type="email" autoComplete="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="register-email"><Mail size={16} aria-hidden="true" />{t.emailLabel}</label>
        </div>

        <div className="float-field">
          <input id="register-password" type="password" autoComplete="new-password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
          <label htmlFor="register-password"><Lock size={16} aria-hidden="true" />{t.passwordLabel}</label>
        </div>

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" className="login-submit" disabled={submitting}>
          {submitting ? t.submitting : t.submit}
          {!submitting && <ArrowRight size={20} aria-hidden="true" />}
        </button>
      </form>

      <p className="login-card__footer">
        {t.hasAccount} <Link to={ROUTES.login} className="login-link-accent">{t.signIn}</Link>
      </p>
    </div>
  );
}

