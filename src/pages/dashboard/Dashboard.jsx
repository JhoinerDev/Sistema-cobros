import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
// Importamos iconos adicionales para el modal y UI
import { Eye, EyeOff, TrendingUp, Users, Target, Calendar, Database, Wifi, WifiOff, Edit2, X, Check } from 'lucide-react'; 
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext'; 

export default function Dashboard() {
  const { role } = useAuth(); 
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine); 
  const [tasaDolar, setTasaDolar] = useState(0); 
  
  // NUEVOS ESTADOS PARA EL MODAL ESTILIZADO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevaTasaInput, setNuevaTasaInput] = useState("");

  const [stats, setStats] = useState({ 
    total: 0, 
    cantidad: 0, 
    historialGrafica: [],
    historialCompleto: [], 
    ultimaFecha: null 
  });
  const [cargando, setCargando] = useState(true);

  const META_OBJETIVO = 5000000; 

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const qPagos = query(collection(db, "pagos_impuestos"), orderBy("fecha", "asc"));
    const unsubscribePagos = onSnapshot(qPagos, (snapshot) => {
      let acumulado = 0;
      const datosGrafica = [];
      const datosCompletos = [];
      let fechaMasReciente = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const monto = Number(data.monto) || 0;
        acumulado += monto;
        datosGrafica.push({ monto: monto });
        datosCompletos.push({
          contribuyente: data.contribuyente,
          monto: monto,
          fechaOriginal: data.fecha?.toDate() || null,
          fechaFormateada: data.fecha?.toDate().toLocaleDateString('es-VE') || 'S/F'
        });
        if (data.fecha) fechaMasReciente = data.fecha.toDate();
      });

      setStats({
        total: acumulado,
        cantidad: snapshot.size,
        historialGrafica: datosGrafica,
        historialCompleto: datosCompletos,
        ultimaFecha: fechaMasReciente
      });
      setCargando(false);
    }, (error) => {
      console.error("Error en Snapshot de Pagos:", error);
      setCargando(false);
    });

    const unsubscribeTasa = onSnapshot(doc(db, "configuracion", "tasa_dolar"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const val = docSnapshot.data().valor;
        setTasaDolar(val);
        setNuevaTasaInput(val); // Inicializamos el input con el valor actual
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribePagos();
      unsubscribeTasa();
    };
  }, []);

  // Función mejorada para actualizar la tasa desde el modal
  const handleGuardarTasa = async () => {
    const nuevaTasaNum = parseFloat(nuevaTasaInput.toString().replace(',', '.'));
    if (!isNaN(nuevaTasaNum) && nuevaTasaNum > 0) {
      try {
        await updateDoc(doc(db, "configuracion", "tasa_dolar"), {
          valor: nuevaTasaNum
        });
        setIsModalOpen(false);
      } catch (error) {
        alert("Error al actualizar la tasa.");
      }
    } else {
      alert("Ingrese un número válido.");
    }
  };

  const porcentajeMeta = stats.total > 0 
    ? Math.min((stats.total / META_OBJETIVO) * 100, 100).toFixed(1) 
    : 0;

  if (cargando) return (
    <div className="flex h-64 items-center justify-center text-gray-500 font-medium animate-pulse">
      Cargando datos...
    </div>
  );

  const cardOverlay = {
    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
    backgroundSize: '20px 20px'
  };

  const isAdmin = role?.toLowerCase() === 'admin';

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      {/* Título e Indicador */}
      <div className="flex flex-row items-center justify-between gap-2 px-1">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Panel</h2>
        
        <div className={`flex items-center gap-2 text-[9px] bg-white px-3 py-1.5 rounded-full border shadow-sm transition-colors duration-300 ${isOnline ? 'border-emerald-100 text-emerald-600' : 'border-rose-100 text-rose-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          <span className="font-black uppercase tracking-widest">{isOnline ? 'En Vivo' : 'Offline'}</span>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
        </div>
      </div>

      {/* Grid Optimizado: 2 columnas en móvil, 5 en escritorio */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
        
        {/* RECAUDADO (Ocupa 2 columnas en móvil para destacar) */}
        <div className="col-span-2 lg:col-span-1 bg-cyan-500 rounded-[2rem] overflow-hidden shadow-lg relative h-28 md:h-36 transition-transform active:scale-95 group">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <div className="p-4 md:p-5 text-white relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-center opacity-80">
              <p className="bg-white/20 px-2 py-0.5 rounded-lg font-bold uppercase text-[8px] tracking-widest">Recaudado</p>
              <button onClick={() => setMostrarSaldo(!mostrarSaldo)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                {mostrarSaldo ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <h2 className="text-xl md:text-3xl font-black tracking-tighter leading-none">
              {mostrarSaldo ? `$${stats.total.toLocaleString('es-VE')}` : "••••••"}
            </h2>
            <div className="text-[8px] font-bold uppercase tracking-widest opacity-60">Sincronizado</div>
          </div>
        </div>

        {/* COBROS */}
        <div className="bg-purple-600 rounded-[2rem] p-4 md:p-5 text-white shadow-lg h-28 md:h-36 flex flex-col justify-between relative overflow-hidden active:scale-95">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <p className="bg-white/20 w-fit px-2 py-0.5 rounded-lg font-bold uppercase text-[8px] tracking-widest">Cobros</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">{stats.cantidad}</h2>
            <Users size={18} className="opacity-30" />
          </div>
        </div>

        {/* TASA BCV */}
        <div className="bg-slate-800 rounded-[2rem] p-4 md:p-5 text-white shadow-lg h-28 md:h-36 flex flex-col justify-between relative overflow-hidden border border-slate-700 active:scale-95">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <div className="flex justify-between items-start z-10">
            <p className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg font-bold uppercase text-[8px] tracking-widest">Tasa BCV</p>
            {isAdmin && (
              <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 p-1.5 rounded-xl hover:bg-emerald-400 transition-colors">
                <Edit2 size={14} />
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-0.5 z-10">
            <span className="text-xs font-bold text-emerald-500">Bs.</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
              {Number(tasaDolar) > 0 ? Number(tasaDolar).toFixed(2) : "0.00"}
            </h2>
          </div>
        </div>

        {/* META */}
        <div className="bg-emerald-500 rounded-[2rem] p-4 md:p-5 text-white shadow-lg h-28 md:h-36 flex flex-col justify-between relative overflow-hidden active:scale-95">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <p className="bg-white/20 w-fit px-2 py-0.5 rounded-lg font-bold uppercase text-[8px] tracking-widest">Meta</p>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">{porcentajeMeta}%</h2>
          <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-1000" style={{ width: `${porcentajeMeta}%` }}></div>
          </div>
        </div>

        {/* ULTIMO PAGO */}
        <div className="bg-orange-500 rounded-[2rem] p-4 md:p-5 text-white shadow-lg h-28 md:h-36 flex flex-col justify-between relative overflow-hidden active:scale-95">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <p className="bg-white/20 w-fit px-2 py-0.5 rounded-lg font-bold uppercase text-[8px] tracking-widest">Último</p>
          <div className="flex items-end justify-between">
            <h2 className="text-base md:text-2xl font-black uppercase tracking-tighter leading-none">
              {stats.ultimaFecha ? stats.ultimaFecha.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }) : "---"}
            </h2>
            <Calendar size={18} className="opacity-30" />
          </div>
        </div>

      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/50">
          <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-500" />
            Movimientos Recientes
          </h3>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
              {stats.historialCompleto.slice(-10).reverse().map((pago, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight leading-none mb-1">{pago.contribuyente}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{pago.fechaFormateada}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="bg-slate-50 text-slate-900 px-3 py-1.5 rounded-2xl text-xs font-black border border-slate-100">
                      <span className="text-emerald-500 mr-0.5">$</span>
                      {pago.monto?.toLocaleString('es-VE')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ESTILIZADO PARA LA TASA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop con desenfoque */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Contenido del Modal */}
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 relative z-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Ajustar Tasa</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1.5 block tracking-widest">Monto en Bolívares (Bs.)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    value={nuevaTasaInput}
                    onChange={(e) => setNuevaTasaInput(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-2xl font-black text-slate-800 focus:border-emerald-500 focus:ring-0 focus:outline-none transition-all"
                    placeholder="0.00"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">BCV</div>
                </div>
              </div>
              
              <button 
                onClick={handleGuardarTasa}
                className="w-full bg-slate-800 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-700 transition-all shadow-lg active:scale-95"
              >
                <Check size={20} />
                Confirmar Tasa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}