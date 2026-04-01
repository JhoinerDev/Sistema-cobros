import { useState, useEffect } from 'react';
import { UserPlus, X, UserCog, Trash2, CheckCircle2 } from 'lucide-react';
// --- IMPORTACIONES DE FIREBASE ---
import { db, auth } from '../../services/firebase'; 
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Cobrador' });
  const [users, setUsers] = useState([]); // Ahora empieza vacío
  const [cargando, setCargando] = useState(false);

  // --- LEER USUARIOS EN TIEMPO REAL DESDE FIREBASE ---
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaUsuarios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(listaUsuarios);
    });
    return () => unsubscribe();
  }, []);

  const confirmDelete = (id) => setDeleteModal({ show: true, userId: id });

  // --- ELIMINAR USUARIO DE FIRESTORE ---
  const executeDelete = async () => {
    try {
      await deleteDoc(doc(db, "users", deleteModal.userId));
      setDeleteModal({ show: false, userId: null });
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  // --- CREAR USUARIO EN AUTH Y FIRESTORE ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      // 1. Crear en Firebase Authentication (Acceso)
      // Nota: Esto deslogueará al admin actual a menos que uses una Cloud Function,
      // pero para la fase inicial de desarrollo lo haremos así o vía Firestore.
      // RECOMENDACIÓN: Por ahora lo guardaremos en Firestore y el Admin los invita.
      
      const userRef = await addDoc(collection(db, "users"), {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'Activo',
        createdAt: new Date()
      });

      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Cobrador' });
      alert("Usuario registrado en la base de datos");
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* --- ENCABEZADO (Igual) --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Usuarios</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Control de accesos y roles</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus size={18} /> Nuevo Usuario
        </button>
      </div>

      {/* --- TABLA (Conexión a Firebase) --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-5">Identidad</th>
                <th className="px-6 py-5 hidden md:table-cell">Estado</th>
                <th className="px-6 py-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ${
                        user.role === 'Admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[140px] sm:max-w-none mb-1">
                          {user.email}
                        </span>
                        <div className="flex items-center gap-2 md:hidden">
                           <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            user.role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase self-start px-2 py-1 rounded-lg border ${
                        user.role === 'Admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {user.role}
                      </span>
                      <div className="flex items-center gap-1.5 ml-1">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.status}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => confirmDelete(user.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              No hay usuarios registrados
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL REGISTRO (Actualizado) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><UserCog size={24} /></div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Nuevo Usuario</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateUser}>
                <input 
                  type="text" required placeholder="Nombre Completo"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold" 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  value={newUser.name}
                />
                <input 
                  type="email" required placeholder="Email de Acceso"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold" 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  value={newUser.email}
                />
                <input 
                  type="password" required placeholder="Contraseña Temporal"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold" 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  value={newUser.password}
                />
                <select 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-black text-slate-600"
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  value={newUser.role}
                >
                  <option value="Cobrador">Cobrador (Solo Recaudación)</option>
                  <option value="Admin">Admin (Control Total)</option>
                </select>

                <button 
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] mt-4 active:scale-95 transition-all disabled:opacity-50"
                >
                  {cargando ? "Registrando..." : "Confirmar Registro"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ELIMINAR (Igual) --- */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">¿Eliminar acceso?</h2>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteModal({ show: false, userId: null })} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}