const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión usando variables de entorno
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verificación inicial
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error en la conexión a Postgres:', err.message);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL');
  }
});

module.exports = pool;