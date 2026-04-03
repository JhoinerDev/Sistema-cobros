import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // 1. CORREGIDO: Ahora busca en la colección correcta "users"
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            // 2. IMPORTANTE: Asegúrate que en Firestore diga "role" y no "rol"
            setRole(docSnap.data().role); 
          } else {
            console.warn("No se encontró documento de usuario en Firestore.");
            setRole(null); // Si no hay documento, no tiene rol
          }
        } catch (error) {
          console.error("Error al obtener el rol de Firestore:", error);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);