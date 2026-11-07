import {
  createHttpAuthRepository,
  createLocalSessionStore,
  createMockAuthRepository,
} from '../features/auth';

/** Raíz de composición: aquí se eligen las implementaciones concretas de cada puerto. */
const authMode = import.meta.env.VITE_AUTH_MODE ?? (import.meta.env.DEV ? 'mock' : 'http');

export const authRepository =
  authMode === 'mock' ? createMockAuthRepository() : createHttpAuthRepository(import.meta.env.VITE_AUTH_API_URL ?? '/api');

export const sessionStore = createLocalSessionStore();

