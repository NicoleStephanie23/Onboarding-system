import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, getUserData } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getUserData());
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            const result = await authService.verifyToken();

            if (result.valid) {
                setUser(result.user);
                setIsAuthenticated(true);
                console.log('✅ Usuario autenticado:', result.user.username);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                console.log('❌ No autenticado:', result.error);
            }
        } catch (error) {
            console.error('💥 Error en checkAuth:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        setLoading(true);
        try {
            console.log('🔐 Iniciando proceso de login...');
            const result = await authService.login(username, password);
            console.log('📊 Resultado del login service:', result);

            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                console.log('✅ Login exitoso en AuthContext');
                return { success: true };
            } else {
                console.log('❌ Login fallido en AuthContext:', result.error);
                return {
                    success: false,
                    error: result.error || 'Error de autenticación'
                };
            }
        } catch (error) {
            console.error('💥 Error en login (AuthContext):', error);
            if (error.success !== undefined) {
                return error;
            }
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            console.log('📝 Iniciando proceso de registro...');
            const result = await authService.register(userData);
            console.log('📊 Resultado del registro service:', result);

            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                console.log('✅ Registro exitoso en AuthContext');
                return { success: true };
            } else {
                console.log('❌ Registro fallido en AuthContext:', result.error);
                return {
                    success: false,
                    error: result.error || 'Error en el registro'
                };
            }
        } catch (error) {
            console.error('💥 Error en registro (AuthContext):', error);
            if (error.success !== undefined) {
                return error;
            }
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            console.log('👋 Cerrando sesión...');
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            console.log('✅ Sesión cerrada');
        } catch (error) {
            console.error('💥 Error en logout:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};