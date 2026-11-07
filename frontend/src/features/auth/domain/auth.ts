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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Devuelve el mensaje de error de validación o null si las credenciales son válidas. */
export function validateCredentials({ email, password }: Credentials): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) return 'Ingresa un correo electrónico válido.';
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
