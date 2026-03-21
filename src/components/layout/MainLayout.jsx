import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, LogOut } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          Gestión Aso
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/impuestos" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <ReceiptText size={20} /> Impuestos
          </Link>
          {/* Agrega este enlace debajo del de Impuestos */}
          <Link to="/impuestos/historial" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <ReceiptText size={20} /> Historial de Pagos
          </Link>
          <Link to="/nomina" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <Users size={20} /> Nómina
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link to="/login" className="flex items-center gap-3 p-3 text-red-400 hover:bg-slate-700 rounded-lg transition-colors">
            <LogOut size={20} /> Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Aquí es donde React Router renderizará la página actual */}
        <Outlet />
      </main>
    </div>
  );
}