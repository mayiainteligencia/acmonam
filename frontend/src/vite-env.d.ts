/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'http' usa el backend real; 'mock' simula la sesión (solo desarrollo). */
  readonly VITE_AUTH_MODE?: 'http' | 'mock';
  /** Base de la API de autenticación. Por defecto '/api'. */
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_MONITOR_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

