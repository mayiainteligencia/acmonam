import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthRepository, Credentials, Registration, Session, SessionStore } from '../domain/auth';

interface AuthContextValue {
  session: Session | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (registration: Registration) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  repository: AuthRepository;
  store: SessionStore;
  children: ReactNode;
}

/** Orquesta el caso de uso de autenticación; las dependencias llegan inyectadas. */
export function AuthProvider({ repository, store, children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(() => store.load());

  const login = useCallback(
    async (credentials: Credentials) => {
      const next = await repository.login(credentials);
      store.save(next);
      setSession(next);
    },
    [repository, store],
  );

  const register = useCallback(
    async (registration: Registration) => {
      const next = await repository.register(registration);
      store.save(next);
      setSession(next);
    },
    [repository, store],
  );

  const logout = useCallback(async () => {
    if (session) await repository.logout(session);
    store.clear();
    setSession(null);
  }, [repository, store, session]);

  const value = useMemo(() => ({ session, login, register, logout }), [session, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return context;
}

