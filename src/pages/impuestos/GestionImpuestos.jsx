import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
// AÑADIDO: Se importaron doc y onSnapshot para leer la tasa
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import SignaturePad from '../../components/ui/SignaturePad';
import { User, CreditCard, Store, DollarSign, Wallet, FileSignature, FileText, CheckCircle, UserPlus, X } from 'lucide-react';
import { generarComprobantePDF } from '../../utils/generarReportes';

export default function GestionImpuestos() {
  const [formulario, setFormulario] = useState({
    contribuyente: '',
    cedula: '',
    puesto: '',
    monto: '',
    metodo: 'Efectivo'
  });
  const [firma, setFirma] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [buscandoLocatario, setBuscandoLocatario] = useState(false);
  
  const [generarPDF, setGenerarPDF] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [existeLocatario, setExisteLocatario] = useState(true);
  const [nuevoLocatario, setNuevoLocatario] = useState({ nombre: '', cedula: '', puesto: '' });

  // AÑADIDO: Estado para guardar la tasa del dólar
  const [tasaDolar, setTasaDolar] = useState(0);

  // AÑADIDO: useEffect para escuchar la tasa del dólar en tiempo real
  useEffect(() => {
    const unsubscribeTasa = onSnapshot(doc(db, "configuracion", "tasa_dolar"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setTasaDolar(docSnapshot.data().valor || 0);
      }
    });
    return () => unsubscribeTasa();
  }, []);

  // --- LÓGICA DE AUTOCOMPLETADO ---
  useEffect(() => {
    const buscarLocatario = async () => {
      if (formulario.cedula.length >= 5) {
        setBuscandoLocatario(true);
        try {
          const q = query(
            collection(db, "locatarios"), 
            where("cedula", "==", formulario.cedula.trim())
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const datos = querySnapshot.docs[0].data();
            setFormulario(prev => ({
              ...prev,
              contribuyente: datos.nombre,
              puesto: datos.puesto
            }));
            setExisteLocatario(true);
          } else {
            setExisteLocatario(false);
          }
        } catch (error) {
          console.error("Error buscando locatario:", error);
        } finally {
          setBuscandoLocatario(false);
        }
      }
    };
    const timeoutId = setTimeout(() => buscarLocatario(), 500); 
    return () => clearTimeout(timeoutId);
  }, [formulario.cedula]);

  const handleRegistrarNuevo = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "locatarios"), nuevoLocatario);
      setFormulario(prev => ({ 
        ...prev, 
        cedula: nuevoLocatario.cedula, 
        contribuyente: nuevoLocatario.nombre, 
        puesto: nuevoLocatario.puesto 
      }));
      setExisteLocatario(true);
      setShowModal(false);
      setNuevoLocatario({ nombre: '', cedula: '', puesto: '' });
      alert("Locatario registrado en el censo");
    } catch (error) {
      alert("Error al registrar");
    }
  };

  const handleInputChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSaveFirma = (url) => {
    setFirma(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!firma) {
      alert("La firma del contribuyente es obligatoria.");
      return;
    }
    setCargando(true);
    try {
      const nuevoPago = {
        contribuyente: formulario.contribuyente,
        cedula: formulario.cedula,
        puesto: formulario.puesto,
        monto: parseFloat(formulario.monto),
        metodo: formulario.metodo,
        firmaBase64: firma,
        fecha: serverTimestamp(),
        tipo: "Impuesto Municipal"
      };

      const docRef = await addDoc(collection(db, "pagos_impuestos"), nuevoPago);

      if (generarPDF) {
        const pagoParaPDF = { 
          ...nuevoPago, 
          id: docRef.id, 
          fecha: { toDate: () => new Date() } 
        };
        generarComprobantePDF(pagoParaPDF);
        alert("¡Cobro registrado y PDF generado!");
      } else {
        alert("¡Cobro registrado exitosamente!");
      }

      setFormulario({ contribuyente: '', cedula: '', puesto: '', monto: '', metodo: 'Efectivo' });
      setFirma(null);
      setGenerarPDF(false); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al registrar el cobro");
    } finally {
      setCargando(false);
    }
  };

  // AÑADIDO: Cálculo del monto en Bs en tiempo real
  const montoEnBs = formulario.monto && tasaDolar ? (parseFloat(formulario.monto) * tasaDolar).toFixed(2) : "0.00";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="px-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Recaudación de Impuestos</h2>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1 italic">Gestión de Cobros Municipales</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 space-y-6">
        
        {/* --- PASO 1: CÉDULA --- */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 italic block mb-1">
              1. Ingrese Cédula / RIF
            </label>
            <div className="relative">
              <CreditCard size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${buscandoLocatario ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} />
              <input
                type="text"
                name="cedula"
                value={formulario.cedula}
                onChange={handleInputChange}
                className="w-full pl-10 pr-20 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                placeholder="Ej. 12345678"
                required
              />
              {buscandoLocatario && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold animate-pulse">
                  ...
                </span>
              )}
            </div>
          </div>

          {!existeLocatario && formulario.cedula.length >= 5 && (
            <button
              type="button"
              onClick={() => {
                setNuevoLocatario({...nuevoLocatario, cedula: formulario.cedula});
                setShowModal(true);
              }}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              <UserPlus size={16} /> ¿Registrar?
            </button>
          )}
        </div>

        {/* --- DATOS AUTOCOMPLETADOS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Contribuyente</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="contribuyente"
                value={formulario.contribuyente}
                onChange={handleInputChange}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                placeholder="Nombre completo"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Puesto / Local</label>
            <div className="relative">
              <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="puesto"
                value={formulario.puesto}
                onChange={handleInputChange}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                placeholder="Ej. A-12"
                required
              />
            </div>
          </div>
        </div>

        {/* --- DATOS DE PAGO --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          
          {/* AÑADIDO: Interfaz actualizada para el cálculo de Bs */}
          <div className="space-y-1">
            <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Monto ($)</label>
              {tasaDolar > 0 && (
                <span className="text-[9px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Tasa: {tasaDolar} Bs
                </span>
              )}
            </div>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                name="monto"
                value={formulario.monto}
                onChange={handleInputChange}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                placeholder="0.00"
                required
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-xs font-bold text-slate-500">
                Equivalente: <span className="text-slate-800">Bs. {montoEnBs}</span>
              </span>
            </div>
          </div>

          <div className="space-y-1 mt-1 sm:mt-0">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Método</label>
            <div className="relative">
              <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="metodo"
                value={formulario.metodo}
                onChange={handleInputChange}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all appearance-none"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Punto">Punto de Venta</option>
                <option value="Divisa">Divisa</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- FIRMA DIGITAL (Ajustada para táctil) --- */}
        <div className="pt-4 border-t border-gray-50">
          <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-3">
            <FileSignature size={14} className="text-emerald-500" /> Validación de Firma Digital
          </label>
          
          {!firma ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50 touch-none">
              <SignaturePad onSave={handleSaveFirma} />
            </div>
          ) : (
            <div className="border-2 border-emerald-500 rounded-2xl p-6 bg-emerald-50/30 flex flex-col items-center justify-center gap-3 transition-all animate-in zoom-in duration-300">
              <div className="bg-emerald-500 text-white p-1 rounded-full"><CheckCircle size={20}/></div>
              <p className="text-emerald-700 font-bold text-sm tracking-tight">Firma capturada correctamente</p>
              <img src={firma} alt="Firma" className="h-20 object-contain mix-blend-multiply bg-white/50 rounded-lg p-2" />
              <button 
                type="button" 
                onClick={() => setFirma(null)}
                className="text-[10px] uppercase font-bold text-rose-500 bg-white px-4 py-2 rounded-full border border-rose-100 shadow-sm hover:bg-rose-50 transition-all"
              >
                Borrar y volver a firmar
              </button>
            </div>
          )}
        </div>

        {/* --- BOTONES DE ACCIÓN (Stack vertical en móvil) --- */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            onClick={() => setGenerarPDF(false)}
            disabled={cargando}
            className="order-2 sm:order-1 flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <CheckCircle size={18} />
            {cargando && !generarPDF ? "Procesando..." : "Solo Registrar"}
          </button>

          <button
            type="submit"
            onClick={() => setGenerarPDF(true)}
            disabled={cargando}
            className="order-1 sm:order-2 flex-[1.5] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white bg-slate-900 hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <FileText size={18} />
            {cargando && generarPDF ? "Generando..." : "Registrar y Generar Ticket"}
          </button>
        </div>
      </form>

      {/* --- MODAL RESPONSIVA --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold leading-none">Nuevo Registro</h3>
                <p className="text-[10px] text-slate-400 uppercase mt-1 tracking-widest">Censo de Locatarios</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegistrarNuevo} className="p-6 md:p-8 space-y-4">
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Nombre completo" required 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={nuevoLocatario.nombre}
                  onChange={e => setNuevoLocatario({...nuevoLocatario, nombre: e.target.value})}
                />
                <input 
                  type="text" placeholder="Cédula" disabled 
                  className="w-full p-4 bg-gray-100 border-none rounded-2xl text-sm text-gray-400 font-bold"
                  value={nuevoLocatario.cedula}
                />
                <input 
                  type="text" placeholder="Número de Puesto" required 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={nuevoLocatario.puesto}
                  onChange={e => setNuevoLocatario({...nuevoLocatario, puesto: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all mt-4">
                Confirmar y Registrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}