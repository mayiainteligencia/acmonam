import { AuthProvider } from '../features/auth';
import { AppRouter } from './AppRouter';
import { authRepository, sessionStore } from './container';

export default function App() {
  return (
    <AuthProvider repository={authRepository} store={sessionStore}>
      <AppRouter />
    </AuthProvider>
  );
}
