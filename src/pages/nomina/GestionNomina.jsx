import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, AlertCircle, Eye, Plus, 
  Search, X, CheckCircle2, Clock, CreditCard, 
  Calendar, FileText 
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

  // --- EFECTOS Y LÓGICA DE DATOS ---
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

  // --- FILTROS Y CÁLCULOS ---
  const empleadosFiltrados = empleados.filter((emp) => 
    emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cargo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cedula?.includes(busqueda)
  );

  const totalEmpleados = empleados.length;
  const nominaTotal = empleados.reduce((acc, emp) => acc + (Number(emp.salario) || 0), 0);
  const pagosPendientes = empleados.filter(emp => emp.estado === 'Pendiente').length;

  // --- RENDERIZADO CONDICIONAL ---
  if (cargando) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-gray-500 h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
        <p className="italic">Conectando con la base de datos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* --- ENCABEZADO Y BOTONES --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Nómina</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => imprimirPlanillaRecaudacion(empleadosFiltrados)}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100"
          >
            <FileText size={16} /> Generar PDF
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            <Plus size={16} /> Nuevo Empleado
          </button>
        </div>
      </div>

      {/* --- TARJETAS DE RESUMEN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600"><Users size={24} /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-nowrap">Total Empleados</p>
            <p className="text-2xl font-black text-gray-900">{totalEmpleados}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600"><DollarSign size={24} /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-nowrap">Nomina del Mes</p>
            <p className="text-2xl font-black text-gray-900">${nominaTotal.toLocaleString('es-VE')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-100 text-rose-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-nowrap">Pagos Pendientes</p>
            <p className="text-2xl font-black text-gray-900">{pagosPendientes}</p>
          </div>
        </div>
      </div>

      {/* --- TABLA DE EMPLEADOS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Barra superior de la tabla */}
        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-gray-700 text-nowrap">Listado de Empleados</h3>
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, cédula o cargo..." 
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Contenedor responsivo de la tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="text-[10px] uppercase text-gray-400 bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Cédula</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Empleado</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Cargo</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Salario Base</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Estado</th>
                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">V-{empleado.cedula || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{empleado.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{empleado.cargo}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">${Number(empleado.salario).toLocaleString('es-VE')}</td>
                    
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleEstado(empleado.id, empleado.estado)}
                        className={`group flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all active:scale-95 border ${
                          empleado.estado === 'Pagado' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {empleado.estado === 'Pagado' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {empleado.estado}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-400 text-sm italic">
                    No se encontraron empleados que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE NUEVO EMPLEADO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="font-bold text-gray-800">Nuevo Registro de Nómina</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Cédula</label>
                  <div className="relative mt-1">
                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required placeholder="Ej. 29123456"
                      type="number"
                      className="w-full pl-9 p-2.5 bg-gray-50 border rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                      value={nuevoEmpleado.cedula}
                      onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, cedula: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                  <input 
                    required placeholder="Nombre del Empleado"
                    className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm mt-1 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                    value={nuevoEmpleado.nombre}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Cargo</label>
                  <input 
                    required placeholder="Cargo"
                    className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm mt-1 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                    value={nuevoEmpleado.cargo}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, cargo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Salario ($)</label>
                  <input 
                    required type="number" placeholder="Ej. 150"
                    className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm mt-1 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                    value={nuevoEmpleado.salario}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, salario: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Fecha de Ingreso</label>
                <div className="relative mt-1">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required type="date"
                    className="w-full pl-9 p-2.5 bg-gray-50 border rounded-lg text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                    value={nuevoEmpleado.fechaIngreso}
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, fechaIngreso: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95 mt-4">
                Guardar Empleado
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}