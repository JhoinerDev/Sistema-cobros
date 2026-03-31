import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, LogOut, UserCog, AlertCircle, Loader2 } from 'lucide-react';

export default function MainLayout() {
  // Extraemos 'loading' también para saber si estamos esperando a Firebase
  const { role, logout, loading, user } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login'); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // 1. ESTADO DE CARGA: Si Firebase aún no responde
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-600 font-medium">Verificando credenciales...</p>
      </div>
    );
  }

  // 2. ERROR DE ROL: Si el usuario existe pero no tiene documento en Firestore o el campo 'role' está vacío
  if (!role) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertCircle className="text-red-500 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-slate-800">Acceso Restringido</h1>
        <p className="text-slate-600 mt-2 max-w-md">
          Tu cuenta <strong>({user?.email})</strong> no tiene un rol asignado en la base de datos o el UID no coincide.
        </p>
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-sm font-mono text-left">
          <p><strong>UID:</strong> {user?.uid}</p>
          <p><strong>Sugerencia:</strong> Verifica que en Firestore exista un documento con este ID exacto dentro de la colección "usuarios".</p>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-8 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Volver al Login
        </button>
      </div>
    );
  }

  // 3. RENDERIZADO NORMAL: Si todo está bien
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl">
        <div className="p-6 text-xl font-bold border-b border-slate-700 tracking-tight flex justify-between items-center">
          <div>Gestión <span className="text-emerald-400">Aso</span></div>
          <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase">
            {role}
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          
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

              <Link to="/usuarios" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-colors text-emerald-400 font-medium border-l-2 border-emerald-400 ml-1">
                <UserCog size={18} /> Gestionar Usuarios
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-bold"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}