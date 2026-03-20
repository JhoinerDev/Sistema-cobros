import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-slate-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Iniciar Sesión</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Entrar al Sistema
        </button>
      </div>
    </div>
  );
}