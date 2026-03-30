import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout'; // Importa el Layout
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import GestionImpuestos from '../pages/impuestos/GestionImpuestos';
import HistorialPagos from '../pages/impuestos/historial/HistorialPagos';
import GestionNomina from '../pages/nomina/GestionNomina';
import AdminLocatarios from '../pages/admin/AdminLocatarios';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login (sin menú) */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas (todas dentro del MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/impuestos" element={<GestionImpuestos />} />
          <Route path="/nomina" element={<GestionNomina />} />
          <Route path="/impuestos/historial" element={<HistorialPagos />} />
          <Route path="/admin/locatarios" element={<AdminLocatarios />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
