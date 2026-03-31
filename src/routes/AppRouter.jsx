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

// --- COMPONENTE PROTECTOR ---
// Este componente revisa si el usuario tiene permiso para ver la página
const RoleGuard = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null; // Espera a que Firebase responda
  if (!user) return <Navigate to="/login" replace />;
  
  // SOLUCIÓN AL BUCLE INFINITO:
  // En lugar de redirigir, mostramos un mensaje en pantalla. 
  // Esto evita que React colapse intentando redirigir infinitamente.
  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 mt-10">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Acceso Restringido</h2>
        <p className="text-slate-600">
          Tu rol actual <strong className="uppercase">({role})</strong> no tiene permisos para acceder a esta ruta.
        </p>
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
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas dentro del Layout */}
          <Route element={<MainLayout />}>
            
            {/* 1. Rutas que AMBOS (Admin y Cobrador) pueden ver */}
            <Route element={<RoleGuard allowedRoles={['admin', 'cobrador']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/impuestos" element={<GestionImpuestos />} />
              <Route path="/impuestos/historial" element={<HistorialPagos />} />
            </Route>

            {/* 2. Rutas que SOLO el ADMIN puede ver */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/nomina" element={<GestionNomina />} />
              <Route path="/usuarios" element={<UserManagement />} />
              <Route path="/admin/locatarios" element={<AdminLocatarios />} />
            </Route>

          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}