import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, AlertCircle, Plus, Search, X, 
  CheckCircle2, Clock, CreditCard, Calendar, Download, FileText, Trash2, AlertTriangle 
} from 'lucide-react';
import { 
  suscribirAEmpleados, 
  agregarEmpleado, 
  actualizarEstadoEmpleado, 
  eliminarEmpleado 
} from '../../services/nominaService';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function GestionNomina() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- NUEVOS ESTADOS PARA EL BORRADO ESTILIZADO ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '',
    cedula: '',
    cargo: '',
    salario: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'Pendiente'
  });

  useEffect(() => {
    const unsubscribe = suscribirAEmpleados((datos) => {
      setEmpleados(datos || []);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FUNCIÓN PARA ABRIR EL MODAL DE BORRADO ---
  const prepararEliminacion = (empleado) => {
    setEmpleadoAEliminar(empleado);
    setIsDeleteModalOpen(true);
  };

  // --- FUNCIÓN QUE EJECUTA LA ELIMINACIÓN REAL ---
  const confirmarEliminacion = async () => {
    if (empleadoAEliminar) {
      try {
        await eliminarEmpleado(empleadoAEliminar.id);
        setIsDeleteModalOpen(false);
        setEmpleadoAEliminar(null);
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Pagado' ? 'Pendiente' : 'Pagado';
    await actualizarEstadoEmpleado(id, nuevoEstado);
  };

  // --- EXPORTACIONES ---
  const exportarExcel = () => {
    const datosExcel = empleadosFiltrados.map(emp => ({
      Cédula: `V-${emp.cedula}`,
      Empleado: emp.nombre,
      Cargo: emp.cargo,
      Salario: Number(emp.salario),
      Estado: emp.estado
    }));
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nomina");
    XLSX.writeFile(wb, `Nomina_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      startY: 20,
      head: [["CÉDULA", "EMPLEADO", "CARGO", "SALARIO", "ESTADO"]],
      body: empleadosFiltrados.map(emp => [
        `V-${emp.cedula}`, emp.nombre, emp.cargo, `$ ${Number(emp.salario).toLocaleString('es-VE')}`, emp.estado
      ]),
      headStyles: { fillColor: [15, 23, 42] }
    });
    doc.save("Reporte_Nomina.pdf");
  };

  const empleadosFiltrados = (empleados || []).filter((emp) => 
    emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cargo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cedula?.includes(busqueda)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await agregarEmpleado(nuevoEmpleado);
      setIsModalOpen(false);
      setNuevoEmpleado({ nombre: '', cedula: '', cargo: '', salario: '', fechaIngreso: new Date().toISOString().split('T')[0], estado: 'Pendiente' });
    } catch (error) { console.error("Error:", error); }
  };

  if (cargando) return <div className="p-10 text-center text-gray-500 font-medium">Cargando base de datos...</div>;

  return (
    <div className="p-6 space-y-6 relative bg-gray-50/30 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Nómina</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={exportarExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md">
            <Download size={16} /> Excel
          </button>
          <button onClick={exportarPDF} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md">
            <FileText size={16} /> PDF
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95">
            <Plus size={16} /> Nuevo Empleado
          </button>
        </div>
      </div>

      {/* Tarjetas Informativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600"><Users size={24} /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-nowrap">Personal Total</p>
            <p className="text-2xl font-black text-gray-900">{empleados.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600"><DollarSign size={24} /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-nowrap">Nómina Mensual</p>
            <p className="text-2xl font-black text-gray-900">${empleados.reduce((acc, emp) => acc + (Number(emp.salario) || 0), 0).toLocaleString('es-VE')}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-100 text-rose-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-nowrap">Por Pagar</p>
            <p className="text-2xl font-black text-gray-900">{empleados.filter(e => e.estado === 'Pendiente').length}</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-gray-700 italic">Lista de Empleados</h3>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Buscar..." 
              className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-gray-400 bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Cédula</th>
                <th className="px-6 py-4 font-semibold">Empleado</th>
                <th className="px-6 py-4 font-semibold">Cargo</th>
                <th className="px-6 py-4 font-semibold text-nowrap">Salario ($)</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-right italic">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {empleadosFiltrados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">V-{empleado.cedula}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 uppercase">{empleado.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{empleado.cargo}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">${Number(empleado.salario).toLocaleString('es-VE')}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEstado(empleado.id, empleado.estado)}
                      className={`mx-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                        empleado.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {empleado.estado === 'Pagado' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {empleado.estado}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => prepararEliminacion(empleado)}
                      className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE ELIMINACIÓN ESTILIZADO --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar empleado?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Eliminar a <span className="font-bold text-gray-800">{empleadoAEliminar?.nombre}</span> de la nómina. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarEliminacion}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro (Tu diseño original) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Nuevo Registro</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Cédula" type="number" className="p-2.5 bg-gray-50 border rounded-lg text-sm" value={nuevoEmpleado.cedula} onChange={e => setNuevoEmpleado({...nuevoEmpleado, cedula: e.target.value})} />
                <input required placeholder="Nombre Completo" className="p-2.5 bg-gray-50 border rounded-lg text-sm" value={nuevoEmpleado.nombre} onChange={e => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})} />
              </div>
              <input required placeholder="Cargo" className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" value={nuevoEmpleado.cargo} onChange={e => setNuevoEmpleado({...nuevoEmpleado, cargo: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Salario ($)" className="p-2.5 bg-gray-50 border rounded-lg text-sm font-bold" value={nuevoEmpleado.salario} onChange={e => setNuevoEmpleado({...nuevoEmpleado, salario: e.target.value})} />
                <input required type="date" className="p-2.5 bg-gray-50 border rounded-lg text-sm" value={nuevoEmpleado.fechaIngreso} onChange={e => setNuevoEmpleado({...nuevoEmpleado, fechaIngreso: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-lg transition-all">Guardar Empleado</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}