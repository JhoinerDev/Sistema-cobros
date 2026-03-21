import { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Search, FileDown } from 'lucide-react'; // Iconos para el buscador y PDF
import { generarComprobantePDF } from '../../../utils/generarReportes';

export default function HistorialPagos() {
  const [pagos, setPagos] = useState([]);
  const [busqueda, setBusqueda] = useState(""); // Estado para el buscador
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pagos_impuestos"), orderBy("fecha", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setPagos(docs);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Lógica de filtrado: busca por nombre de contribuyente
  const pagosFiltrados = pagos.filter((pago) =>
    pago.contribuyente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Recaudación</h2>
        
        {/* Buscador Profesional */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar contribuyente..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>
      
      {cargando ? (
        <p className="text-gray-500">Cargando registros...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contribuyente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Firma</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((pago) => (
                  <tr key={pago.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pago.contribuyente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                      ${pago.monto?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.fecha?.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {pago.firmaBase64 && (
                        <img src={pago.firmaBase64} alt="Firma" className="h-8 border border-gray-200 rounded bg-white shadow-sm" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button 
                        onClick={() => generarComprobantePDF(pago)} 
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors text-xs font-medium"
                        >
                        <FileDown size={14} /> Comprobante
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400 text-sm">
                    No se encontraron registros que coincidan con "{busqueda}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}