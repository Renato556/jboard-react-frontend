import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./api.js', () => {
  const mockApi = {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  };
  return {
    default: mockApi
  };
});

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

describe('AuthService', () => {
  let mockApi;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    mockApi = (await import('./api.js')).default;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('successfully logs in user and stores token', async () => {
      const { authService } = await import('./auth');
      const mockResponse = {
        data: { token: 'test-token-123' }
      };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'testpass');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { username: 'testuser', password: 'testpass' }
      );
      expect(result).toEqual({ success: true, token: 'test-token-123' });
      expect(localStorage.getItem('jboard_token')).toBe('test-token-123');
    });

    it('throws error with invalid credentials status 401', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 401 }
      };
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login('wronguser', 'wrongpass'))
        .rejects.toThrow('Credenciais inválidas');
      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('throws generic error for non-401 status codes', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 500 }
      };
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login('testuser', 'testpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });

    it('throws generic error when no response status available', async () => {
      const { authService } = await import('./auth');
      const mockError = new Error('Network Error');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login('testuser', 'testpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });
  });

  describe('register', () => {
    it('successfully registers new user', async () => {
      const { authService } = await import('./auth');
      mockApi.post.mockResolvedValue({});

      const result = await authService.register('newuser', 'newpass');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/auth/register',
        { username: 'newuser', password: 'newpass' }
      );
      expect(result).toEqual({ success: true });
    });

    it('throws error for existing username status 409', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 409 }
      };
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.register('existinguser', 'password'))
        .rejects.toThrow('Um usuário já existe com esse nome');
    });

    it('throws error for invalid data status 400', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 400 }
      };
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.register('', ''))
        .rejects.toThrow('Dados inválidos. Verifique as informações.');
    });

    it('throws generic error for other status codes', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 500 }
      };
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.register('newuser', 'newpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });
  });

  describe('updatePassword', () => {
    it('successfully updates password', async () => {
      const { authService } = await import('./auth');
      mockApi.put.mockResolvedValue({});

      const result = await authService.updatePassword('oldpass', 'newpass');

      expect(mockApi.put).toHaveBeenCalledWith(
        '/api/auth/update-password',
        { oldPassword: 'oldpass', newPassword: 'newpass' }
      );
      expect(result).toEqual({ success: true });
    });

    it('throws error for incorrect current password status 403', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 403 }
      };
      mockApi.put.mockRejectedValue(mockError);

      await expect(authService.updatePassword('wrongpass', 'newpass'))
        .rejects.toThrow('Senha atual incorreta');
    });

    it('throws error for invalid data status 400', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 400 }
      };
      mockApi.put.mockRejectedValue(mockError);

      await expect(authService.updatePassword('', ''))
        .rejects.toThrow('Dados inválidos. Verifique as informações.');
    });

    it('throws generic error for other status codes', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 500 }
      };
      mockApi.put.mockRejectedValue(mockError);

      await expect(authService.updatePassword('oldpass', 'newpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });
  });

  describe('deleteAccount', () => {
    it('successfully deletes account and removes token', async () => {
      const { authService } = await import('./auth');
      localStorage.setItem('jboard_token', 'test-token');
      mockApi.delete.mockResolvedValue({});

      const result = await authService.deleteAccount();

      expect(mockApi.delete).toHaveBeenCalledWith('/api/auth/delete-account');
      expect(result).toEqual({ success: true });
      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('throws error for unauthorized status 401', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 401 }
      };
      mockApi.delete.mockRejectedValue(mockError);

      await expect(authService.deleteAccount())
        .rejects.toThrow('Não autorizado. Faça login novamente.');
    });

    it('throws generic error for other status codes', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 500 }
      };
      mockApi.delete.mockRejectedValue(mockError);

      await expect(authService.deleteAccount())
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });
  });

  describe('Token Management', () => {
    it('setToken stores token in localStorage', async () => {
      const { authService } = await import('./auth');

      authService.setToken('test-token');

      expect(localStorage.getItem('jboard_token')).toBe('test-token');
    });

    it('getToken retrieves token from localStorage', async () => {
      const { authService } = await import('./auth');
      localStorage.setItem('jboard_token', 'stored-token');

      const token = authService.getToken();

      expect(token).toBe('stored-token');
    });

    it('removeToken removes token from localStorage', async () => {
      const { authService } = await import('./auth');
      localStorage.setItem('jboard_token', 'test-token');

      authService.removeToken();

      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('isAuthenticated returns true when token exists', async () => {
      const { authService } = await import('./auth');
      localStorage.setItem('jboard_token', 'test-token');

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('isAuthenticated returns false when token does not exist', async () => {
      const { authService } = await import('./auth');

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });

    it('logout removes token', async () => {
      const { authService } = await import('./auth');
      localStorage.setItem('jboard_token', 'test-token');

      authService.logout();

      expect(localStorage.getItem('jboard_token')).toBeNull();
    });
  });

  describe('API Integration', () => {
    it('uses centralized API instance for login', async () => {
      const { authService } = await import('./auth');
      mockApi.post.mockResolvedValue({ data: { token: 'test-token' } });

      await authService.login('user', 'pass');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { username: 'user', password: 'pass' }
      );
    });

    it('uses centralized API instance for register', async () => {
      const { authService } = await import('./auth');
      mockApi.post.mockResolvedValue({});

      await authService.register('user', 'pass');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/auth/register',
        { username: 'user', password: 'pass' }
      );
    });

    it('uses centralized API instance for updatePassword', async () => {
      const { authService } = await import('./auth');
      mockApi.put.mockResolvedValue({});

      await authService.updatePassword('old', 'new');

      expect(mockApi.put).toHaveBeenCalledWith(
        '/api/auth/update-password',
        { oldPassword: 'old', newPassword: 'new' }
      );
    });

    it('uses centralized API instance for deleteAccount', async () => {
      const { authService } = await import('./auth');
      mockApi.delete.mockResolvedValue({});

      await authService.deleteAccount();

      expect(mockApi.delete).toHaveBeenCalledWith('/api/auth/delete-account');
    });

    it('handles 401 errors correctly in updatePassword', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 401 }
      };
      mockApi.put.mockRejectedValue(mockError);

      await expect(authService.updatePassword('old', 'new'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');

      expect(mockApi.put).toHaveBeenCalledWith(
        '/api/auth/update-password',
        { oldPassword: 'old', newPassword: 'new' }
      );
    });

    it('handles 401 during deleteAccount through centralized API', async () => {
      const { authService } = await import('./auth');
      const mockError = {
        response: { status: 401 }
      };
      mockApi.delete.mockRejectedValue(mockError);

      await expect(authService.deleteAccount())
        .rejects.toThrow('Não autorizado. Faça login novamente.');

      expect(mockApi.delete).toHaveBeenCalledWith('/api/auth/delete-account');
    });
  });
});
