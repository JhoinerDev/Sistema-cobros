import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, AlertCircle, Eye, Plus, 
  Search, X, CheckCircle2, Clock, CreditCard, 
  Calendar, FileText, Loader2, Edit2, Trash2 
} from 'lucide-react';
import { 
  suscribirAEmpleados, 
  agregarEmpleado, 
  actualizarEstadoEmpleado 
} from '../../services/nominaService';
import { imprimirPlanillaNomina } from '../../services/reports/NominaReport';

// Importaciones directas de Firebase
import { db } from '../../services/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function GestionNomina() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para Modal de Formulario (Crear/Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    cedula: '',
    cargo: '',
    salario: '',
    fechaIngreso: '',
    estado: 'Pendiente'
  });

  // ESTADOS NUEVOS PARA LA MODAL DE ELIMINAR
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [eliminandoCargando, setEliminandoCargando] = useState(false);

  useEffect(() => {
    const unsubscribe = suscribirAEmpleados((datos) => {
      setEmpleados(datos);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Pagado' ? 'Pendiente' : 'Pagado';
    await actualizarEstadoEmpleado(id, nuevoEstado);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditandoId(null);
    setForm({ nombre: '', cedula: '', cargo: '', salario: '', fechaIngreso: '', estado: 'Pendiente' });
  };

  // --- LÓGICA: CREAR Y EDITAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await updateDoc(doc(db, "empleados", editandoId), form);
      } else {
        await agregarEmpleado(form);
      }
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar los datos del empleado.");
    }
  };

  // --- LÓGICA: ELIMINAR (MODAL) ---
  const abrirModalEliminar = (id) => {
    setIdAEliminar(id);
    setIsDeleteModalOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    setEliminandoCargando(true);
    try {
      await deleteDoc(doc(db, "empleados", idAEliminar));
      setIsDeleteModalOpen(false);
      setIdAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el registro.");
    } finally {
      setEliminandoCargando(false);
    }
  };

  // --- ABRIR MODAL PARA EDITAR ---
  const abrirModalEditar = (empleado) => {
    setForm({
      nombre: empleado.nombre,
      cedula: empleado.cedula,
      cargo: empleado.cargo,
      salario: empleado.salario || '',
      fechaIngreso: empleado.fechaIngreso || '',
      estado: empleado.estado || 'Pendiente'
    });
    setEditandoId(empleado.id);
    setIsModalOpen(true);
  };

  const empleadosFiltrados = empleados.filter((emp) => 
    emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cargo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cedula?.includes(busqueda)
  );

  const nominaTotal = empleados.reduce((acc, emp) => acc + (Number(emp.salario) || 0), 0);
  const pagosPendientes = empleados.filter(emp => emp.estado === 'Pendiente').length;

  if (cargando) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="font-medium animate-pulse">Cargando nómina...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Nómina</h1>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Control de Pagos y Personal</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => imprimirPlanillaNomina(empleadosFiltrados)}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <FileText size={16} /> <span className="hidden sm:inline">PDF</span>
          </button>

          <button 
            onClick={() => { cerrarModal(); setIsModalOpen(true); }}
            className="flex-[2] md:flex-none bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> Nuevo Empleado
          </button>
        </div>
      </div>

      {/* --- TARJETAS DE RESUMEN --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Users size={24} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Personal</p>
            <p className="text-xl font-black text-slate-800">{empleados.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><DollarSign size={24} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Nómina</p>
            <p className="text-xl font-black text-slate-800">${nominaTotal.toLocaleString('es-VE')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pendientes</p>
            <p className="text-xl font-black text-slate-800">{pagosPendientes}</p>
          </div>
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/30">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar empleado o cargo..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-5">Empleado / Cargo</th>
                <th className="px-6 py-5 hidden md:table-cell">Salario</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {empleadosFiltrados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{empleado.nombre}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                        {empleado.cargo} • <span className="font-mono">V-{empleado.cedula}</span>
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm font-black text-slate-700">${Number(empleado.salario).toLocaleString('es-VE')}</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEstado(empleado.id, empleado.estado)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 border ${
                        empleado.estado === 'Pagado' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}
                    >
                      {empleado.estado === 'Pagado' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      <span className="hidden xs:inline">{empleado.estado}</span>
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => abrirModalEditar(empleado)}
                        className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={() => abrirModalEliminar(empleado.id)}
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORMULARIO (NUEVO/EDITAR) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                {editandoId ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button onClick={cerrarModal} className="bg-white p-2 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                {/* ... (campos de entrada iguales al anterior) ... */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Cédula</label>
                        <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Nombre</label>
                        <input required className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Cargo</label>
                        <input required className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.cargo} onChange={(e) => setForm({...form, cargo: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Salario ($)</label>
                        <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.salario} onChange={(e) => setForm({...form, salario: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Fecha Ingreso</label>
                    <input required type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.fechaIngreso} onChange={(e) => setForm({...form, fechaIngreso: e.target.value})} />
                </div>
                <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl transition-all active:scale-95 mt-4 uppercase text-xs tracking-widest ${editandoId ? 'bg-amber-500' : 'bg-slate-900'}`}>
                    {editandoId ? 'Actualizar' : 'Confirmar'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE ELIMINACIÓN (ALERTA) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">¿Eliminar registro?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Esta acción es permanente y no podrás recuperar la información de este empleado.
              </p>
            </div>
            
            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-white text-slate-600 font-black py-4 rounded-2xl border border-slate-200 hover:bg-white active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarEliminacion}
                disabled={eliminandoCargando}
                className="flex-1 bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {eliminandoCargando ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}