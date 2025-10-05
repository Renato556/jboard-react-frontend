import axios from 'axios';
import { API_CONFIG } from '../config.js';
import { authService } from './auth.js';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && authService.isAuthenticated()) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const jobsService = {
  async getJobs() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.JOBS);
      return response.data;
    } catch {
      throw new Error('Falha ao carregar as vagas de emprego');
    }
  }
};

export default api;
