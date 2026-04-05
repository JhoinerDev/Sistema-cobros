import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { LogIn, Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); 
  const [cargando, setCargando] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCargando(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid)); 
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'Admin') {
          navigate('/dashboard');
        } else {
          navigate('/recaudacion');
        }
      } else {
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

 {/* Decoración de fondo */}
 <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
 <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>

       <div className="relative w-120 ">

  {/* TARJETA PRINCIPAL (Ahora contiene todo) */}
 <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 p-10 md:p-12">

 {/* CABECERA DENTRO DE LA TARJETA */}
 <div className="flex flex-col items-center pt-2 mb-10">

 {/* CONTENEDOR PARA IMAGEN (Estilo portal/puerta) */}
 <div className="w-40 h-40 bg-slate-100/50 rounded-[2.2rem] flex items-center justify-center mb-1 overflow-hidden group shadow-inner relative border-4 border-white/50">
  {/* Imagen - Reemplaza TU_IMAGEN_AQUI.png con tu URL real */}
 <img
src="/logo.png" // TEXTO PLACEHOLDER CLARO
alt="Portal de Acceso ProCobros"
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 // onError visual fallback
 onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
 />

 {/* Fallback visual si no hay imagen (icono LogIn original sutil) */}
 <div className="absolute inset-0 items-center justify-center text-slate-400 opacity-20 group-hover:opacity-40 transition-opacity hidden">
 <LogIn size={36} className="text-slate-900" />
</div>
 </div>

 <div className="text-center">
 <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
 ASOVE<span className="text-blue-600">MERPO</span>
</h1>
 <p className="text-[10px] text-blue-500/60 font-black uppercase tracking-[0.4em] mt-3 bg-blue-50 py-1 px-3 rounded-full inline-block">
Acceso Administrativo
</p>
 </div>
 </div>

 {/* Alertas */}
 {error && (
 <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
 <AlertCircle className="text-rose-500 shrink-0" size={18} />
 <p className="text-[11px] font-black text-rose-600 uppercase leading-tight">{error}</p>
 </div>
 )}

{success && (
<div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
 <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
 <p className="text-[11px] font-black text-emerald-600 uppercase leading-tight">{success}</p>
 </div>
 )}

 {/* FORMULARIO */}
 <form onSubmit={handleLogin} className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Correo Electrónico</label>
 <div className="relative group">
 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
<input
 type="email"
 required
 value={email}
className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/10 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300"
placeholder="ejemplo@correo.com"
 onChange={(e) => setEmail(e.target.value)}
/>
 </div>
 </div>

       <div className="space-y-2">
<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña</label>
 <div className="relative group">
 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
 <input
 type="password"
 required
 value={password}
 className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/10 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300"
 placeholder="••••••••"
 onChange={(e) => setPassword(e.target.value)}
 />
 </div>
<div className="text-right pr-2 pt-1">
 <button
type="button"
onClick={handleResetPassword}
className="text-[10px] font-black text-blue-500 uppercase hover:text-blue-700 transition-colors tracking-tighter"
 >
 ¿Olvidaste tu clave?
 </button>
 </div>
</div>

<button
type="submit"
 disabled={cargando}
 className={`w-full py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all duration-300 mt-4 flex justify-center items-center gap-3 ${
 cargando
? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
 : 'bg-slate-500 text-white shadow-slate-200 hover:bg-blue-400 hover:-translate-y-1 active:scale-95'
 }`}
 >
{cargando ? (
 <>
<Loader2 className="animate-spin" size={18} />
 Verificando Acceso
 </>
) : (
 'Entrar al Sistema'
 )}
 </button>
</form>
 </div>

 {/* Footer fuera de la tarjeta para ligereza visual */}
{/*         <div className="mt-8 flex flex-col items-center gap-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
            v1.0 • Control Interno
          </p>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
        </div> */}
 </div> 
  </div>
 );
}