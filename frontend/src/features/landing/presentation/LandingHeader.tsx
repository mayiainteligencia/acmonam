import { Link } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import { brand, headerActions, navLinks } from '../content/landingContent';

export type NavId = (typeof navLinks)[number]['id'];

interface LandingHeaderProps {
  onNavigate: (id: NavId) => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingHeader({ onNavigate, onLogin, onRegister }: LandingHeaderProps) {
  return (
    <header className="landing-header">
      <div className="container-x landing-header__inner">
        <Link
          to={ROUTES.landing}
          className="landing-header__brand"
          aria-label={brand.name}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('inicio');
          }}
        >
          <img src={brand.logo} alt={brand.logoAlt} />
        </Link>

        <nav className="landing-header__nav" aria-label="Principal">
          {navLinks.map((link) => (
            <button key={link.id} type="button" onClick={() => onNavigate(link.id)}>{link.label}</button>
          ))}
        </nav>

        <div className="landing-header__actions">
          <button type="button" className="landing-header__link" onClick={onRegister}>
            {headerActions.register.label}
          </button>
          <button type="button" className="btn btn--glass" onClick={onLogin}>
            {headerActions.login.label}
          </button>
        </div>
      </div>
    </header>
  );
}
