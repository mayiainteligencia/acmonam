import { useState, type FormEvent } from 'react';
import { navigate } from '../../../core/router';
import { ROUTES } from '../../../app/routes';
import { AuthError, validateRegistration } from '../domain/auth';
import { useAuth } from './AuthContext';
import { saveRememberedAccount } from './rememberedAccounts';

/** Estado y acciones del formulario de registro, sin lógica de presentación. */
export function useRegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const validationError = validateRegistration({ name, email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password });
      saveRememberedAccount(email, name);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (cause) {
      setError(cause instanceof AuthError ? cause.message : 'Ocurrió un error inesperado.');
      setSubmitting(false);
    }
  };

  return { name, setName, email, setEmail, password, setPassword, error, submitting, submit };
}

