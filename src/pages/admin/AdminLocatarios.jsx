import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { UserPlus, Search, Edit2, Trash2, Store, CreditCard } from 'lucide-react';

export default function AdminLocatarios() {
  const [locatarios, setLocatarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  
  // Estado para el formulario (Añadir/Editar)
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ nombre: '', cedula: '', puesto: '' });

  // 1. Cargar Locatarios
  const obtenerLocatarios = async () => {
    setCargando(true);
    const q = query(collection(db, "locatarios"), orderBy("puesto", "asc"));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLocatarios(docs);
    setCargando(false);
  };

  useEffect(() => { obtenerLocatarios(); }, []);

  // 2. Guardar o Actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await updateDoc(doc(db, "locatarios", editandoId), form);
        alert("Locatario actualizado");
      } else {
        await addDoc(collection(db, "locatarios"), form);
        alert("Locatario añadido");
      }
      setForm({ nombre: '', cedula: '', puesto: '' });
      setEditandoId(null);
      obtenerLocatarios();
    } catch (error) { console.error(error); }
  };

  // 3. Eliminar
  const eliminarLocatario = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
      await deleteDoc(doc(db, "locatarios", id));
      obtenerLocatarios();
    }
  };

  const locatariosFiltrados = locatarios.filter(l => 
    l.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    l.puesto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Censo de Locatarios</h2>

      {/* --- FORMULARIO --- */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre Completo</label>
          <input 
            type="text" 
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})}
            className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-slate-500"
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Cédula / RIF</label>
          <input 
            type="text" 
            value={form.cedula} 
            onChange={e => setForm({...form, cedula: e.target.value})}
            className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-slate-500"
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Número de Puesto</label>
          <input 
            type="text" 
            value={form.puesto} 
            onChange={e => setForm({...form, puesto: e.target.value})}
            className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-slate-500"
            required 
          />
        </div>
        <button type="submit" className="bg-slate-900 text-white p-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
          {editandoId ? <Edit2 size={16}/> : <UserPlus size={16}/>}
          {editandoId ? "Actualizar" : "Añadir Locatario"}
        </button>
      </form>

      {/* --- TABLA DE REGISTROS --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o puesto..." 
              className="w-full pl-10 p-2 bg-white border rounded-xl text-sm outline-none focus:ring-1 focus:ring-slate-500"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <span className="text-xs font-bold text-gray-500">{locatariosFiltrados.length} Registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">Puesto</th>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Cédula</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locatariosFiltrados.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{l.puesto}</td>
                  <td className="px-6 py-4">{l.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{l.cedula}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setForm(l); setEditandoId(l.id); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={14}/>
                    </button>
                    <button 
                      onClick={() => eliminarLocatario(l.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}