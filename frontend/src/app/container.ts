import {
  createHttpAuthRepository,
  createLocalSessionStore,
  createMockAuthRepository,
} from '../features/auth';

/** Raíz de composición: aquí se eligen las implementaciones concretas de cada puerto.
 * Por defecto se usa 'mock' (sesión local autónoma) para que la plataforma funcione de inmediato
 * tanto en local como al compilar y subir a cualquier VM sin requerir un microservicio externo de auth.
 * Si se desea forzar el backend HTTP en un despliegue con base de datos, configurar VITE_AUTH_MODE=http.
 */
const authMode = import.meta.env.VITE_AUTH_MODE === 'http' ? 'http' : 'mock';

export const authRepository =
  authMode === 'mock' ? createMockAuthRepository() : createHttpAuthRepository(import.meta.env.VITE_AUTH_API_URL ?? '/api');

export const sessionStore = createLocalSessionStore();

