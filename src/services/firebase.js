import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Añadimos estos helpers
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Estos datos los sacas de la configuración de tu proyecto en Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDDMEB06ofzLWPLHthEL2MI23o79r8Ee8E",
  authDomain: "sistema-cobros-b097e.firebaseapp.com",
  projectId: "sistema-cobros-b097e",
  storageBucket: "sistema-cobros-b097e.firebasestorage.app",
  messagingSenderId: "688284812426",
  appId: "1:688284812426:web:8edb726cc0fddef62e1973"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);

// EXPORTAMOS los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- AÑADIDOS PARA EL SISTEMA DE COBROS ---

/**
 * Función para cerrar sesión fácilmente desde cualquier parte
 */
export const logout = () => signOut(auth);

/**
 * Escucha cambios en la sesión (Útil para proteger el MainLayout)
 */
export const observeAuthState = (callback) => onAuthStateChanged(auth, callback);

export default app;