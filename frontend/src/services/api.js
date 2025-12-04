import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const saveAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
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

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('❌ Error de API:', error.message);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        const isAuthRequest = error.config?.url?.includes('/auth/');
        if (!isAuthRequest) {
          removeAuthToken();
          window.location.href = '/login';
        }
      }

      return Promise.reject({
        success: false,
        error: data?.error || data?.message || `Error ${status}`,
        status: status
      });
    } else if (error.request) {
      return Promise.reject({
        success: false,
        error: 'Error de conexión con el servidor',
        status: 0
      });
    } else {
      return Promise.reject({
        success: false,
        error: error.message,
        status: 0
      });
    }
  }
);

export const authService = {
  login: async (username, password) => {
    try {
      console.log('🔐 Enviando login a:', `${API_BASE_URL}/api/auth/login`);
      console.log('📤 Datos:', { username, password: '***' });

      const response = await api.post('/api/auth/login', {
        username,
        password
      });

      console.log('✅ Respuesta login:', response);

      if (response.success) {
        saveAuthToken(response.token);
        saveUserData(response.user);
        console.log('💾 Token guardado');
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Error de autenticación'
        };
      }

    } catch (error) {
      console.error('❌ Error en login service:', error);

      if (error.success === false) {
        return error;
      }

      return {
        success: false,
        error: error.message || 'Error de conexión con el servidor'
      };
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Enviando registro a:', `${API_BASE_URL}/api/auth/register`);
      console.log('📤 Datos:', { ...userData, password: '***' });

      const response = await api.post('/api/auth/register', userData);

      console.log('✅ Respuesta registro:', response);

      if (response.success) {
        saveAuthToken(response.token);
        saveUserData(response.user);
        console.log('💾 Token guardado después del registro');
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Error en el registro'
        };
      }

    } catch (error) {
      console.error('❌ Error en registro service:', error);

      if (error.status === 404) {
        return {
          success: false,
          error: 'Ruta no encontrada. Verifica que el endpoint /api/auth/register exista.'
        };
      }

      if (error.success === false) {
        return error;
      }

      return {
        success: false,
        error: error.message || 'Error de conexión con el servidor'
      };
    }
  },

  verifyToken: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { valid: false, error: 'No hay token' };
      }

      const response = await api.post('/api/auth/verify', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      removeAuthToken();
      return {
        valid: false,
        error: error.message || 'Token inválido'
      };
    }
  },

  logout: async () => {
    try {
      const token = getAuthToken();
      if (token) {
        await api.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      removeAuthToken();
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export const collaboratorService = {
  getAll: (filters = {}) => {
    const params = {};
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.search) params.search = filters.search;

    return api.get('/api/collaborators', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      params
    });
  },

  getById: (id) => api.get(`/api/collaborators/${id}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),

  create: (data) => api.post('/api/collaborators', data, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),

  update: (id, data) => api.put(`/api/collaborators/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),

  delete: (id) => api.delete(`/api/collaborators/${id}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),

  completeOnboarding: (id, type) =>
    api.post(`/api/collaborators/${id}/complete-onboarding`, { type }, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
};

export const calendarService = {
  getAll: () => api.get('/api/calendar', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),

  create: (data) => api.post('/api/calendar', data, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),

  getUpcoming: () => api.get('/api/alerts/upcoming', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  })
};

export const alertService = {
  getUpcoming: () => api.get('/api/alerts/upcoming', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),

  sendTest: () => api.post('/api/alerts/test', {}, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  })
};

export const healthService = {
  check: () => api.get('/api/health')
};

export const debugService = {
  getUsers: () => api.get('/api/debug/users')
};

export default api;