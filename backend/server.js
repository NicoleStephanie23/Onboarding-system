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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.query).length > 0) {
    console.log('   Query params:', req.query);
  }
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
  console.log('🔍 Query params:', req.query);

  try {
    const { search, status } = req.query;

    let query = 'SELECT * FROM collaborators WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(searchTerm, searchTerm);
      console.log(`🔎 Búsqueda: "${search}"`);
    }

    if (status && status !== 'all') {
      query += ' AND (welcome_onboarding_status = ? OR technical_onboarding_status = ?)';
      params.push(status, status);
      console.log(`🏷️  Estado: "${status}"`);
    }

    query += ' ORDER BY hire_date DESC';

    console.log('📋 Query:', query);
    console.log('🎯 Params:', params);

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(query, params);
    await connection.end();

    console.log(`✅ ${rows.length} colaboradores`);
    res.json(rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Error al obtener colaboradores' });
  }
});

app.get('/api/collaborators/:id', async (req, res) => {
  console.log(`🔍 GET /api/collaborators/${req.params.id}`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM collaborators WHERE id = ?',
      [req.params.id]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    res.json(rows[0]);

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/collaborators', async (req, res) => {
  console.log('➕ POST /api/collaborators');
  console.log('📦 Data:', req.body);

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
  console.log(`✏️  PUT /api/collaborators/${req.params.id}`);
  console.log('📦 Data:', req.body);

  try {
    const {
      full_name,
      email,
      hire_date,
      welcome_onboarding_status,
      technical_onboarding_status,
      technical_onboarding_date
    } = req.body;

    if (!full_name && !email && !hire_date &&
      !welcome_onboarding_status && !technical_onboarding_status &&
      technical_onboarding_date === undefined) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const connection = await mysql.createConnection(dbConfig);
    const updates = [];
    const values = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }

    if (hire_date !== undefined) {
      updates.push('hire_date = ?');
      values.push(hire_date);
    }

    if (welcome_onboarding_status !== undefined) {
      updates.push('welcome_onboarding_status = ?');
      values.push(welcome_onboarding_status);
    }

    if (technical_onboarding_status !== undefined) {
      updates.push('technical_onboarding_status = ?');
      values.push(technical_onboarding_status);
    }

    if (technical_onboarding_date !== undefined) {
      updates.push('technical_onboarding_date = ?');
      values.push(technical_onboarding_date);
    }

    values.push(req.params.id);
    const query = `UPDATE collaborators SET ${updates.join(', ')} WHERE id = ?`;

    console.log('📋 Query:', query);
    console.log('🎯 Values:', values);

    const [result] = await connection.execute(query, values);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    console.log(`✅ ${result.affectedRows} fila(s) actualizada(s)`);

    res.json({
      success: true,
      message: 'Colaborador actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en PUT:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Email duplicado',
        message: 'El email ya está en uso por otro colaborador'
      });
    }

    res.status(500).json({
      error: 'Error al actualizar colaborador',
      message: error.message
    });
  }
});

app.post('/api/collaborators/:id/complete-onboarding', async (req, res) => {
  console.log(`✅ POST /api/collaborators/${req.params.id}/complete-onboarding`);
  console.log('📦 Data:', req.body);

  try {
    const { type } = req.body;

    if (!type || !['welcome', 'technical'].includes(type)) {
      return res.status(400).json({
        error: 'Tipo de onboarding inválido. Use "welcome" o "technical"'
      });
    }

    const statusField = type === 'welcome' ? 'welcome_onboarding_status' : 'technical_onboarding_status';
    const dateField = type === 'technical' ? 'technical_onboarding_date' : null;

    let query = `UPDATE collaborators SET ${statusField} = 'completed'`;
    const values = [];

    if (dateField) {
      query += `, ${dateField} = ?`;
      values.push(new Date().toISOString().split('T')[0]);
    }

    query += ' WHERE id = ?';
    values.push(req.params.id);

    console.log('📋 Query:', query);
    console.log('🎯 Values:', values);

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(query, values);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    console.log(`✅ Onboarding ${type} completado`);

    res.json({
      success: true,
      message: `Onboarding ${type} marcado como completado`
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      error: 'Error al completar onboarding'
    });
  }
});

app.delete('/api/collaborators/:id', async (req, res) => {
  console.log(`🗑️  DELETE /api/collaborators/${req.params.id}`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM collaborators WHERE id = ?',
      [req.params.id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    res.json({
      success: true,
      message: 'Colaborador eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar colaborador' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();

    res.json({
      status: 'OK',
      mysql: 'connected'
    });

  } catch (error) {
    res.json({
      status: 'WARNING',
      mysql: 'disconnected',
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'Onboarding System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      collaborators: {
        list: 'GET /api/collaborators?search=&status=',
        get: 'GET /api/collaborators/:id',
        create: 'POST /api/collaborators',
        update: 'PUT /api/collaborators/:id',
        delete: 'DELETE /api/collaborators/:id',
        completeOnboarding: 'POST /api/collaborators/:id/complete-onboarding'
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend en http://localhost:${PORT}`);
  console.log(`📋 Colaboradores: http://localhost:${PORT}/api/collaborators`);
  console.log(`🗄️  MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
});