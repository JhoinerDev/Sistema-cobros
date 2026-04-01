import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import GestionImpuestos from '../pages/impuestos/GestionImpuestos';
import HistorialPagos from '../pages/impuestos/historial/HistorialPagos';
import GestionNomina from '../pages/nomina/GestionNomina';
import UserManagement from '../pages/user/Usuarios';
import AdminLocatarios from '../pages/admin/AdminLocatarios';
import { AuthProvider, useAuth } from '../context/AuthContext'; 
import { ShieldAlert, Loader2 } from 'lucide-react'; // Añadidos para mejorar la UI

// --- COMPONENTE PROTECTOR ---
const RoleGuard = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // Pantalla de carga mientras Firebase verifica la sesión
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-slate-500 animate-pulse">Cargando permisos...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  // Vista de error responsiva para acceso denegado
  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 max-w-md w-full text-center">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Acceso Denegado</h2>
          <p className="text-slate-500 leading-relaxed mb-6">
            Tu nivel de acceso actual es <strong className="uppercase text-slate-700 font-bold">[{role}]</strong>. 
            No tienes los permisos necesarios para ver esta sección.
          </p>
          <div className="h-1 w-20 bg-slate-100 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default function AppRouter() {
  return (
    <AuthProvider> 
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública: El Login ya maneja su propia responsividad */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas dentro del Layout Responsivo */}
          <Route element={<MainLayout />}>
            
            {/* 1. Rutas para Admin y Cobrador */}
            <Route element={<RoleGuard allowedRoles={['admin', 'cobrador']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/impuestos" element={<GestionImpuestos />} />
              <Route path="/impuestos/historial" element={<HistorialPagos />} />
            </Route>

            {/* 2. Rutas exclusivas de Administrador */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/nomina" element={<GestionNomina />} />
              <Route path="/usuarios" element={<UserManagement />} />
              <Route path="/admin/locatarios" element={<AdminLocatarios />} />
            </Route>

          </Route>

          {/* Redirección por defecto si la ruta no existe */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}