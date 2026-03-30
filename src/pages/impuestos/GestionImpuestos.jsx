import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import SignaturePad from '../../components/ui/SignaturePad';
import { User, CreditCard, Store, DollarSign, Wallet, FileSignature, FileText, CheckCircle, UserPlus, X } from 'lucide-react';
// Asumiendo que tienes esta función para el boleto
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
  
  // ESTADOS PARA LA MODAL Y BÚSQUEDA
  const [generarPDF, setGenerarPDF] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [existeLocatario, setExisteLocatario] = useState(true);
  const [nuevoLocatario, setNuevoLocatario] = useState({ nombre: '', cedula: '', puesto: '' });

  // --- LÓGICA DE AUTOCOMPLETADO (POR CÉDULA) ---
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

  // --- LÓGICA PARA REGISTRAR DESDE LA MODAL ---
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

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Recaudación de Impuestos</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        
        {/* --- DATOS DE CÉDULA --- */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 italic">
              Paso 1: Ingrese la Cédula / RIF para buscar
            </label>
            <div className="relative mt-1">
              <CreditCard size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${buscandoLocatario ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} />
              <input
                type="text"
                name="cedula"
                value={formulario.cedula}
                onChange={handleInputChange}
                className="w-full pl-10 p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-emerald-500 transition-all shadow-sm"
                placeholder="Ej. 12345678"
                required
              />
              {buscandoLocatario && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold animate-pulse">
                  Buscando...
                </span>
              )}
            </div>
          </div>

          {/* BOTÓN PARA ABRIR MODAL (SOLO SI NO EXISTE) */}
          {!existeLocatario && formulario.cedula.length >= 5 && (
            <button
              type="button"
              onClick={() => {
                setNuevoLocatario({...nuevoLocatario, cedula: formulario.cedula});
                setShowModal(true);
              }}
              className="mt-4 md:mt-5 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-emerald-700 transition-all animate-in fade-in zoom-in"
            >
              <UserPlus size={16} /> ¿Registrar Nuevo?
            </button>
          )}
        </div>

        {/* --- DATOS AUTOCOMPLETADOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Contribuyente / Razón Social</label>
            <div className="relative mt-1">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="contribuyente"
                value={formulario.contribuyente}
                onChange={handleInputChange}
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-slate-500 transition-all"
                placeholder="Nombre completo"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Puesto / Local</label>
            <div className="relative mt-1">
              <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="puesto"
                value={formulario.puesto}
                onChange={handleInputChange}
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-slate-500 transition-all"
                placeholder="Ej. Pasillo A-12"
                required
              />
            </div>
          </div>
        </div>

        {/* --- DATOS DE PAGO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Monto ($)</label>
            <div className="relative mt-1">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                name="monto"
                value={formulario.monto}
                onChange={handleInputChange}
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-slate-500 transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Método de Pago</label>
            <div className="relative mt-1">
              <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="metodo"
                value={formulario.metodo}
                onChange={handleInputChange}
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-slate-500 transition-all appearance-none"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Punto">Punto de Venta</option>
                <option value="Divisa">Divisa</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- FIRMA DIGITAL --- */}
        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase mb-3">
            <FileSignature size={14} /> Validación de Firma
          </label>
          
          {!firma ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <SignaturePad onSave={handleSaveFirma} />
            </div>
          ) : (
            <div className="border-2 border-emerald-500 rounded-xl p-4 bg-emerald-50/50 flex flex-col items-center justify-center gap-2 transition-all text-center">
              <p className="text-emerald-700 font-bold text-sm">✓ Firma capturada exitosamente</p>
              <img src={firma} alt="Firma" className="h-16 object-contain mix-blend-multiply" />
              <button 
                type="button" 
                onClick={() => setFirma(null)}
                className="text-[10px] uppercase font-bold text-rose-600 hover:text-rose-700 transition-colors mt-2"
              >
                Volver a firmar
              </button>
            </div>
          )}
        </div>

        {/* --- BOTONES DE ACCIÓN SEPARADOS --- */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            onClick={() => setGenerarPDF(false)}
            disabled={cargando}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              cargando 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <CheckCircle size={18} />
            {cargando && !generarPDF ? "Registrando..." : "Solo Registrar Pago"}
          </button>

          <button
            type="submit"
            onClick={() => setGenerarPDF(true)}
            disabled={cargando}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
              cargando 
                ? 'bg-slate-400' 
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <FileText size={18} />
            {cargando && generarPDF ? "Generando..." : "Registrar y Generar Comprobante"}
          </button>
        </div>
      </form>

      {/* --- MODAL DE REGISTRO RÁPIDO --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Nuevo Locatario</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleRegistrarNuevo} className="p-6 space-y-4">
              <input 
                type="text" placeholder="Nombre" required 
                className="w-full p-3 border rounded-xl"
                value={nuevoLocatario.nombre}
                onChange={e => setNuevoLocatario({...nuevoLocatario, nombre: e.target.value})}
              />
              <input 
                type="text" placeholder="Cédula" disabled 
                className="w-full p-3 border rounded-xl bg-gray-50"
                value={nuevoLocatario.cedula}
              />
              <input 
                type="text" placeholder="Número de Puesto" required 
                className="w-full p-3 border rounded-xl"
                value={nuevoLocatario.puesto}
                onChange={e => setNuevoLocatario({...nuevoLocatario, puesto: e.target.value})}
              />
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">
                Guardar y Continuar Pago
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}