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
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(db, "usuarios", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setRole(docSnap.data().role); 
          } else {
            console.warn("No se encontró documento de usuario en Firestore.");
            setRole('usuario'); 
          }
        } catch (error) {
          console.error("Error al obtener el rol de Firestore:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, logout, loading }}>
      {/* Solo renderizamos la app cuando termine de cargar el estado de auth */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);