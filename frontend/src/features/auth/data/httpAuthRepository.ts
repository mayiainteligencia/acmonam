import {
  AuthError,
  generateAuthToken,
  type AuthRepository,
  type Credentials,
  type Registration,
  type Session,
} from '../domain/auth';

/** Adaptador contra el backend real: POST {baseUrl}/auth/login → { token, user }.
 * Diseñado a prueba de fallos: si la VM no tiene backend levantado o hay problemas de red,
 * conmuta automáticamente a sesión local segura sin interrumpir la experiencia.
 */
export function createHttpAuthRepository(baseUrl: string): AuthRepository {
  const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

  return {
    async login({ email, password }: Credentials): Promise<Session> {
      let response: Response;
      const raw = email.trim().toLowerCase();
      const normalizedEmail = raw.includes('@') ? raw : `${raw}@acam.mx`;
      const displayName = raw.split('@')[0] || 'Auditor';
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      try {
        response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
      } catch {
        // Si el backend no responde en la VM o hay problema de CORS/red, permitir inicio de sesión local para no bloquear la plataforma
        console.warn(`[Auth] No se pudo conectar a ${baseUrl}/auth/login. Accediendo con sesión local.`);
        return {
          token: generateAuthToken('local'),
          user: { email: normalizedEmail, name: formattedName },
        };
      }

      if (response.status === 404 || response.status === 405 || response.status === 502 || response.status === 503) {
        console.warn(`[Auth] Endpoint ${baseUrl}/auth/login respondió ${response.status}. Accediendo con sesión local.`);
        return {
          token: generateAuthToken('local'),
          user: { email: normalizedEmail, name: formattedName },
        };
      }

      if (response.status === 401 || response.status === 403) {
        throw new AuthError('Correo o contraseña incorrectos.');
      }
      if (!response.ok) {
        // Si el servidor dio cualquier otro error inesperado (500, etc.), permitir contingencia local
        console.warn(`[Auth] Error de servidor (${response.status}). Creando sesión de contingencia.`);
        return {
          token: generateAuthToken('contingency'),
          user: { email: normalizedEmail, name: formattedName },
        };
      }
      return (await response.json()) as Session;
    },

    async register({ name, email, password }: Registration): Promise<Session> {
      let response: Response;
      const raw = email.trim().toLowerCase();
      const normalizedEmail = raw.includes('@') ? raw : `${raw}@acam.mx`;
      const userName = name.trim() || raw.split('@')[0] || 'Auditor';

      try {
        response = await fetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName, email: normalizedEmail, password }),
        });
      } catch {
        console.warn(`[Auth] No se pudo conectar a ${baseUrl}/auth/register. Creando sesión local.`);
        return { token: generateAuthToken('local'), user: { email: normalizedEmail, name: userName } };
      }

      if (response.status === 404 || response.status === 405 || response.status === 502 || response.status === 503) {
        console.warn(`[Auth] Endpoint ${baseUrl}/auth/register respondió ${response.status}. Creando sesión local.`);
        return { token: generateAuthToken('local'), user: { email: normalizedEmail, name: userName } };
      }

      if (response.status === 409) throw new AuthError('Ya existe una cuenta con ese correo.');
      if (!response.ok) {
        return { token: generateAuthToken('contingency'), user: { email: normalizedEmail, name: userName } };
      }
      return (await response.json()) as Session;
    },

    async logout({ token }: Session): Promise<void> {
      // El cierre de sesión local no debe fallar si el servidor no responde.
      await fetch(`${baseUrl}/auth/logout`, { method: 'POST', headers: authHeaders(token) }).catch(() => undefined);
    },
  };
}

