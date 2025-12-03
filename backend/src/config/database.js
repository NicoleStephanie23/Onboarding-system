const mysql = require('mysql2/promise');
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'onboarding_db'
};
console.log('🔧 Configuración MySQL usada:');
console.log({
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password ? '***' + DB_CONFIG.password.slice(-3) : 'EMPTY',
  database: DB_CONFIG.database,
  source: process.env.DB_PASSWORD ? 'dotenv' : 'FALLBACK'
});

const pool = mysql.createPool({
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM collaborators');
    connection.release();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { pool, testConnection };
