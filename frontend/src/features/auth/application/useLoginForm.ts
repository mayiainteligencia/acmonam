import { useState, type FormEvent } from 'react';
import { navigate } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import { AuthError, validateCredentials } from '../domain/auth';
import { useAuth } from './AuthContext';
import { saveRememberedAccount } from './rememberedAccounts';

/** Estado y acciones del formulario de login, sin lógica de presentación. */
export function useLoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const validationError = validateCredentials({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      saveRememberedAccount(email);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (cause) {
      console.error('[Login Error]', cause);
      setError(cause instanceof AuthError ? cause.message : (cause instanceof Error ? cause.message : 'Ocurrió un error inesperado al iniciar sesión.'));
      setSubmitting(false);
    }
  };

  return { email, setEmail, password, setPassword, error, submitting, submit };
}

