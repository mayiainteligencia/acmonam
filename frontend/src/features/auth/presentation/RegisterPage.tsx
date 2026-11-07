import { ArrowLeft } from 'lucide-react';
import { Link } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import '../../../shared/styles/publicTheme.css';
import './login.css';
import { RegisterForm } from './RegisterForm';
import { SmokeyBackground } from './SmokeyBackground';
import { registerContent as t } from './registerContent';

export function RegisterPage() {
  return (
    <main className="public-theme login-page">
      <SmokeyBackground />
      <Link to={ROUTES.landing} className="login-back">
        <ArrowLeft size={16} aria-hidden="true" />
        {t.backToHome}
      </Link>
      <RegisterForm />
    </main>
  );
}

