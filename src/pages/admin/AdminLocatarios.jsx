import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { UserPlus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';

export default function AdminLocatarios() {
  const [locatarios, setLocatarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ nombre: '', cedula: '', puesto: '' });

  // 1. Cargar Locatarios desde Firebase
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

  // 2. Guardar o Actualizar con limpieza de datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    // Limpiamos los datos para evitar errores de búsqueda luego
    const datosLimpios = {
      nombre: form.nombre.trim(),
      cedula: form.cedula.trim(), // Siempre como texto para evitar líos de números
      puesto: form.puesto.trim().toUpperCase() // Puestos siempre en mayúsculas
    };

    try {
      if (editandoId) {
        await updateDoc(doc(db, "locatarios", editandoId), datosLimpios);
        alert("Locatario actualizado correctamente");
      } else {
        await addDoc(collection(db, "locatarios"), datosLimpios);
        alert("Locatario añadido al censo");
      }
      cancelarEdicion();
      obtenerLocatarios();
    } catch (error) {
      console.error(error);
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Censo de Locatarios</h2>
        {cargando && <Loader2 className="animate-spin text-emerald-500" size={24} />}
      </div>

      {/* --- FORMULARIO CON ESTILO AQUAMARINA --- */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Cédula / RIF</label>
          <input 
            type="text" 
            value={form.cedula} 
            onChange={e => setForm({...form, cedula: e.target.value})}
            className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-emerald-400 transition-all"
            placeholder="V-12345678"
            required 
          />
        </div>
        <div className="md:col-span-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
          <input 
            type="text" 
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})}
            className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-emerald-400 transition-all"
            placeholder="Nombre del contribuyente"
            required 
          />
        </div>
        <div className="md:col-span-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nro. Puesto</label>
          <input 
            type="text" 
            value={form.puesto} 
            onChange={e => setForm({...form, puesto: e.target.value})}
            className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-emerald-400 transition-all"
            placeholder="Ej: A-12"
            required 
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={cargando}
            className={`flex-1 p-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 text-white shadow-lg ${
              editandoId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
            }`}
          >
            {editandoId ? <Edit2 size={16}/> : <UserPlus size={16}/>}
            {editandoId ? "Actualizar" : "Registrar"}
          </button>
          
          {editandoId && (
            <button 
              onClick={cancelarEdicion}
              className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200"
            >
              <X size={20}/>
            </button>
          )}
        </div>
      </form>

      {/* --- TABLA --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50/30 gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, puesto o cédula..." 
              className="w-full pl-10 p-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-50"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
            {locatariosFiltrados.length} Locatarios en Sistema
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Puesto</th>
                <th className="px-6 py-4">Nombre / Razón Social</th>
                <th className="px-6 py-4">Cédula / RIF</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {locatariosFiltrados.map((l) => (
                <tr key={l.id} className="hover:bg-emerald-50/20 transition-colors group">
                  <td className="px-6 py-4 font-black text-emerald-600">{l.puesto}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{l.nombre}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono">{l.cedula}</td>
                  <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setForm(l); setEditandoId(l.id); }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={14}/>
                    </button>
                    <button 
                      onClick={() => eliminarLocatario(l.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
              {locatariosFiltrados.length === 0 && !cargando && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-400 italic">
                    No se encontraron locatarios que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}