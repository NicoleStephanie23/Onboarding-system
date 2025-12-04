const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Middleware de logging
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
  database: process.env.DB_NAME || 'onboarding_db',
  timezone: '+00:00'
};

const JWT_SECRET = process.env.JWT_SECRET || 'onboarding_system_secret_key_2024';
const JWT_EXPIRES_IN = '24h';

console.log('🔧 Configuración MySQL:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }

    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

const isManagerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
  }
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

// RUTA DE REGISTRO (CREAR CUENTA)
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 POST /api/auth/register');
  console.log('📦 Data recibida:', { ...req.body, password: '***' });

  try {
    const { full_name, email, username, password } = req.body;

    // Validaciones
    if (!full_name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const connection = await mysql.createConnection(dbConfig);

    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(409).json({
        success: false,
        error: 'El email o usuario ya está registrado'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Determinar rol (primer usuario = admin, otros = viewer)
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const role = users[0].count === 0 ? 'admin' : 'viewer';

    // Crear nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, username, password_hash, role]
    );

    await connection.end();

    // Generar token JWT para el nuevo usuario
    const token = jwt.sign(
      {
        id: result.insertId,
        username: username,
        email: email,
        full_name: full_name,
        role: role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('✅ Usuario registrado exitosamente:', username);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        full_name,
        role: role
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 POST /api/auth/login');
  console.log('📦 Data recibida:', { ...req.body, password: '***' });

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Usuario y contraseña son requeridos'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
      [username, username]
    );

    await connection.end();

    if (users.length === 0) {
      // Verificar si es el admin por defecto (para desarrollo)
      if (username === 'admin' && password === 'Admin123!') {
        console.log('✅ Login de admin por defecto (desarrollo)');

        const token = jwt.sign(
          {
            id: 1,
            username: 'admin',
            email: 'admin@onboarding.com',
            full_name: 'Administrador Principal',
            role: 'admin'
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
          success: true,
          message: 'Login exitoso (modo desarrollo)',
          token,
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@onboarding.com',
            full_name: 'Administrador Principal',
            role: 'admin'
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o inactivo'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Actualizar último login
    const updateConnection = await mysql.createConnection(dbConfig);
    await updateConnection.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );
    await updateConnection.end();

    console.log('✅ Login exitoso para:', user.username);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// VERIFICAR TOKEN
app.post('/api/auth/verify', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      valid: false,
      error: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Para el token del admin temporal (desarrollo)
    if (decoded.id === 1 && decoded.username === 'admin') {
      return res.json({
        valid: true,
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@onboarding.com',
          full_name: 'Administrador Principal',
          role: 'admin'
        }
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(
      'SELECT id, username, email, full_name, role FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.id]
    );
    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({
        valid: false,
        error: 'Usuario no encontrado o inactivo'
      });
    }

    res.json({
      valid: true,
      user: users[0]
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token inválido o expirado'
    });
  }
});

// LOGOUT
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

// CAMBIAR CONTRASEÑA
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: 'Contraseña actual y nueva contraseña son requeridas'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: 'La nueva contraseña debe tener al menos 6 caracteres'
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isCurrentPasswordValid) {
      await connection.end();
      return res.status(401).json({
        error: 'Contraseña actual incorrecta'
      });
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// ==================== RUTAS DE COLABORADORES ====================

// OBTENER TODOS LOS COLABORADORES (CON FILTROS)
app.get('/api/collaborators', authenticateToken, async (req, res) => {
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
    }

    if (status && status !== 'all') {
      query += ' AND (welcome_onboarding_status = ? OR technical_onboarding_status = ?)';
      params.push(status, status);
    }

    query += ' ORDER BY hire_date DESC';

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(query, params);
    await connection.end();

    console.log(`✅ ${rows.length} colaboradores obtenidos`);
    res.json(rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener colaboradores'
    });
  }
});

// OBTENER COLABORADOR POR ID
app.get('/api/collaborators/:id', authenticateToken, async (req, res) => {
  console.log(`🔍 GET /api/collaborators/${req.params.id}`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM collaborators WHERE id = ?',
      [req.params.id]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// CREAR NUEVO COLABORADOR
app.post('/api/collaborators', authenticateToken, isManagerOrAdmin, async (req, res) => {
  console.log('➕ POST /api/collaborators');
  console.log('📦 Data recibida:', req.body);

  try {
    const { full_name, email, hire_date } = req.body;

    if (!full_name || !email || !hire_date) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos (nombre, email, fecha)'
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO collaborators (full_name, email, hire_date) VALUES (?, ?, ?)',
      [full_name, email, hire_date]
    );
    await connection.end();

    console.log('✅ Colaborador creado:', email);

    res.status(201).json({
      success: true,
      id: result.insertId,
      full_name,
      email,
      hire_date
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al crear colaborador'
    });
  }
});

// ACTUALIZAR COLABORADOR
app.put('/api/collaborators/:id', authenticateToken, isManagerOrAdmin, async (req, res) => {
  console.log(`✏️  PUT /api/collaborators/${req.params.id}`);
  console.log('📦 Data recibida:', req.body);

  try {
    const {
      full_name,
      email,
      hire_date,
      welcome_onboarding_status,
      technical_onboarding_status,
      technical_onboarding_date
    } = req.body;

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

      if (technical_onboarding_status === 'completed' && technical_onboarding_date === undefined) {
        updates.push('technical_onboarding_date = CURDATE()');
      }
    }

    if (technical_onboarding_date !== undefined) {
      if (technical_onboarding_date === null || technical_onboarding_date === '') {
        updates.push('technical_onboarding_date = NULL');
      } else {
        updates.push('technical_onboarding_date = ?');
        values.push(technical_onboarding_date);
      }
    }

    values.push(req.params.id);
    const query = `UPDATE collaborators SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await connection.execute(query, values);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado'
      });
    }

    console.log('✅ Colaborador actualizado:', req.params.id);

    res.json({
      success: true,
      message: 'Colaborador actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en PUT:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar colaborador'
    });
  }
});

// COMPLETAR ONBOARDING
app.post('/api/collaborators/:id/complete-onboarding', authenticateToken, isManagerOrAdmin, async (req, res) => {
  console.log(`✅ POST /api/collaborators/${req.params.id}/complete-onboarding`);

  try {
    const { type } = req.body;

    if (!type || !['welcome', 'technical'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de onboarding inválido. Use "welcome" o "technical"'
      });
    }

    const statusField = type === 'welcome' ? 'welcome_onboarding_status' : 'technical_onboarding_status';
    const dateField = type === 'technical' ? 'technical_onboarding_date' : null;

    let query;
    if (dateField) {
      query = `UPDATE collaborators SET ${statusField} = 'completed', ${dateField} = CURDATE() WHERE id = ?`;
    } else {
      query = `UPDATE collaborators SET ${statusField} = 'completed' WHERE id = ?`;
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(query, [req.params.id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado'
      });
    }

    console.log(`✅ Onboarding ${type} completado para ID:`, req.params.id);

    res.json({
      success: true,
      message: `Onboarding ${type} marcado como completado`
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al completar onboarding'
    });
  }
});

// ELIMINAR COLABORADOR
app.delete('/api/collaborators/:id', authenticateToken, isAdmin, async (req, res) => {
  console.log(`🗑️  DELETE /api/collaborators/${req.params.id}`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM collaborators WHERE id = ?',
      [req.params.id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado'
      });
    }

    console.log('✅ Colaborador eliminado:', req.params.id);

    res.json({
      success: true,
      message: 'Colaborador eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar colaborador'
    });
  }
});

// ==================== RUTAS DE CALENDARIO ====================
app.get('/api/calendar', authenticateToken, async (req, res) => {
  console.log('📅 GET /api/calendar');

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM technical_onboarding_calendar ORDER BY start_date ASC'
    );
    await connection.end();

    console.log(`✅ ${rows.length} eventos de calendario`);
    res.json(rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener calendario'
    });
  }
});

app.post('/api/calendar', authenticateToken, isManagerOrAdmin, async (req, res) => {
  console.log('➕ POST /api/calendar');

  try {
    const {
      title,
      description,
      type,
      start_date,
      end_date,
      responsible_email,
      max_participants = 20
    } = req.body;

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      `INSERT INTO technical_onboarding_calendar 
       (title, description, type, start_date, end_date, responsible_email, max_participants)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, type, start_date, end_date, responsible_email, max_participants]
    );

    await connection.end();

    console.log('✅ Evento creado:', title);

    res.status(201).json({
      success: true,
      id: result.insertId,
      ...req.body
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al crear evento'
    });
  }
});

// ==================== RUTAS DE ALERTAS ====================
app.get('/api/alerts/upcoming', authenticateToken, async (req, res) => {
  console.log('🔔 GET /api/alerts/upcoming');

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT * FROM technical_onboarding_calendar 
       WHERE start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY start_date ASC`
    );
    await connection.end();

    console.log(`✅ ${rows.length} alertas próximas`);
    res.json(rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener alertas'
    });
  }
});

// ==================== RUTAS PÚBLICAS ====================
app.get('/api/health', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();

    res.json({
      status: 'OK',
      mysql: 'connected',
      message: 'Backend funcionando correctamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.json({
      status: 'WARNING',
      mysql: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// RUTA DE DIAGNÓSTICO
app.get('/api/debug/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute('SELECT id, username, email, role FROM users');
    await connection.end();

    res.json({ users });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// RUTA PRINCIPAL
app.get('/', (req, res) => {
  res.json({
    name: 'Onboarding System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'POST /api/auth/verify',
        logout: 'POST /api/auth/logout'
      },
      collaborators: 'GET /api/collaborators',
      calendar: 'GET /api/calendar',
      alerts: 'GET /api/alerts/upcoming',
      health: 'GET /api/health'
    }
  });
});

// ERROR 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.url,
    method: req.method
  });
});

// MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
  console.error('🔥 ERROR GLOBAL:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`
  🚀 ==============================================
  🚀 Backend Onboarding System INICIADO
  🚀 ==============================================
  📍 URL Principal: http://localhost:${PORT}
  🔐 Login: http://localhost:${PORT}/api/auth/login
  📝 Registro: http://localhost:${PORT}/api/auth/register
  📊 Health Check: http://localhost:${PORT}/api/health
  👥 Colaboradores: http://localhost:${PORT}/api/collaborators
  📅 Calendario: http://localhost:${PORT}/api/calendar
  🗄️  MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}
  ==============================================
  `);
});