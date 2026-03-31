import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  
  // Si el rol del usuario no está en la lista de permitidos, lo mandamos al dashboard
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}