import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Eye, EyeOff, TrendingUp, Users, Target, Calendar } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, 
    cantidad: 0, 
    historialGrafica: [],
    historialCompleto: [], // Estado para la tabla
    ultimaFecha: null 
  });
  const [cargando, setCargando] = useState(true);

  const META_OBJETIVO = 5000000; 

  useEffect(() => {
    const q = query(collection(db, "pagos_impuestos"), orderBy("fecha", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let acumulado = 0;
      const datosGrafica = [];
      const datosCompletos = [];
      let fechaMasReciente = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const monto = Number(data.monto) || 0;
        
        acumulado += monto;
        datosGrafica.push({ monto: monto });
        
        // Formateamos los datos para la tabla
        datosCompletos.push({
          contribuyente: data.contribuyente,
          monto: monto,
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
    });

    return () => unsubscribe();
  }, []);

  const porcentajeMeta = stats.total > 0 
    ? Math.min((stats.total / META_OBJETIVO) * 100, 100).toFixed(1) 
    : 0;

  if (cargando) return <div className="p-8 text-gray-500 text-center">Cargando datos en tiempo real...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. TOTAL RECAUDADO */}
        <div className="bg-cyan-500 rounded-xl overflow-hidden shadow-lg relative h-36">
          <div className="p-4 text-white relative z-10">
            <div className="flex justify-between items-center">
              <p className="text-cyan-100 font-medium uppercase text-[10px] tracking-widest">Total Recaudado</p>
              <button onClick={() => setMostrarSaldo(!mostrarSaldo)} className="p-1 hover:bg-white/20 rounded-full">
                {mostrarSaldo ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <h2 className="text-2xl font-black mt-1">
              {mostrarSaldo ? `$${stats.total.toLocaleString('es-VE')}` : "••••••"}
            </h2>
            <div className="flex items-center gap-1 text-cyan-100 text-[10px] mt-1">
              <TrendingUp size={12} /> <span>En vivo</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-12 opacity-30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.historialGrafica}>
                <Area type="monotone" dataKey="monto" stroke="#fff" fill="#fff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. COBROS TOTALES */}
        <div className="bg-purple-600 rounded-xl p-4 text-white shadow-lg h-36 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 font-medium uppercase text-[10px] tracking-widest">Cobros Totales</p>
              <h2 className="text-3xl font-black mt-1">{stats.cantidad}</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg"><Users size={20} /></div>
          </div>
          <p className="text-purple-200 text-[10px]">Registros en Firebase</p>
        </div>

        {/* 3. META MENSUAL */}
        <div className="bg-emerald-500 rounded-xl p-4 text-white shadow-lg h-36 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-medium uppercase text-[10px] tracking-widest">Meta de Recaudación</p>
              <h2 className="text-3xl font-black mt-1">{porcentajeMeta}%</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg"><Target size={20} /></div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2">
            <div className="bg-white h-1.5 rounded-full transition-all duration-1000" style={{ width: `${porcentajeMeta}%` }}></div>
          </div>
        </div>

        {/* 4. ÚLTIMA ACTIVIDAD */}
        <div className="bg-orange-500 rounded-xl p-4 text-white shadow-lg h-36 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 font-medium uppercase text-[10px] tracking-widest">Último Ingreso</p>
              <h2 className="text-xl font-black mt-2">
                {stats.ultimaFecha 
                  ? stats.ultimaFecha.toLocaleDateString('es-VE', { day: 'numeric', month: 'long' }) 
                  : "Sin registros"}
              </h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg"><Calendar size={20} /></div>
          </div>
          <p className="text-orange-100 text-[10px]">Actualizado recientemente</p>
        </div>
      </div>

      {/* Tabla de Actividad Reciente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Facturas Recientes</h3>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-1 rounded-full font-bold uppercase">En vivo</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase text-gray-400 bg-gray-50">
              <tr>
                <th className="px-6 py-3">Contribuyente</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.historialCompleto.slice(-5).reverse().map((pago, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{pago.contribuyente}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{pago.fechaFormateada}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                    ${pago.monto?.toLocaleString('es-VE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}