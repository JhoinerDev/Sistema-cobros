import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { UserPlus, Search, Edit2, Trash2, X, Loader2, Database } from 'lucide-react';

export default function AdminLocatarios() {
  const [locatarios, setLocatarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ nombre: '', cedula: '', puesto: '' });

  const obtenerLocatarios = async () => {
    setCargando(true);
    try {
      const q = query(collection(db, "locatarios"), orderBy("puesto", "asc"));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocatarios(docs);
    } catch (error) {
      console.error("Error al obtener locatarios:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { obtenerLocatarios(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    const datosLimpios = {
      nombre: form.nombre.trim(),
      cedula: form.cedula.trim(),
      puesto: form.puesto.trim().toUpperCase()
    };

    try {
      if (editandoId) {
        await updateDoc(doc(db, "locatarios", editandoId), datosLimpios);
      } else {
        await addDoc(collection(db, "locatarios"), datosLimpios);
      }
      cancelarEdicion();
      obtenerLocatarios();
    } catch (error) {
      alert("Hubo un error al guardar los datos");
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = () => {
    setForm({ nombre: '', cedula: '', puesto: '' });
    setEditandoId(null);
  };

  const eliminarLocatario = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este locatario?")) {
      await deleteDoc(doc(db, "locatarios", id));
      obtenerLocatarios();
    }
  };

  const locatariosFiltrados = locatarios.filter(l => 
    l.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    l.puesto.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.cedula.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      {/* Cabecera Adaptable */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Censo de Locatarios</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Base de Datos Maestra</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <Database size={16} className="text-emerald-500" />
          <span className="text-xs font-bold text-slate-600">{locatariosFiltrados.length} Registros</span>
          {cargando && <Loader2 className="animate-spin text-emerald-500 ml-2" size={16} />}
        </div>
      </div>

      {/* --- FORMULARIO DINÁMICO --- */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-5 md:p-7 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end transition-all"
      >
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cédula / RIF</label>
          <input 
            type="text" 
            value={form.cedula} 
            onChange={e => setForm({...form, cedula: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            placeholder="V-12345678"
            required 
          />
        </div>
        <div className="space-y-1 lg:col-span-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre / Razón Social</label>
          <input 
            type="text" 
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            placeholder="Nombre del locatario"
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nro. Puesto</label>
          <input 
            type="text" 
            value={form.puesto} 
            onChange={e => setForm({...form, puesto: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            placeholder="Ej: A-102"
            required 
          />
        </div>
        
        <div className="flex gap-2 h-[50px]">
          <button 
            type="submit" 
            disabled={cargando}
            className={`flex-1 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-white shadow-lg active:scale-95 ${
              editandoId ? 'bg-amber-500 shadow-amber-100' : 'bg-emerald-600 shadow-emerald-100'
            }`}
          >
            {editandoId ? <Edit2 size={16}/> : <UserPlus size={16}/>}
            {editandoId ? "Actualizar" : "Añadir"}
          </button>
          
          {editandoId && (
            <button 
              onClick={cancelarEdicion}
              className="px-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"
            >
              <X size={20}/>
            </button>
          )}
        </div>
      </form>

      {/* --- LISTADO DE REGISTROS --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/30">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, puesto o cédula..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-5">Puesto</th>
                <th className="px-6 py-5">Contribuyente</th>
                <th className="px-6 py-5 hidden md:table-cell">ID/Cédula</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {locatariosFiltrados.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-black text-emerald-600">
                    <span className="bg-emerald-50 px-2.5 py-1 rounded-lg">{l.puesto}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">{l.nombre}</p>
                    <p className="text-[10px] text-slate-400 md:hidden font-mono mt-0.5">{l.cedula}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono hidden md:table-cell">{l.cedula}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => { setForm(l); setEditandoId(l.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all active:scale-90"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={() => eliminarLocatario(l.id)}
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {locatariosFiltrados.length === 0 && !cargando && (
            <div className="text-center py-20 text-slate-300">
              <Search className="mx-auto mb-3 opacity-20" size={48} />
              <p className="text-sm italic">No se encontraron resultados para la búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}