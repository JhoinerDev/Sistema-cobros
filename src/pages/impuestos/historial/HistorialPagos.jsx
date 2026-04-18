import { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Search, FileDown, FileText, Calendar, Loader2, Filter, Trash2, ShieldCheck, X, AlertCircle, CheckCircle2, UserCircle, History, Clock } from 'lucide-react'; 
import { generarComprobantePDF } from '../../../utils/generarReportes';
import { imprimirPlanillaRecaudacion } from '../../../services/recaudacionService';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/es';

dayjs.extend(isBetween);
dayjs.locale('es'); 

export default function HistorialPagos() {
  const [pagos, setPagos] = useState([]);
  const [locatarios, setLocatarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [filtroTiempo, setFiltroTiempo] = useState('todos');
  const [filtroMes, setFiltroMes] = useState(""); 

  const [fechaCobroOficial, setFechaCobroOficial] = useState("");
  const [pagoAEliminar, setPagoAEliminar] = useState(null);
  const [claveAdmin, setClaveAdmin] = useState("");
  const [errorClave, setErrorClave] = useState(false);

  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState(null);

  const CLAVE_MAESTRA = "1234admin"; 

  useEffect(() => {
    const unsubFecha = onSnapshot(doc(db, "configuracion", "fecha_cobro"), (snap) => {
      if (snap.exists()) setFechaCobroOficial(snap.data().valor || "");
    });

    const unsubLoc = onSnapshot(collection(db, "locatarios"), (snap) => {
      setLocatarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const q = query(collection(db, "pagos_impuestos"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => { 
        const data = doc.data();
        // LOGICA DE CONEXIÓN: Priorizamos el campo 'periodo' que viene de la recaudación
        const periodoReferencia = data.periodo || (data.fecha ? dayjs(data.fecha.toDate()).format('YYYY-MM') : null);
        
        docs.push({ 
          id: doc.id, 
          ...data,
          fechaMes: periodoReferencia 
        }); 
      });
      setPagos(docs);
      setCargando(false);
    });
    
    return () => {
      unsubLoc();
      unsubscribe();
      unsubFecha();
    };
  }, []);

  const obtenerEstadoDeuda = (cedula) => {
    const locatario = locatarios.find(l => l.cedula === cedula);
    if (!locatario) return "desconocido";
    if (!locatario.ultimoPago) return "deudor_total";
    
    const fechaReferencia = fechaCobroOficial ? dayjs(fechaCobroOficial) : dayjs();
    const mesesDiferencia = fechaReferencia.diff(dayjs(locatario.ultimoPago), 'month');
    
    return mesesDiferencia > 0 ? mesesDiferencia : "al_dia";
  };

  const obtenerMesesPendientes = (cedula) => {
    const locatario = locatarios.find(l => l.cedula === cedula);
    if (!locatario || !fechaCobroOficial) return [];
    
    const mesesPendientes = [];
    let fechaInicio = locatario.ultimoPago ? dayjs(locatario.ultimoPago).add(1, 'month') : dayjs(fechaCobroOficial).subtract(1, 'month'); 
    const fechaFin = dayjs(fechaCobroOficial);

    while (fechaInicio.isBefore(fechaFin) || fechaInicio.isSame(fechaFin, 'month')) {
      mesesPendientes.push(fechaInicio.format('YYYY-MM'));
      fechaInicio = fechaInicio.add(1, 'month');
    }
    return mesesPendientes;
  };

  const confirmarEliminacion = async () => {
    if (claveAdmin === CLAVE_MAESTRA) {
      try {
        await deleteDoc(doc(db, "pagos_impuestos", pagoAEliminar.id));
        setPagoAEliminar(null);
        setClaveAdmin("");
        setErrorClave(false);
        alert("Registro eliminado correctamente.");
      } catch (error) {
        alert("Error al intentar eliminar.");
      }
    } else {
      setErrorClave(true);
    }
  };

  const pagosFiltrados = pagos.filter((pago) => {
    const coincideTexto = pago.contribuyente?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          pago.puesto?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideMes = filtroMes === "" || pago.fechaMes === filtroMes;
    
    let coincideTiempo = true;
    if (filtroTiempo !== 'todos' && pago.fecha) {
      const fechaTransaccion = dayjs(pago.fecha.toDate());
      const ahora = dayjs();
      switch(filtroTiempo) {
        case 'hoy': coincideTiempo = fechaTransaccion.isSame(ahora, 'day'); break;
        case 'semana': coincideTiempo = fechaTransaccion.isAfter(ahora.startOf('week')); break;
        case 'mes': coincideTiempo = fechaTransaccion.isSame(ahora, 'month'); break;
        case 'ano': coincideTiempo = fechaTransaccion.isSame(ahora, 'year'); break;
        default: coincideTiempo = true;
      }
    }
    return coincideTexto && coincideTiempo && coincideMes;
  });

  const abrirExpediente = (cedula, nombre) => {
    const historialPersona = pagos.filter(p => p.cedula === cedula);
    const pendientes = obtenerMesesPendientes(cedula);
    setExpedienteSeleccionado({
      nombre,
      cedula,
      historial: historialPersona,
      pendientes: pendientes
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historial de Recaudación</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Panel de Auditoría y Control</p>
        </div>
        <button 
          onClick={() => imprimirPlanillaRecaudacion(pagosFiltrados, true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-100"
        >
          <FileText size={18} /> Exportar Reporte
        </button>
      </div>

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

        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border-2 border-transparent focus-within:border-emerald-500/10 transition-all">
          <span className="text-[9px] font-black text-slate-400 uppercase">Filtrar por Mes Pagado:</span>
          <input 
            type="month" 
            className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          />
          {filtroMes && (
            <button onClick={() => setFiltroMes("")} className="text-rose-500 hover:bg-rose-50 p-1 rounded-full">
              <X size={14}/>
            </button>
          )}
        </div>

        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all cursor-pointer appearance-none"
          >
            <option value="todos">Ver Todo (Fecha de Pago)</option>
            <option value="hoy">Pagados Hoy</option>
            <option value="semana">Pagados esta Semana</option>
            <option value="mes">Pagados este Mes</option>
          </select>
        </div>
      </div>
      
      {cargando ? (
        <div className="h-[40vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
          <p className="text-xs font-bold uppercase tracking-widest">Cargando historial...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <tr>
                  <th className="px-6 py-5">Contribuyente / Registro</th>
                  <th className="px-6 py-5">Mes Cancelado</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5 text-right">Monto</th>
                  <th className="px-6 py-5 text-center">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {pagosFiltrados.map((pago) => {
                  const estado = obtenerEstadoDeuda(pago.cedula);
                  return (
                    <tr 
                      key={pago.id} 
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => abrirExpediente(pago.cedula, pago.contribuyente)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700 uppercase group-hover:text-emerald-600 transition-colors">{pago.contribuyente}</span>
                          <div className="flex items-center gap-2 mt-1 text-slate-400">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold">
                              {dayjs(pago.fecha?.toDate()).format('DD/MM/YYYY')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg uppercase border border-emerald-100">
                          {dayjs(pago.fechaMes).format('MMMM YYYY')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {estado === "al_dia" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">
                            <CheckCircle2 size={10} /> Solvente
                          </span>
                        ) : estado === "desconocido" ? (
                          <span className="text-[9px] font-black uppercase text-slate-300 italic">No Censado</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100">
                            <AlertCircle size={10} /> Debe {estado === "deudor_total" ? "meses" : estado + (estado === 1 ? " mes" : " meses")}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                          $ {pago.monto?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center gap-2">
                          <button onClick={() => generarComprobantePDF(pago)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-90"><FileDown size={18} /></button>
                          <button onClick={() => setPagoAEliminar(pago)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all active:scale-90"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {expedienteSeleccionado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200"><UserCircle size={32} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{expedienteSeleccionado.nombre}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cédula: {expedienteSeleccionado.cedula}</p>
                </div>
              </div>
              <button onClick={() => setExpedienteSeleccionado(null)} className="p-2 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8">
              {expedienteSeleccionado.pendientes?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 text-rose-500">
                    <AlertCircle size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Meses Pendientes por Pagar</span>
                  </div>
                  <div className="grid gap-3">
                    {expedienteSeleccionado.pendientes.map((mes) => (
                      <div key={mes} className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-rose-700 uppercase">Mes Adeudado: {dayjs(mes).format('MMMM YYYY')}</span>
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Pendiente de cobro</span>
                        </div>
                        <Clock className="text-rose-300" size={20} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-6 text-emerald-600">
                  <History size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Meses Cancelados (Historial)</span>
                </div>
                
                <div className="grid gap-3">
                  {expedienteSeleccionado.historial.length > 0 ? (
                    expedienteSeleccionado.historial.map((p) => {
                      const periodoPagado = p.periodo || dayjs(p.fecha?.toDate()).format('YYYY-MM');
                      const mesNombre = dayjs(periodoPagado).format('MMMM YYYY');
                      const fechaTramite = dayjs(p.fecha?.toDate()).format('DD/MM/YYYY');

                      return (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Confirmación de Solvencia</span>
                            <span className="text-sm font-black text-slate-700 uppercase">
                              Pago del mes: <span className="text-emerald-700">{mesNombre}</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">
                              Transacción realizada el: {fechaTramite}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-slate-800">$ {p.monto?.toLocaleString('es-VE')}</span>
                            <button onClick={() => generarComprobantePDF({...p, periodo: periodoPagado})} className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm hover:bg-emerald-500 hover:text-white transition-all">
                              <FileDown size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-slate-400 italic">No hay registros previos.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pagoAEliminar && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-500"><ShieldCheck size={32} /></div>
              <button onClick={() => {setPagoAEliminar(null); setErrorClave(false); setClaveAdmin("");}} className="text-slate-300 hover:text-slate-500"><X size={24} /></button>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Autorización Requerida</h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">Clave de administrador para eliminar registro de <span className="text-rose-500 font-bold">{pagoAEliminar.contribuyente}</span>.</p>
            <div className="mt-6 space-y-4">
              <input type="password" placeholder="••••" value={claveAdmin} onChange={(e) => setClaveAdmin(e.target.value)} className={`w-full p-4 bg-slate-50 border-2 ${errorClave ? 'border-rose-500' : 'border-transparent'} rounded-2xl text-center text-lg font-black outline-none focus:bg-white transition-all`} autoFocus />
              <button onClick={confirmarEliminacion} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Confirmar Borrado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}