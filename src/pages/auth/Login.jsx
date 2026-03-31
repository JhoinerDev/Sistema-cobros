import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase'; // Asegúrate de que esta ruta coincida con tu estructura
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Nuevo estado para mostrar alertas
  const [cargando, setCargando] = useState(false); // Para deshabilitar el botón mientras carga

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Esta es la línea mágica que conecta con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Si la clave es correcta, Firebase guarda la sesión y te deja pasar
      navigate('/dashboard');
    } catch (error) {
      console.error("Error de Auth:", error.code);
      // Si falla, mostramos un mensaje en lugar de una pantalla en blanco
      setError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4 overflow-hidden">
      
      {/* Tarjeta con Estilo Premium */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[350px] relative border border-white p-1">
        
        {/* Logo en Esquina - PNG */}
        <div className="absolute top-6 right-6 w-10 h-10">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain drop-shadow-sm"
            onError={(e) => e.target.style.display = 'none'} 
          />
        </div>

        <div className="p-8 pt-12">
          {/* Título Centrado y Estilizado */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight">
              Acceso
            </h1>
            <div className="h-1 w-8 bg-blue-500 mx-auto mt-1 rounded-full opacity-50"></div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">
              Sistema de Cobros
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mensaje de Error Visual */}
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Input Usuario/Email */}
            <div className="group">
              <input 
                type="email" 
                required
                className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-300 group-hover:border-slate-200"
                placeholder="Correo electrónico"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Input Password */}
            <div className="group text-right">
              <input 
                type="password" 
                required
                className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-300 group-hover:border-slate-200"
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="text-[10px] text-blue-500 font-semibold mt-2 mr-2 hover:underline">
                ¿Olvidaste tu clave?
              </button>
            </div>

            {/* Botón con Degradado y Animación */}
            <button 
              type="submit"
              disabled={cargando}
              className={`w-full text-white py-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-200 mt-2 flex justify-center items-center ${
                cargando 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              {cargando ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Versión Ultra Pequeña */}
          <div className="mt-8 text-center">
            <p className="text-[9px] text-slate-300 font-bold tracking-widest">PRO-COBROS v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}