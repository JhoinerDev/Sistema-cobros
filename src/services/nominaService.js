import { db } from './firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore'; // Asegúrate de agregar updateDoc al import
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

// Función para cambiar el estado (Pagado/Pendiente)
export const actualizarEstadoEmpleado = async (id, nuevoEstado) => {
  try {
    const empleadoRef = doc(db, "empleados", id);
    await updateDoc(empleadoRef, {
      estado: nuevoEstado
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
  }
};
