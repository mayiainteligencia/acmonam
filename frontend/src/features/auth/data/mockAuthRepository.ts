import type { AuthRepository, Credentials, Registration, Session } from '../domain/auth';

const SIMULATED_LATENCY_MS = 600;

/**
 * Adaptador de desarrollo: acepta cualquier credencial válida y simula latencia.
 * Solo se activa con VITE_AUTH_MODE=mock (o en `vite dev` sin configuración).
 */
export function createMockAuthRepository(): AuthRepository {
  return {
    async login({ email }: Credentials): Promise<Session> {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
      const normalized = email.trim().toLowerCase();
      return {
        token: `mock-${crypto.randomUUID()}`,
        user: { email: normalized, name: normalized.split('@')[0] ?? normalized },
      };
    },
    async register({ name, email }: Registration): Promise<Session> {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
      return { token: `mock-${crypto.randomUUID()}`, user: { email: email.trim().toLowerCase(), name: name.trim() } };
    },
    async logout(): Promise<void> {},
  };
}

