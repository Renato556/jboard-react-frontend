import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { authService } from './auth';

vi.mock('axios');
vi.mock('../config.js', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8081',
    ENDPOINTS: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      UPDATE_PASSWORD: '/api/auth/update-password',
      DELETE_ACCOUNT: '/api/auth/delete-account'
    }
  }
}));

const mockAxios = axios;

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('successfully logs in user and stores token', async () => {
      const mockResponse = {
        data: { token: 'test-token-123' }
      };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'testpass');

      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/login',
        { username: 'testuser', password: 'testpass' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toEqual({ success: true, token: 'test-token-123' });
      expect(localStorage.getItem('jboard_token')).toBe('test-token-123');
    });

    it('throws error with invalid credentials status 401', async () => {
      const mockError = {
        response: { status: 401 }
      };
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.login('wronguser', 'wrongpass'))
        .rejects.toThrow('Credenciais inválidas');
      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('throws generic error for non-401 status codes', async () => {
      const mockError = {
        response: { status: 500 }
      };
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.login('testuser', 'testpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });

    it('throws generic error when no response status available', async () => {
      const mockError = new Error('Network Error');
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.login('testuser', 'testpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });

    it('logs error when login fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Network Error');
      mockAxios.post.mockRejectedValue(mockError);

      try {
        await authService.login('testuser', 'testpass');
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Erro no login:', mockError);
      consoleSpy.mockRestore();
    });
  });

  describe('register', () => {
    it('successfully registers new user', async () => {
      mockAxios.post.mockResolvedValue({});

      const result = await authService.register('newuser', 'newpass');

      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/register',
        { username: 'newuser', password: 'newpass' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toEqual({ success: true });
    });

    it('throws error when user already exists status 409', async () => {
      const mockError = {
        response: { status: 409 }
      };
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.register('existinguser', 'password'))
        .rejects.toThrow('Um usuário já existe com esse nome');
    });

    it('throws error for invalid data status 400', async () => {
      const mockError = {
        response: { status: 400 }
      };
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.register('user', 'pass'))
        .rejects.toThrow('Dados inválidos. Verifique as informações.');
    });

    it('throws generic error for other status codes', async () => {
      const mockError = {
        response: { status: 500 }
      };
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.register('user', 'pass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });
  });

  describe('updatePassword', () => {
    beforeEach(() => {
      localStorage.setItem('jboard_token', 'existing-token');
    });

    it('successfully updates password', async () => {
      mockAxios.put.mockResolvedValue({});

      const result = await authService.updatePassword('oldpass', 'newpass');

      expect(mockAxios.put).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/update-password',
        { oldPassword: 'oldpass', newPassword: 'newpass' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer existing-token'
          }
        }
      );
      expect(result).toEqual({ success: true });
    });

    it('throws error when current password is incorrect status 403', async () => {
      const mockError = {
        response: { status: 403 }
      };
      mockAxios.put.mockRejectedValue(mockError);

      await expect(authService.updatePassword('wrongpass', 'newpass'))
        .rejects.toThrow('Senha atual incorreta');
    });

    it('throws error for invalid data status 400', async () => {
      const mockError = {
        response: { status: 400 }
      };
      mockAxios.put.mockRejectedValue(mockError);

      await expect(authService.updatePassword('old', 'new'))
        .rejects.toThrow('Dados inválidos. Verifique as informações.');
    });

    it('includes current token in authorization header', async () => {
      const testToken = 'test-token-456';
      localStorage.setItem('jboard_token', testToken);
      mockAxios.put.mockResolvedValue({});

      await authService.updatePassword('oldpass', 'newpass');

      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${testToken}`
          })
        })
      );
    });
  });

  describe('deleteAccount', () => {
    beforeEach(() => {
      localStorage.setItem('jboard_token', 'existing-token');
    });

    it('successfully deletes account and removes token', async () => {
      mockAxios.delete.mockResolvedValue({});

      const result = await authService.deleteAccount();

      expect(mockAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/delete-account',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer existing-token'
          }
        }
      );
      expect(result).toEqual({ success: true });
      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('throws error when unauthorized status 401', async () => {
      const mockError = {
        response: { status: 401 }
      };
      mockAxios.delete.mockRejectedValue(mockError);

      await expect(authService.deleteAccount())
        .rejects.toThrow('Não autorizado. Faça login novamente.');
      expect(localStorage.getItem('jboard_token')).toBe('existing-token');
    });

    it('removes token even when deletion fails', async () => {
      mockAxios.delete.mockResolvedValue({});

      await authService.deleteAccount();

      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('includes current token in authorization header', async () => {
      const testToken = 'delete-token-789';
      localStorage.setItem('jboard_token', testToken);
      mockAxios.delete.mockResolvedValue({});

      await authService.deleteAccount();

      expect(mockAxios.delete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${testToken}`
          })
        })
      );
    });
  });

  describe('token management', () => {
    it('sets token in localStorage', () => {
      authService.setToken('new-token');

      expect(localStorage.getItem('jboard_token')).toBe('new-token');
    });

    it('gets token from localStorage', () => {
      localStorage.setItem('jboard_token', 'stored-token');

      const token = authService.getToken();

      expect(token).toBe('stored-token');
    });

    it('returns null when no token exists', () => {
      const token = authService.getToken();

      expect(token).toBeNull();
    });

    it('removes token from localStorage', () => {
      localStorage.setItem('jboard_token', 'token-to-remove');

      authService.removeToken();

      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('overwrites existing token when setting new token', () => {
      localStorage.setItem('jboard_token', 'old-token');

      authService.setToken('new-token');

      expect(localStorage.getItem('jboard_token')).toBe('new-token');
    });
  });

  describe('authentication status', () => {
    it('returns true when token exists', () => {
      localStorage.setItem('jboard_token', 'valid-token');

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('returns false when no token exists', () => {
      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });

    it('returns false when token is empty string', () => {
      localStorage.setItem('jboard_token', '');

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });

    it('returns true when token is whitespace', () => {
      localStorage.setItem('jboard_token', '   ');

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });
  });

  describe('logout', () => {
    it('removes token when logging out', () => {
      localStorage.setItem('jboard_token', 'token-to-logout');

      authService.logout();

      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('does nothing when no token exists during logout', () => {
      authService.logout();

      expect(localStorage.getItem('jboard_token')).toBeNull();
    });
  });

  describe('error handling edge cases', () => {
    it('handles axios error without response object in login', async () => {
      const mockError = new Error('Request failed');
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.login('user', 'pass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });

    it('handles axios error without response object in register', async () => {
      const mockError = new Error('Request failed');
      mockAxios.post.mockRejectedValue(mockError);

      await expect(authService.register('user', 'pass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });

    it('handles axios error without response object in updatePassword', async () => {
      localStorage.setItem('jboard_token', 'token');
      const mockError = new Error('Request failed');
      mockAxios.put.mockRejectedValue(mockError);

      await expect(authService.updatePassword('old', 'new'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });

    it('handles axios error without response object in deleteAccount', async () => {
      localStorage.setItem('jboard_token', 'token');
      const mockError = new Error('Request failed');
      mockAxios.delete.mockRejectedValue(mockError);

      await expect(authService.deleteAccount())
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });
  });
});
