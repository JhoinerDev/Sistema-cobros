import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
// Importamos los iconos de Wifi y Edit
import { Eye, EyeOff, TrendingUp, Users, Target, Calendar, Database, Wifi, WifiOff, Edit2 } from 'lucide-react'; 
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext'; // Necesitamos saber el rol del usuario

export default function Dashboard() {
  const { role } = useAuth(); // Obtenemos el rol para saber si puede editar la tasa
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Estado de conexión
  const [tasaDolar, setTasaDolar] = useState(0); // Estado para la tasa
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
    // 1. Escuchador de conexión a Internet
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Escuchador de la colección de pagos
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

        if (data.fecha) {
          fechaMasReciente = data.fecha.toDate();
        }
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

    // 3. Escuchador para la Tasa del Dólar
    const unsubscribeTasa = onSnapshot(doc(db, "configuracion", "tasa_dolar"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setTasaDolar(docSnapshot.data().valor);
      } else {
        console.warn("No existe el documento de la tasa del dólar en Firestore.");
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribePagos();
      unsubscribeTasa();
    };
  }, []);

  const porcentajeMeta = stats.total > 0 
    ? Math.min((stats.total / META_OBJETIVO) * 100, 100).toFixed(1) 
    : 0;

  // Función para que el Admin actualice la tasa
  const handleActualizarTasa = async () => {
    const nuevaTasaStr = prompt("Ingrese la nueva tasa del dólar (Bs.):", tasaDolar);
    if (nuevaTasaStr !== null) {
      const nuevaTasaNum = parseFloat(nuevaTasaStr.replace(',', '.'));
      if (!isNaN(nuevaTasaNum) && nuevaTasaNum > 0) {
        try {
          await updateDoc(doc(db, "configuracion", "tasa_dolar"), {
            valor: nuevaTasaNum
          });
        } catch (error) {
          console.error("Error al actualizar la tasa:", error);
          alert("Hubo un error al actualizar la tasa. Verifica los permisos.");
        }
      } else {
        alert("Por favor, ingrese un número válido.");
      }
    }
  };

  if (cargando) return (
    <div className="flex h-64 items-center justify-center text-gray-500 font-medium animate-pulse">
      Cargando datos en tiempo real...
    </div>
  );

  const cardOverlay = {
    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
    backgroundSize: '20px 20px'
  };

  const isAdmin = role?.toLowerCase() === 'admin';

  return (
    <div className="space-y-6">
      {/* Título e Indicador de Conexión */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Panel de Control</h2>
        
        {/* INDICADOR DE CONEXIÓN DINÁMICO */}
        <div className={`flex items-center gap-2 text-[10px] bg-white px-3 py-1.5 rounded-full border w-fit shadow-sm transition-colors duration-300 ${isOnline ? 'border-emerald-200' : 'border-rose-200'}`}>
          {isOnline ? (
            <>
              <Wifi size={14} className="text-emerald-500" />
              <span className="text-emerald-600 font-bold uppercase tracking-wider">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-rose-500" />
              <span className="text-rose-600 font-bold uppercase tracking-wider">Sin Conexión</span>
            </>
          )}
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        
        {/* 1. TOTAL RECAUDADO */}
        <div className="bg-cyan-500 rounded-3xl overflow-hidden shadow-lg relative h-32 md:h-36 transition-transform hover:scale-[1.02] group lg:col-span-1">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <div className="p-5 text-white relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-center opacity-80">
              <p className="text-cyan-500 bg-white/20 px-2 py-0.5 rounded-lg font-bold uppercase text-[9px] tracking-widest">Total Recaudado</p>
              <button onClick={() => setMostrarSaldo(!mostrarSaldo)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                {mostrarSaldo ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
              {mostrarSaldo ? `$${stats.total.toLocaleString('es-VE')}` : "••••••"}
            </h2>
            <div className="text-[9px] font-bold uppercase tracking-widest opacity-60">Sincronizado</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.historialGrafica}>
                <Area type="monotone" dataKey="monto" stroke="#fff" fill="#fff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. COBROS TOTALES */}
        <div className="bg-purple-600 rounded-3xl p-5 text-white shadow-lg h-32 md:h-36 flex flex-col justify-between transition-transform hover:scale-[1.02] relative overflow-hidden group lg:col-span-1">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <p className="bg-white/20 px-2 py-0.5 rounded-lg font-bold uppercase text-[9px] tracking-widest">Cobros Totales</p>
              <div className="bg-white/20 p-2 rounded-xl"><Users size={18} /></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{stats.cantidad}</h2>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Registros</p>
          </div>
        </div>

        {/* 3. META MENSUAL */}
        <div className="bg-emerald-500 rounded-3xl p-5 text-white shadow-lg h-32 md:h-36 flex flex-col justify-between transition-transform hover:scale-[1.02] relative overflow-hidden group lg:col-span-1">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <p className="bg-white/20 px-2 py-0.5 rounded-lg font-bold uppercase text-[9px] tracking-widest">Progreso Meta</p>
              <div className="bg-white/20 p-2 rounded-xl"><Target size={18} /></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{porcentajeMeta}%</h2>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000" style={{ width: `${porcentajeMeta}%` }}></div>
            </div>
          </div>
        </div>

        {/* 4. ULTIMA ACTIVIDAD */}
        <div className="bg-orange-500 rounded-3xl p-5 text-white shadow-lg h-32 md:h-36 flex flex-col justify-between transition-transform hover:scale-[1.02] relative overflow-hidden group lg:col-span-1">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <p className="bg-white/20 px-2 py-0.5 rounded-lg font-bold uppercase text-[9px] tracking-widest">Último Pago</p>
              <div className="bg-white/20 p-2 rounded-xl"><Calendar size={18} /></div>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-tight">
                {stats.ultimaFecha ? stats.ultimaFecha.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }) : "---"}
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Actualizado</p>
          </div>
        </div>

        {/* 5. TARJETA TASA BCV (Protegida) */}
        <div className="bg-slate-800 rounded-3xl p-5 text-white shadow-lg h-32 md:h-36 flex flex-col justify-between transition-transform hover:scale-[1.02] relative overflow-hidden group lg:col-span-1 border border-slate-700">
          <div className="absolute inset-0 opacity-20" style={cardOverlay}></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <p className="bg-white/10 px-2 py-0.5 rounded-lg font-bold uppercase text-[9px] tracking-widest text-emerald-400">Tasa Referencial</p>
              
              {isAdmin && (
                <button 
                  onClick={handleActualizarTasa}
                  className="bg-emerald-500 p-2 rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-emerald-400">Bs.</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                {/* Number() asegura que si es string no se rompa la app */}
                {Number(tasaDolar) > 0 ? Number(tasaDolar).toFixed(2) : "0.00"}
              </h2>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 text-emerald-400">
              Valor del Dólar
            </p>
          </div>
        </div>

      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Movimientos Recientes
          </h3>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-black tracking-[0.15em] border-b border-slate-50">
                <th className="px-6 py-4">Contribuyente</th>
                <th className="px-6 py-4 hidden sm:table-cell">Detalles Fecha</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.historialCompleto.slice(-8).reverse().map((pago, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {pago.contribuyente}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold sm:hidden flex items-center gap-1 mt-1">
                        {pago.fechaFormateada}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                      {pago.fechaOriginal?.toLocaleDateString('es-VE', { weekday: 'long' })}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">{pago.fechaFormateada}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="inline-block bg-slate-50 text-slate-900 px-4 py-2 rounded-2xl text-sm font-black group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-transparent group-hover:border-emerald-100">
                      <span className="text-emerald-500 mr-1">$</span>
                      {pago.monto?.toLocaleString('es-VE')}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.historialCompleto.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center text-slate-300 italic font-medium">
                    <Database size={40} className="mx-auto mb-3 opacity-20" />
                    Sin movimientos registrados
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