const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'onboarding_db'
};

console.log('🔧 Configuración MySQL:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

app.get('/api/collaborators', async (req, res) => {
  console.log('📋 GET /api/collaborators');
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM collaborators ORDER BY hire_date DESC');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Error al obtener colaboradores' });
  }
});

app.get('/api/collaborators/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM collaborators WHERE id = ?',
      [req.params.id]
    );
    await connection.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Colaborador no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/collaborators', async (req, res) => {
  try {
    const { full_name, email, hire_date } = req.body;

    if (!full_name || !email || !hire_date) {
      return res.status(400).json({
        error: 'Faltan campos requeridos'
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO collaborators (full_name, email, hire_date) VALUES (?, ?, ?)',
      [full_name, email, hire_date]
    );
    await connection.end();

    res.status(201).json({
      id: result.insertId,
      full_name,
      email,
      hire_date
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear colaborador' });
  }
});

app.put('/api/collaborators/:id', async (req, res) => {
  try {
    const { full_name, email, hire_date } = req.body;

    if (!full_name && !email && !hire_date) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const connection = await mysql.createConnection(dbConfig);

    const updates = [];
    const values = [];

    if (full_name) { updates.push('full_name = ?'); values.push(full_name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (hire_date) { updates.push('hire_date = ?'); values.push(hire_date); }

    values.push(req.params.id);
    const query = `UPDATE collaborators SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await connection.execute(query, values);
    await connection.end();

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Colaborador no encontrado' });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar colaborador' });
  }
});

app.delete('/api/collaborators/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM collaborators WHERE id = ?',
      [req.params.id]
    );
    await connection.end();

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Colaborador no encontrado' });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar colaborador' });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'Onboarding System API',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('🔥 ERROR NO MANEJADO:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend ejecutándose en http://localhost:${PORT}`);
});
