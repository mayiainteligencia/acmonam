import { useEffect } from 'react';
import { navigate } from './navigation';

/** Redirige (reemplazando la entrada del historial) al montarse. */
export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);
  return null;
}

