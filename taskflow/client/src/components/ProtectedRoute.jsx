import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

function FullPageLoader() {
  return (
    <div className="center-screen">
      <Spinner label="Loading your workspace" />
    </div>
  );
}

/** Only logged-in users may see the nested routes. */
export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <FullPageLoader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Logged-in users are sent to the dashboard instead of the login/register pages. */
export function GuestRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <FullPageLoader />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
