import { db } from './firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';

const collectionRef = collection(db, "empleados");

// Escuchar empleados en tiempo real
export const suscribirAEmpleados = (callback) => {
  const q = query(collectionRef);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

// Agregar un nuevo empleado
export const agregarEmpleado = async (empleado) => {
  try {
    await addDoc(collectionRef, {
      ...empleado,
      fechaRegistro: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al agregar empleado:", error);
  }
};