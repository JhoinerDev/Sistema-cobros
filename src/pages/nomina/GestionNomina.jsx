import { useState, useEffect } from 'react';
import { Users, DollarSign, AlertCircle, Eye, Plus, Search, X } from 'lucide-react';
import { suscribirAEmpleados, agregarEmpleado } from '../../services/nominaService';

export default function GestionNomina() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // 1. Estado para el texto del buscador
  const [busqueda, setBusqueda] = useState('');

  // --- ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '',
    cargo: '',
    salario: '',
    estado: 'Pendiente'
  });

  useEffect(() => {
    const unsubscribe = suscribirAEmpleados((datos) => {
      setEmpleados(datos);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // --- LÓGICA DE FILTRADO ---
  // Filtramos sobre el array original basándonos en el nombre o cargo
  const empleadosFiltrados = empleados.filter((emp) => 
    emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cargo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // --- FUNCIÓN PARA GUARDAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await agregarEmpleado(nuevoEmpleado);
      setIsModalOpen(false);
      setNuevoEmpleado({ nombre: '', cargo: '', salario: '', estado: 'Pendiente' });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Los cálculos se mantienen sobre el total de empleados reales
  const totalEmpleados = empleados.length;
  const nominaTotal = empleados.reduce((acc, emp) => acc + (Number(emp.salario) || 0), 0);
  const pagosPendientes = empleados.filter(emp => emp.estado === 'Pendiente').length;

  if (cargando) return <div className="p-10 text-center text-gray-500">Conectando con la base de datos...</div>;

  return (
    <div className="p-6 space-y-6 relative">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Nómina</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          <Plus size={16} /> Nuevo Empleado
        </button>
      </div>

      {/* Grid de Tarjetas */}
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

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-gray-700 text-nowrap">Listado de Empleados</h3>
          
          {/* 2. Input del buscador conectado al estado */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cargo..." 
              className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-gray-400 bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Empleado</th>
                <th className="px-6 py-4 font-semibold">Cargo</th>
                <th className="px-6 py-4 font-semibold text-nowrap">Salario Base</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* 3. Mapeamos los filtrados, no el total */}
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{empleado.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{empleado.cargo}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">${Number(empleado.salario).toLocaleString('es-VE')}</td>
                    <td className="px-6 py-4 text-xs font-bold uppercase">
                      <span className={`px-2 py-1 rounded-full ${empleado.estado === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {empleado.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><Eye size={18} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400 text-sm italic">
                    No se encontraron empleados con ese nombre o cargo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Nuevo Registro de Nómina</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre</label>
                <input 
                  required placeholder="Nombre del Empleado"
                  className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm mt-1 outline-none focus:border-blue-500"
                  onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Cargo</label>
                  <input 
                    required placeholder="Cargo"
                    className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm mt-1 outline-none focus:border-blue-500"
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, cargo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Salario ($)</label>
                  <input 
                    required type="number" placeholder="Salario ($)"
                    className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm mt-1 outline-none focus:border-blue-500"
                    onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, salario: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-colors mt-2">
                Guardar Empleado
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}