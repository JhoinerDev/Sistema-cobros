const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// 1. Descarga este JSON desde Firebase: Configuración del proyecto > Cuentas de servicio
const serviceAccount = require("./tu-llave-privada.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const resultados = [];

fs.createReadStream('tu_archivo_censo.csv')
  .pipe(csv())
  .on('data', (data) => resultados.push(data))
  .on('end', async () => {
    console.log(`Leídos ${resultados.length} locatarios. Subiendo...`);
    
    const batch = db.batch(); // Usamos batch para subir muchos de golpe
    
    resultados.forEach((docData) => {
      // Creamos una referencia con un ID automático en la colección 'locatarios'
      const docRef = db.collection('locatarios').doc();
      batch.set(docRef, {
        nombre: docData.nombre,
        cedula: docData.cedula,
        puesto: docData.puesto.toUpperCase(),
        fechaRegistro: new Date()
      });
    });

    await batch.commit();
    console.log("¡Carga masiva completada con éxito!");
  });