import axios from 'axios';
import { API_CONFIG } from '../config.js';
import { authService } from './auth.js';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
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

export const analysisService = {
  async analyzeJob(jobUrl) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.ANALYSIS, {
        position: jobUrl
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        const customError = new Error('Você precisa cadastrar suas habilidades para usar a análise com IA');
        customError.statusCode = 400;
        throw customError;
      }
      if (error.response?.status === 401) {
        const customError = new Error('Token inválido. Faça login novamente.');
        customError.statusCode = 401;
        throw customError;
      }
      if (error.response?.status === 403) {
        const customError = new Error('Você não tem permissão para usar a análise com IA. Atualize seu plano para premium.');
        customError.statusCode = 403;
        throw customError;
      }
      throw new Error('Erro ao analisar a vaga. Tente novamente.');
    }
  }
};

export default api;
