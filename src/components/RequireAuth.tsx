import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type RequireAuthProps = {
  userId: string | null;
  children: ReactElement;
};

export default function RequireAuth({ userId, children }: RequireAuthProps) {
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
