import type { Session, SessionStore } from '../domain/auth';

const STORAGE_KEY = 'acam.session';

/** Persiste la sesión en localStorage, tolerando datos corruptos o storage no disponible. */
export function createLocalSessionStore(): SessionStore {
  return {
    load() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Session) : null;
      } catch {
        return null;
      }
    },
    save(session) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch {
        /* sin persistencia: la sesión vive solo en memoria */
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* nada que limpiar */
      }
    },
  };
}

