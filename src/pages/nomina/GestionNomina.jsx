import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, AlertCircle, Eye, Plus, 
  Search, X, CheckCircle2, Clock, CreditCard, 
  Calendar, FileText, Loader2 
} from 'lucide-react';
import { 
  suscribirAEmpleados, 
  agregarEmpleado, 
  actualizarEstadoEmpleado 
} from '../../services/nominaService';
import { imprimirPlanillaRecaudacion } from '../../services/recaudacionService';

export default function GestionNomina() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '',
    cedula: '',
    cargo: '',
    salario: '',
    fechaIngreso: '',
    estado: 'Pendiente'
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await agregarEmpleado(nuevoEmpleado);
      setIsModalOpen(false);
      setNuevoEmpleado({ 
        nombre: '', cedula: '', cargo: '', 
        salario: '', fechaIngreso: '', estado: 'Pendiente' 
      });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
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
      
      {/* --- ENCABEZADO ADAPTABLE --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Nómina</h1>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Control de Pagos y Personal</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => imprimirPlanillaRecaudacion(empleadosFiltrados)}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <FileText size={16} /> <span className="hidden sm:inline">PDF</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-[2] md:flex-none bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> Nuevo Empleado
          </button>
        </div>
      </div>

      {/* --- TARJETAS DE RESUMEN (Grid dinámico) --- */}
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

      {/* --- TABLA OPTIMIZADA --- */}
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
                <tr key={empleado.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{empleado.nombre}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                        {empleado.cargo} • <span className="font-mono">V-{empleado.cedula}</span>
                      </span>
                      {/* En móvil mostramos el salario aquí abajo */}
                      <span className="text-emerald-600 font-black text-xs md:hidden mt-1">
                        ${Number(empleado.salario).toLocaleString('es-VE')}
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
                    <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL RESPONSIVA (TIPO SHEET EN MÓVIL) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Nuevo Empleado</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm text-slate-400"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cédula</label>
                  <input 
                    required type="number"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={nuevoEmpleado.cedula}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, cedula: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre</label>
                  <input 
                    required 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={nuevoEmpleado.nombre}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cargo</label>
                  <input 
                    required 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={nuevoEmpleado.cargo}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, cargo: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Salario ($)</label>
                  <input 
                    required type="number"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-600"
                    value={nuevoEmpleado.salario}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, salario: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha Ingreso</label>
                <input 
                  required type="date"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={nuevoEmpleado.fechaIngreso}
                  onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, fechaIngreso: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 mt-4 uppercase text-xs tracking-widest">
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}