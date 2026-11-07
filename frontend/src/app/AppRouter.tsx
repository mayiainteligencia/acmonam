import { Redirect, usePathname } from '../core/router';
import { LoginPage, RegisterPage, useAuth } from '../features/auth';
import { LandingPage } from '../features/landing';
import { DashboardApp } from './DashboardApp';
import { ROUTES } from './routes';

/** Tabla de rutas con guardas de sesión. */
export function AppRouter() {
  const pathname = usePathname();
  const { session } = useAuth();
  const isAuthenticated = session !== null;

  switch (pathname) {
    case ROUTES.login:
      return isAuthenticated ? <Redirect to={ROUTES.dashboard} /> : <LoginPage />;
    case ROUTES.register:
      return isAuthenticated ? <Redirect to={ROUTES.dashboard} /> : <RegisterPage />;
    case ROUTES.dashboard:
      return isAuthenticated ? <DashboardApp /> : <Redirect to={ROUTES.login} />;
    case ROUTES.landing:
      return <LandingPage />;
    default:
      return <Redirect to={ROUTES.landing} />;
  }
}

