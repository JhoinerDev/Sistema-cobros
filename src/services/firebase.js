import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Añadimos estos helpers
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Estos datos los sacas de la configuración de tu proyecto en Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCdO7sdhX9FPFXMtui-g2OcIC84_8XjbK4",
  authDomain: "app-cobros-8b231.firebaseapp.com",
  projectId: "app-cobros-8b231",
  storageBucket: "app-cobros-8b231.firebasestorage.app",
  messagingSenderId: "729314259943",
  appId: "1:729314259943:web:e893f6bc62b7d3d2bb4342"
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