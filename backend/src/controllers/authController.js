const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'onboarding_db'
};

const JWT_SECRET = process.env.JWT_SECRET || 'onboarding_system_secret_key_2024';
const JWT_EXPIRES_IN = '24h';

const authController = {
    async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Usuario y contraseña son requeridos'
            });
        }

        try {
            const connection = await mysql.createConnection(dbConfig);
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
                [username, username]
            );

            await connection.end();

            if (users.length === 0) {
                return res.status(401).json({
                    error: 'Usuario no encontrado o inactivo'
                });
            }

            const user = users[0];
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({
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

            const updateConnection = await mysql.createConnection(dbConfig);
            await updateConnection.execute(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [user.id]
            );
            await updateConnection.end();
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
            console.error('Error en login:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                details: error.message
            });
        }
    },
    async verifyToken(req, res) {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                valid: false,
                error: 'Token no proporcionado'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
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
    },

    async changePassword(req, res) {
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
    },
    logout(req, res) {
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    }
};

module.exports = authController;