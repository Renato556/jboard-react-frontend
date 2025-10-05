import axios from 'axios';
import { API_CONFIG } from '../config.js';

const TOKEN_KEY = 'jboard_token';

export const authService = {
  async login(username, password) {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          username,
          password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const { token } = response.data;
      this.setToken(token);
      return { success: true, token };
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      }
      throw new Error('Erro no servidor. Tente novamente.');
    }
  },

  async register(username, password) {
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`,
        {
          username,
          password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
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
      await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PASSWORD}`,
        {
          oldPassword,
          newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
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
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_ACCOUNT}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          }
        }
      );

      this.removeToken();
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
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
