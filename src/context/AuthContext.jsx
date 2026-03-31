import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase"; // Importamos db
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Para buscar el rol

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // <--- Estado para el rol
  const [loading, setLoading] = useState(true);

  // Función para cerrar sesión
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Si hay usuario, buscamos su rol en la colección 'usuarios'
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRole(docSnap.data().role); // 'admin', 'operador', etc.
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Ahora pasamos 'user', 'role' y 'logout' a toda la app
  return (
    <AuthContext.Provider value={{ user, role, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);