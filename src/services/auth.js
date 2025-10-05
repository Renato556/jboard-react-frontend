import api from './api.js';
import { API_CONFIG } from '../config.js';

const TOKEN_KEY = 'jboard_token';

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post(
        API_CONFIG.ENDPOINTS.LOGIN,
        {
          username,
          password
        }
      );

      const { token } = response.data;
      this.setToken(token);
      return { success: true, token };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      }
      throw new Error('Erro no servidor. Tente novamente.');
    }
  },

  async register(username, password) {
    try {
      await api.post(
        API_CONFIG.ENDPOINTS.REGISTER,
        {
          username,
          password
        }
      );

      return { success: true };
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('Um usuário já existe com esse nome');
      }
      if (error.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique as informações.');
      }
      throw new Error('Erro no servidor. Tente novamente.');
    }
  },

  async updatePassword(oldPassword, newPassword) {
    try {
      await api.put(
        API_CONFIG.ENDPOINTS.UPDATE_PASSWORD,
        {
          oldPassword,
          newPassword
        }
      );

      return { success: true };
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Senha atual incorreta');
      }
      if (error.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique as informações.');
      }
      throw new Error('Erro no servidor. Tente novamente.');
    }
  },

  async deleteAccount() {
    try {
      await api.delete(API_CONFIG.ENDPOINTS.DELETE_ACCOUNT);

      this.removeToken();
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Erro no servidor. Tente novamente.');
    }
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    this.removeToken();
  }
};
