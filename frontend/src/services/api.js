import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error('❌ Error en response:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Timeout: El servidor no respondió a tiempo',
        status: 408
      });
    }

    if (!error.response) {
      return Promise.reject({
        message: 'Error de red: No se pudo conectar al servidor',
        status: 0
      });
    }

    return Promise.reject({
      message: error.response.data?.error || 'Error del servidor',
      status: error.response.status,
      data: error.response.data
    });
  }
);

export const collaboratorService = {
  getAll: (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;

    return api.get('/collaborators', { params });
  },

  getById: (id) => api.get(`/collaborators/${id}`),

  create: (data) => api.post('/collaborators', data),

  update: (id, data) => api.put(`/collaborators/${id}`, data),

  delete: (id) => api.delete(`/collaborators/${id}`),

  completeOnboarding: (id, type) =>
    api.post(`/collaborators/${id}/complete-onboarding`, { type })
};

export const calendarService = {
  getAll: (filters = {}) => {
    const params = {};
    if (filters.year) params.year = filters.year;
    if (filters.type) params.type = filters.type;

    return api.get('/calendar', { params });
  },

  create: (data) => api.post('/calendar', data)
};

export const alertService = {
  getUpcoming: () => api.get('/alerts/upcoming'),
  sendTest: () => api.post('/alerts/test')
};

export default api;
