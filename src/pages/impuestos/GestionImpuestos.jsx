import { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SignaturePad from '../../components/ui/SignaturePad';

export default function GestionImpuestos() {
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [firma, setFirma] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSaveFirma = (url) => {
    setFirma(url);
    console.log("Firma recibida en el padre correctamente");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firma) {
      alert("La firma es obligatoria para el comprobante");
      return;
    }

    setCargando(true);
    try {
      await addDoc(collection(db, "pagos_impuestos"), {
        contribuyente: nombre,
        monto: parseFloat(monto),
        firmaBase64: firma, // Guardamos la imagen directamente
        fecha: serverTimestamp(),
        tipo: "Impuesto Municipal"
      });

      alert("¡Cobro registrado con éxito!");
      // Limpiar formulario
      setNombre('');
      setMonto('');
      setFirma(null);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al registrar el cobro");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-50 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Impuestos</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Contribuyente</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Monto del Impuesto</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        <div className="py-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Firma Digital del Cliente</label>
          {/* Si ya hay firma, mostramos un mensaje de éxito, si no, el pad */}
          {!firma ? (
            <SignaturePad onSave={handleSaveFirma} />
          ) : (
            <div className="border-2 border-green-500 rounded-lg p-2 bg-green-50 text-center">
              <p className="text-green-700 font-medium mb-2">✓ Firma capturada</p>
              <button 
                type="button" 
                onClick={() => setFirma(null)}
                className="text-xs text-red-600 underline"
              >
                Cambiar firma
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={cargando}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
            cargando ? 'bg-gray-400' : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          {cargando ? "Registrando..." : "Registrar Cobro y Generar Boleto"}
        </button>
      </form>
    </div>
  );
}