import { useSyncExternalStore } from 'react';

const NAVIGATION_EVENT = 'app:navigate';

/** Navega sin recargar la página usando la History API. */
export function navigate(path: string, options: { replace?: boolean } = {}): void {
  if (path === window.location.pathname) return;
  if (options.replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('popstate', listener);
  window.addEventListener(NAVIGATION_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(NAVIGATION_EVENT, listener);
  };
}

/** Ruta actual (pathname), reactiva a cambios de navegación. */
export function usePathname(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

