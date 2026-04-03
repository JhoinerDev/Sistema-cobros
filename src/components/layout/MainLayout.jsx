import { useState } from 'react'; 
import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ReceiptText, Users, LogOut, 
  UserCog, AlertCircle, Loader2, Menu, X 
} from 'lucide-react';

export default function MainLayout() {
  const { role, logout, loading, user } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation(); // Añadido para detectar la ruta activa
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const normalizedRole = role?.toLowerCase();

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login'); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para cerrar menú móvil al hacer click
  const closeMobile = () => setIsMobileMenuOpen(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-600 font-medium">Verificando credenciales...</p>
      </div>
    );
  }

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
          <p><strong>Sugerencia:</strong> Verifica que en Firestore exista un documento con este ID exacto dentro de la colección "users".</p>
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

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed md:relative inset-y-0 left-0 z-50 bg-slate-800 text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${!isMobileMenuOpen && !isHovered ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <div className="p-6 h-20 text-xl font-bold border-b border-slate-700 flex items-center justify-between whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-[32px] h-8 bg-emerald-500 rounded flex items-center justify-center text-white text-sm font-black">A</div>
            <span className={`transition-opacity duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              Gestión <span className="text-emerald-400">Aso</span>
            </span>
          </div>
          <button className="md:hidden" onClick={closeMobile}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 text-sm overflow-y-auto overflow-x-hidden scrollbar-hide">
          {/* Dashboard siempre visible para admin y cobrador */}
          <Link to="/dashboard" onClick={closeMobile} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700'}`}>
            <LayoutDashboard size={20} className="min-w-[20px]" />
            <span className={`transition-all duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
              Dashboard
            </span>
          </Link>
          
          {(normalizedRole === "admin" || normalizedRole === "cobrador") && (
            <>
              <Link to="/recaudacion" onClick={closeMobile} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${location.pathname === '/recaudacion' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700'}`}>
                <ReceiptText size={20} className="min-w-[20px]" />
                <span className={`transition-all duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
                  Recaudación
                </span>
              </Link>

              <Link to="/recaudacion/historial" onClick={closeMobile} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${location.pathname === '/recaudacion/historial' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700'}`}>
                <ReceiptText size={20} className="min-w-[20px]" />
                <span className={`transition-all duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
                  Historial
                </span>
              </Link>
            </>
          )}

          {normalizedRole === "admin" && (
            <>
              <div className={`pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${(isHovered || isMobileMenuOpen) ? 'block' : 'hidden'}`}>
                Administración
              </div>
              
              <Link to="/nomina" onClick={closeMobile} className="flex items-center gap-4 p-3 hover:bg-slate-700 rounded-lg transition-colors text-slate-300">
                <Users size={20} className="min-w-[20px]" />
                <span className={`transition-all duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
                  Nómina
                </span>
              </Link>

              <Link to="/admin/locatarios" onClick={closeMobile} className="flex items-center gap-4 p-3 hover:bg-slate-700 rounded-lg transition-colors text-slate-300">
                <Users size={20} className="min-w-[20px]" />
                <span className={`transition-all duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
                  B.D Locatarios
                </span>
              </Link>

              <Link to="/usuarios" onClick={closeMobile} className="flex items-center gap-4 p-3 hover:bg-slate-700 rounded-lg transition-colors text-emerald-400 font-medium">
                <UserCog size={20} className="min-w-[20px]" />
                <span className={`transition-all duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
                  Gestionar Usuarios
                </span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-bold"
          >
            <LogOut size={20} className="min-w-[20px]" />
            <span className={`transition-all duration-300 ${(isHovered || isMobileMenuOpen) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <div className="font-bold text-slate-800">Gestión <span className="text-emerald-500">Aso</span></div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}