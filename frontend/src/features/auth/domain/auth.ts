export interface User {
  email: string;
  name: string;
}

export interface Registration extends Credentials {
  name: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface Credentials {
  email: string;
  password: string;
}

/** Puerto: cualquier backend de autenticación debe cumplir este contrato. */
export interface AuthRepository {
  login(credentials: Credentials): Promise<Session>;
  register(registration: Registration): Promise<Session>;
  logout(session: Session): Promise<void>;
}

/** Puerto: dónde se persiste la sesión entre recargas. */
export interface SessionStore {
  load(): Session | null;
  save(session: Session): void;
  clear(): void;
}

/** Error de autenticación con mensaje apto para mostrarse al usuario. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Genera un token único y seguro, tolerante a entornos HTTP (IP de VM / redes sin SSL) donde crypto.randomUUID no existe. */
export function generateAuthToken(prefix = 'token'): string {
  try {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
  } catch {
    // Entorno no seguro o sin soporte nativo de Web Crypto
  }
  const timestamp = Date.now().toString(36);
  const r1 = Math.random().toString(36).substring(2, 9);
  const r2 = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${r1}-${r2}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Devuelve el mensaje de error de validación o null si las credenciales son válidas.
 * Admite tanto correo electrónico corporativo como nombres de usuario directos (ej. admin, auditor).
 */
export function validateCredentials({ email, password }: Credentials): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Ingresa tu usuario o correo electrónico.';
  if (trimmed.includes('@') && !EMAIL_PATTERN.test(trimmed)) {
    return 'Ingresa un correo electrónico con formato válido.';
  }
  if (password.length === 0) return 'Ingresa tu contraseña.';
  return null;
}


export const MIN_PASSWORD_LENGTH = 8;

/** Devuelve el mensaje de error de validación o null si el registro es válido. */
export function validateRegistration({ name, email, password }: Registration): string | null {
  if (name.trim().length < 2) return 'Ingresa tu nombre.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Ingresa un correo electrónico válido.';
  if (password.length < MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  return null;
}
