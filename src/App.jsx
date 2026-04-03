import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// --- IMPORTA TUS VISTAS ---
import Login from './pages/auth/Login'; 
import Dashboard from './pages/dashboard/Dashboard';
import UserManagement from './pages/user/Usuarios'; 
import GestionImpuestos from './pages/impuestos/GestionImpuestos'; 
import MainLayout from './layouts/MainLayout'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Buscamos en la colección "users" (asegúrate que se llame así)
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            // AQUÍ ESTÁ EL TRUCO: Convertimos lo que venga de Firebase a minúsculas
            const rolDesdeBD = docSnap.data().role || docSnap.data().rol;
            setRole(rolDesdeBD?.toLowerCase()); 
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error al obtener rol:", error);
          setRole(null);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
    </div>
  );

  // Variables de control de acceso
  const isAdmin = role === 'admin';
  const isCobrador = role === 'cobrador';

  return (
    <Router>
      <Routes>
        {/* Si no hay usuario, va al Login. Si hay, va a la raíz */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

        {/* Todas estas rutas usan el MainLayout (el Sidebar) */}
        <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" />}>
          
          {/* Al entrar a "/" te redirige según tu rol */}
          <Route index element={
            isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/recaudacion" />
          } />

          {/* Rutas exclusivas de Admin */}
          <Route path="dashboard" element={
            isAdmin ? <Dashboard /> : <Navigate to="/recaudacion" />
          } />
          
          <Route path="usuarios" element={
            isAdmin ? <UserManagement /> : <Navigate to="/recaudacion" />
          } />

          {/* Ruta para ambos (Admin y Cobrador) */}
          <Route path="recaudacion" element={<GestionImpuestos />} />

          {/* Rutas extra (Nomina y otros) */}
          <Route path="nomina" element={isAdmin ? <div>VISTA NÓMINA</div> : <Navigate to="/" />} />
          <Route path="admin/locatarios" element={isAdmin ? <div>VISTA LOCATARIOS</div> : <Navigate to="/" />} />
        </Route>

        {/* Cualquier otra ruta manda al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}