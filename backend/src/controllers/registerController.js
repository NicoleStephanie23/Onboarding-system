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

const registerController = {
    async register(req, res) {
        const { full_name, email, username, password } = req.body;

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

        try {
            const connection = await mysql.createConnection(dbConfig);
            const [existingUsers] = await connection.execute(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUsers.length > 0) {
                await connection.end();
                return res.status(409).json({
                    success: false,
                    error: 'El nombre de usuario o email ya está registrado'
                });
            }

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            let role = 'viewer';
            const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
            if (users[0].count === 0) {
                role = 'admin';
            }
            const [result] = await connection.execute(
                'INSERT INTO users (full_name, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
                [full_name, email, username, passwordHash, role]
            );
            const token = jwt.sign(
                {
                    id: result.insertId,
                    username: username,
                    email: email,
                    full_name: full_name,
                    role: role
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            await connection.end();

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                token: token,
                user: {
                    id: result.insertId,
                    username: username,
                    email: email,
                    full_name: full_name,
                    role: role
                }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};

module.exports = registerController;