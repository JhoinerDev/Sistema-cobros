import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, LogOut, UserCog } from 'lucide-react';

export default function MainLayout() {
  // NOTA: Tu compañero agregó lógica de roles. 
  // Por ahora definimos uno por defecto para que no explote la app.
  const role = "admin"; 

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          Gestión Aso
        </div>
        
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          
          <Link to="/impuestos" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <ReceiptText size={18} /> Recaudación
          </Link>

          <Link to="/impuestos/historial" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <ReceiptText size={18} /> Historial
          </Link>

          <Link to="/nomina" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <Users size={18} /> Nómina
          </Link>

          {/* Enlace a la Base de Datos que arreglamos */}
          <Link to="/admin/locatarios" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <Users size={18} /> B.D Locatarios
          </Link>

          {/* Enlace que trajo tu compañero (solo visible si es admin) */}
          {role === "admin" && (
            <Link to="/usuarios" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
              <UserCog size={18} /> Gestionar Usuarios
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link to="/login" className="flex items-center gap-3 p-3 text-red-400 hover:bg-slate-700 rounded-lg transition-colors">
            <LogOut size={18} /> Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}