import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase'; // Añadimos db
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Para verificar el rol
import { LogIn, Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Para el mensaje de correo enviado
  const [cargando, setCargando] = useState(false);

  // --- LÓGICA: RECUPERAR CONTRASEÑA ---
  const handleResetPassword = async () => {
    if (!email) {
      setError('Escribe tu correo para enviarte el enlace de recuperación.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Enlace enviado. Revisa tu correo (y el spam).');
      setError('');
    } catch (err) {
      setError('No pudimos enviar el correo. Verifica que sea válido.');
    }
  };

  // --- LÓGICA: LOGIN CON SEGURIDAD DE ROL ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCargando(true);

    try {
      // 1. Autenticación básica
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verificación de Seguridad: Buscar Rol en Firestore
      // Buscamos en la colección 'users' el documento con el UID del usuario
      const userDoc = await getDoc(doc(db, "users", user.uid)); 
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Lógica de redirección inteligente:
        // Si es Admin va al dashboard, si es otro (Cobrador) va a la recaudación
        if (userData.role === 'Admin') {
          navigate('/dashboard');
        } else {
          navigate('/recaudacion');
        }
      } else {
        // Si el usuario existe en Authentication pero no tiene datos en Firestore
        setError('El usuario no tiene un rol asignado en la base de datos.');
      }

    } catch (error) {
      console.error("Error de Auth:", error.code);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta.');
      } else {
        setError('Error de conexión. Reintenta.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

      <div className="relative w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-slate-200 mb-4 rotate-3">
            <LogIn className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
            Pro<span className="text-blue-600">Cobros</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Acceso Administrativo</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 sm:p-10">
          
          {/* Alertas de Error */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-rose-500 shrink-0" size={18} />
              <p className="text-[11px] font-black text-rose-600 uppercase leading-tight">{error}</p>
            </div>
          )}

          {/* Alertas de Éxito (Recuperación) */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
              <p className="text-[11px] font-black text-emerald-600 uppercase leading-tight">{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Usuario / Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  placeholder="ejemplo@correo.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="text-right pr-2">
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-[10px] font-black text-blue-500 uppercase hover:underline tracking-tighter"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={cargando}
              className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all duration-300 mt-4 flex justify-center items-center gap-3 ${
                cargando 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-slate-900 text-white shadow-slate-200 hover:bg-blue-700 hover:-translate-y-1 active:scale-95'
              }`}
            >
              {cargando ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verificando
                </>
              ) : (
                'Entrar al Sistema'
              )}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
          v1.0 • Control Interno
        </p>
      </div>
    </div>
  );
}