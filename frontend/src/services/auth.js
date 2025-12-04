import { authService } from './api';

export { authService };
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const saveAuthToken = (token) => {
    localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

export const removeAuthToken = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
};

export const saveUserData = (userData) => {
    localStorage.setItem('user_data', JSON.stringify(userData));
};

export const getUserData = () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
};

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            username,
            password
        });

        if (response.data.success) {
            saveAuthToken(response.data.token);
            saveUserData(response.data.user);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Error de conexión' };
    }
};

export const verifyToken = async () => {
    const token = getAuthToken();

    if (!token) {
        return { valid: false, error: 'No hay token' };
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/verify`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        removeAuthToken();
        return { valid: false, error: 'Token inválido' };
    }
};

export const logout = async () => {
    const token = getAuthToken();

    if (token) {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error en logout:', error);
        }
    }

    removeAuthToken();
    return { success: true };
};

export const changePassword = async (currentPassword, newPassword) => {
    const token = getAuthToken();

    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/change-password`, {
            currentPassword,
            newPassword
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Error de conexión' };
    }
};