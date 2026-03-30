import { useState } from 'react';

export default function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });
  
  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Cobrador' });

  // Datos de ejemplo (Luego vendrán de Postgres)
  const [users, setUsers] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@cobros.com', role: 'Cobrador', status: 'Activo' },
    { id: 2, name: 'Admin Principal', email: 'admin@sistema.com', role: 'Admin', status: 'Activo' },
  ]);

  // Función para manejar la eliminación
  const confirmDelete = (id) => {
    setDeleteModal({ show: true, userId: id });
  };

  const executeDelete = () => {
    setUsers(users.filter(user => user.id !== deleteModal.userId));
    setDeleteModal({ show: false, userId: null });
    // Aquí es donde luego llamaremos a tu API de Postgres/Firebase para borrar
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    // Aquí conectaremos la lógica de Firebase Auth próximamente
    const id = users.length + 1;
    setUsers([...users, { id, ...newUser, status: 'Activo' }]);
    setShowModal(false);
    setNewUser({ name: '', email: '', password: '', role: 'Cobrador' });
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500 font-medium">Administra los roles y accesos del sistema</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="text-xs font-semibold text-slate-600">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => confirmDelete(user.id)}
                      className="text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ELIMINAR (Confirmación Estilizada) */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">¿Eliminar usuario?</h2>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer. El usuario perderá acceso inmediato al sistema.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ show: false, userId: null })}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-600 active:scale-95 transition-all"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-6 text-center">Registrar Nuevo Usuario</h2>
            
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <input 
                type="text" 
                placeholder="Nombre completo" 
                required
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm" 
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                required
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm" 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Contraseña temporal" 
                required
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm" 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
              
              <select 
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-semibold text-slate-600"
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="Cobrador">Rol: Cobrador</option>
                <option value="Admin">Rol: Administrador</option>
              </select>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}