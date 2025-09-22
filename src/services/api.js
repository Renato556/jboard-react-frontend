import axios from 'axios';
import { API_CONFIG } from '../config.js';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const jobsService = {
  async getJobs() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.JOBS);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      throw new Error('Falha ao carregar as vagas de emprego');
    }
  }
};

export default api;
