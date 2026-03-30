import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, LogOut, History, Wallet } from 'lucide-react';
import { logout } from "../../services/firebase";
import { useState } from 'react';

export default function MainLayout() {
  const navigate = useNavigate();
  
  // PRUEBA: Cambia esto a 'Cobrador' para ver cómo se ocultan las opciones automáticamente
  const [role, setRole] = useState('Admin'); 

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl">
        <div className="p-8 text-2xl font-black text-white tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet size={18} className="text-white" />
          </div>
          Gestión Aso
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Principal</p>
          
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-800 hover:text-white rounded-xl transition-all group">
            <LayoutDashboard size={20} className="group-hover:text-blue-400" /> 
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>

          <Link to="/impuestos" className="flex items-center gap-3 p-3 hover:bg-slate-800 hover:text-white rounded-xl transition-all group">
            <ReceiptText size={20} className="group-hover:text-blue-400" /> 
            <span className="font-semibold text-sm">Cobro Impuestos</span>
          </Link>

          <Link to="/impuestos/historial" className="flex items-center gap-3 p-3 hover:bg-slate-800 hover:text-white rounded-xl transition-all group">
            <History size={20} className="group-hover:text-blue-400" /> 
            <span className="font-semibold text-sm">Historial</span>
          </Link>

          {/* SECCIÓN RESTRINGIDA: Solo para Admins */}
          {role === 'Admin' && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Administración</p>
              </div>
              
              <Link to="/nomina" className="flex items-center gap-3 p-3 hover:bg-slate-800 hover:text-white rounded-xl transition-all group">
                <Wallet size={20} className="group-hover:text-blue-400" /> 
                <span className="font-semibold text-sm">Nómina</span>
              </Link>

              <Link to="/usuarios" className="flex items-center gap-3 p-3 hover:bg-slate-800 hover:text-white rounded-xl transition-all group">
                <Users size={20} className="group-hover:text-blue-400" /> 
                <span className="font-semibold text-sm">Gestión Usuarios</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer del Sidebar con el botón de salida */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut size={20} /> 
            <span className="font-bold text-sm text-left">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-end px-8">
           <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{role}</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
                A
              </div>
           </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}