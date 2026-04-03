import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Inicializamos los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- CONFIGURACIÓN DE SEGURIDAD Y PWA ---

/**
 * Forzamos que la sesión se guarde localmente.
 * Esto es VITAL para la PWA: permite que el cobrador cierre la app 
 * y al volver a entrar siga logueado sin internet.
 */
setPersistence(auth, browserLocalPersistence);

/**
 * Función para cerrar sesión fácilmente
 */
export const logout = () => signOut(auth);

/**
 * Escucha cambios en la sesión
 */
export const observeAuthState = (callback) => onAuthStateChanged(auth, callback);

export default app;