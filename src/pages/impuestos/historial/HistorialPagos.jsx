import { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Search, FileDown, FileText, Calendar, User, DollarSign, Loader2, Filter } from 'lucide-react'; // Añadí Filter de lucide-react
import { generarComprobantePDF } from '../../../utils/generarReportes';
import { imprimirPlanillaRecaudacion } from '../../../services/recaudacionService';
import dayjs from 'dayjs'; // NUEVO: Asegúrate de tener instalado dayjs (npm install dayjs)

export default function HistorialPagos() {
  const [pagos, setPagos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  
  // NUEVO: Estado para el filtro de fechas
  const [filtroTiempo, setFiltroTiempo] = useState('todos');

  useEffect(() => {
    const q = query(collection(db, "pagos_impuestos"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => { docs.push({ id: doc.id, ...doc.data() }); });
      setPagos(docs);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // MODIFICADO: Ahora cruza tu búsqueda de texto con el rango de fechas seleccionado
  const pagosFiltrados = pagos.filter((pago) => {
    const coincideTexto = pago.contribuyente?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          pago.puesto?.toLowerCase().includes(busqueda.toLowerCase());

    let coincideTiempo = true;
    if (filtroTiempo !== 'todos' && pago.fecha) {
      const fechaPago = dayjs(pago.fecha.toDate());
      const hoy = dayjs();

      if (filtroTiempo === '15dias') {
        coincideTiempo = fechaPago.isAfter(hoy.subtract(15, 'day'));
      } else if (filtroTiempo === 'mes') {
        coincideTiempo = fechaPago.isAfter(hoy.subtract(1, 'month'));
      } else if (filtroTiempo === 'ano') {
        coincideTiempo = fechaPago.isAfter(hoy.subtract(1, 'year'));
      }
    }

    return coincideTexto && coincideTiempo;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historial de Recaudación</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Registros de Ingresos Diarios</p>
        </div>
        
        <button 
          onClick={() => imprimirPlanillaRecaudacion(pagosFiltrados, true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-100"
        >
          <FileText size={18} /> Exportar Reporte
        </button>
      </div>

      {/* --- BUSCADOR Y FILTRO DE FECHA (MODIFICADO) --- */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o puesto..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* NUEVO: Select para elegir el rango de tiempo */}
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all cursor-pointer appearance-none"
          >
            <option value="todos">Todos los tiempos</option>
            <option value="15dias">Últimos 15 días</option>
            <option value="mes">Último Mes</option>
            <option value="ano">Último Año</option>
          </select>
        </div>
      </div>
      
      {/* ... (EL RESTO DEL CÓDIGO QUEDA EXACTAMENTE IGUAL) ... */}
      {cargando ? (
        <div className="h-[40vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
          <p className="text-xs font-bold uppercase tracking-widest">Actualizando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <tr>
                  <th className="px-6 py-5">Contribuyente</th>
                  <th className="px-6 py-5 hidden sm:table-cell">Detalles</th>
                  <th className="px-6 py-5 text-right">Monto</th>
                  <th className="px-6 py-5 text-center">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {pagosFiltrados.length > 0 ? (
                  pagosFiltrados.map((pago) => (
                    <tr key={pago.id} className="hover:bg-slate-50/30 transition-colors group">
                      {/* Contribuyente y Fecha (Mobile Friendly) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700 uppercase">{pago.contribuyente}</span>
                          <div className="flex items-center gap-2 mt-1 text-slate-400">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold">
                              {pago.fecha?.toDate().toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-[10px] sm:hidden bg-slate-100 px-1.5 rounded text-slate-500 font-mono">
                              Puesto: {pago.puesto || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Detalles (Solo Desktop) */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Puesto: {pago.puesto || '---'}</span>
                          {pago.firmaBase64 && (
                            <div className="relative group/sign">
                              <img 
                                src={pago.firmaBase64} 
                                alt="Firma" 
                                className="h-6 border border-slate-100 rounded bg-white p-0.5 opacity-60 group-hover/sign:opacity-100 transition-opacity" 
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                          ${pago.monto?.toLocaleString()}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => generarComprobantePDF(pago)} 
                            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-90 shadow-lg shadow-slate-200"
                            title="Descargar Comprobante"
                          >
                            <FileDown size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Search size={48} />
                        <p className="text-sm font-bold mt-2 uppercase tracking-widest">Sin resultados</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}