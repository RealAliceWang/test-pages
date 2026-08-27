import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useApp } from '../../store';

/** Gate for the whole app shell: signed-out sessions only see /login and /register. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useApp();
  if (!state.authed) return <Navigate to="/login" replace />;
  return children;
}
