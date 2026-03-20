import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

// EXPORTAMOS los servicios (Aquí es donde estaba el error de la pantalla blanca)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);