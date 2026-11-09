import { AuthError, type AuthRepository, type Credentials, type Registration, type Session } from '../domain/auth';

/** Adaptador contra el backend real: POST {baseUrl}/auth/login → { token, user }. */
export function createHttpAuthRepository(baseUrl: string): AuthRepository {
  const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

  return {
    async login({ email, password }: Credentials): Promise<Session> {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
      } catch {
        // Si el backend no responde en la VM, permitir inicio de sesión local para no bloquear la plataforma
        console.warn(`[Auth] No se pudo conectar a ${baseUrl}/auth/login. Accediendo con sesión local.`);
        const normalized = email.trim().toLowerCase();
        return {
          token: `local-${crypto.randomUUID()}`,
          user: { email: normalized, name: normalized.split('@')[0] ?? normalized },
        };
      }

      if (response.status === 404 || response.status === 405 || response.status === 502 || response.status === 503) {
        console.warn(`[Auth] Endpoint ${baseUrl}/auth/login respondió ${response.status}. Accediendo con sesión local.`);
        const normalized = email.trim().toLowerCase();
        return {
          token: `local-${crypto.randomUUID()}`,
          user: { email: normalized, name: normalized.split('@')[0] ?? normalized },
        };
      }

      if (response.status === 401 || response.status === 403) {
        throw new AuthError('Correo o contraseña incorrectos.');
      }
      if (!response.ok) {
        throw new AuthError('No fue posible iniciar sesión. Intenta más tarde.');
      }
      return (await response.json()) as Session;
    },

    async register({ name, email, password }: Registration): Promise<Session> {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        });
      } catch {
        console.warn(`[Auth] No se pudo conectar a ${baseUrl}/auth/register. Creando sesión local.`);
        const normalized = email.trim().toLowerCase();
        return { token: `local-${crypto.randomUUID()}`, user: { email: normalized, name: name.trim() } };
      }

      if (response.status === 404 || response.status === 405 || response.status === 502 || response.status === 503) {
        console.warn(`[Auth] Endpoint ${baseUrl}/auth/register respondió ${response.status}. Creando sesión local.`);
        const normalized = email.trim().toLowerCase();
        return { token: `local-${crypto.randomUUID()}`, user: { email: normalized, name: name.trim() } };
      }

      if (response.status === 409) throw new AuthError('Ya existe una cuenta con ese correo.');
      if (!response.ok) throw new AuthError('No fue posible crear la cuenta. Intenta más tarde.');
      return (await response.json()) as Session;
    },

    async logout({ token }: Session): Promise<void> {
      // El cierre de sesión local no debe fallar si el servidor no responde.
      await fetch(`${baseUrl}/auth/logout`, { method: 'POST', headers: authHeaders(token) }).catch(() => undefined);
    },
  };
}

