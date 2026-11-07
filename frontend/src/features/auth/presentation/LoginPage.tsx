import { ArrowLeft } from 'lucide-react';
import { Link } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import '../../../shared/styles/publicTheme.css';
import './login.css';
import { LoginForm } from './LoginForm';
import { SmokeyBackground } from './SmokeyBackground';
import { loginContent as t } from './loginContent';

export function LoginPage() {
  return (
    <main className="public-theme login-page">
      <SmokeyBackground />
      <Link to={ROUTES.landing} className="login-back">
        <ArrowLeft size={16} aria-hidden="true" />
        {t.backToHome}
      </Link>
      <LoginForm />
    </main>
  );
}

