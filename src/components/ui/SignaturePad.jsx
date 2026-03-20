import { useRef } from 'react';
// IMPORTANTE: Esta es la nueva librería que instalaste
import SignaturePadWrapper from 'react-signature-pad-wrapper';

export default function SignaturePad({ onSave }) {
  const sigRef = useRef(null);

  const limpiar = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
  };

  const guardar = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      // Obtenemos la imagen directamente
      const dataURL = sigRef.current.toDataURL('image/png');
      onSave(dataURL);
    } else {
      alert("Por favor, proporciona una firma.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden shadow-inner">
        {/* CAMBIO CLAVE: Aquí es donde estaba el error. Usamos SignaturePadWrapper */}
        <SignaturePadWrapper
          ref={sigRef}
          options={{
            penColor: 'black',
            backgroundColor: 'rgba(255, 255, 255, 0)'
          }}
          canvasProps={{
            className: "w-full h-48 cursor-crosshair"
          }}
        />
      </div>
      
      <div className="flex gap-2">
        <button 
          type="button" 
          onClick={limpiar}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Limpiar
        </button>
        
        <button 
          type="button" 
          onClick={guardar}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-sm"
        >
          Confirmar Firma
        </button>
      </div>
    </div>
  );
}