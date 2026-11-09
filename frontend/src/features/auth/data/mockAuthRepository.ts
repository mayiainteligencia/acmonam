import type { AuthRepository, Credentials, Registration, Session } from '../domain/auth';
import { generateAuthToken } from '../domain/auth';

const SIMULATED_LATENCY_MS = 350;

/**
 * Adaptador de desarrollo y contingencia: acepta credenciales válidas y genera sesión local.
 * Tolerante a entornos HTTP y VMs remotas.
 */
export function createMockAuthRepository(): AuthRepository {
  return {
    async login({ email }: Credentials): Promise<Session> {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
      const raw = email.trim().toLowerCase();
      const normalizedEmail = raw.includes('@') ? raw : `${raw}@acam.mx`;
      const displayName = raw.split('@')[0] || 'Auditor';
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      return {
        token: generateAuthToken('mock'),
        user: { email: normalizedEmail, name: formattedName },
      };
    },
    async register({ name, email }: Registration): Promise<Session> {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
      const raw = email.trim().toLowerCase();
      const normalizedEmail = raw.includes('@') ? raw : `${raw}@acam.mx`;
      return {
        token: generateAuthToken('mock'),
        user: { email: normalizedEmail, name: name.trim() || 'Auditor' },
      };
    },
    async logout(): Promise<void> {},
  };
}

