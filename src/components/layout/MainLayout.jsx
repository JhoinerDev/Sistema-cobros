import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, LogOut, UserCog } from 'lucide-react';

export default function MainLayout() {
  const { role, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login'); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl">
        <div className="p-6 text-xl font-bold border-b border-slate-700 tracking-tight">
          Gestión <span className="text-emerald-400">Aso</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 text-sm">
          {/* Dashboard: Visible para TODOS */}
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          
          {/* Recaudación e Historial: Visible para ADMIN y COBRADOR */}
          {(role === "admin" || role === "cobrador") && (
            <>
              <Link to="/impuestos" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
                <ReceiptText size={18} /> Recaudación
              </Link>

              <Link to="/impuestos/historial" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
                <ReceiptText size={18} /> Historial
              </Link>
            </>
          )}

          {/* Nómina y B.D Locatarios: SOLO para ADMIN */}
          {role === "admin" && (
            <>
              <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Administración
              </div>
              
              <Link to="/nomina" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors text-slate-300">
                <Users size={18} /> Nómina
              </Link>

              <Link to="/admin/locatarios" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors text-slate-300">
                <Users size={18} /> B.D Locatarios
              </Link>

              <Link to="/usuarios" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors text-emerald-400 font-medium">
                <UserCog size={18} /> Gestionar Usuarios
              </Link>
            </>
          )}
        </nav>

        {/* Botón de Salida */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-bold"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}