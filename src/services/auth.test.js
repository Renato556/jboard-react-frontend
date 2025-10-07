import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./api.js', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn()
  }
}));

vi.mock('../config.js', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8081',
    ENDPOINTS: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      UPDATE_PASSWORD: '/api/auth/update-password',
      DELETE_ACCOUNT: '/api/auth/delete-account',
      SKILLS: '/api/skills'
    }
  }
}));

describe('authService', () => {
  let authService;
  let mockApi;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    mockApi = (await import('./api.js')).default;
    authService = (await import('./auth.js')).authService;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('successfully logs in user and stores token', async () => {
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
      const mockError = {
        response: { status: 401 }
      };
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login('wronguser', 'wrongpass'))
        .rejects.toThrow('Credenciais inválidas');
      expect(localStorage.getItem('jboard_token')).toBeNull();
    });

    it('throws generic error for non-401 status codes', async () => {
      const mockError = {
        response: { status: 500 }
      };
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login('testuser', 'testpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });

    it('throws generic error when no response status available', async () => {
      const mockError = new Error('Network Error');
      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login('testuser', 'testpass'))
        .rejects.toThrow('Erro no servidor. Tente novamente.');
    });
  });

  describe('getUserData', () => {
    it('returns parsed JWT payload when token exists', () => {
      const mockPayload = { sub: 'user123', role: 'premium', exp: 1234567890 };
      const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

      localStorage.setItem('jboard_token', mockToken);

      const result = authService.getUserData();

      expect(result).toEqual(mockPayload);
    });

    it('returns null when no token exists', () => {
      const result = authService.getUserData();

      expect(result).toBeNull();
    });

    it('returns null when token is invalid', () => {
      localStorage.setItem('jboard_token', 'invalid-token');

      const result = authService.getUserData();

      expect(result).toBeNull();
    });

    it('returns null when JWT payload is invalid JSON', () => {
      const invalidToken = 'header.invalid-base64.signature';
      localStorage.setItem('jboard_token', invalidToken);

      const result = authService.getUserData();

      expect(result).toBeNull();
    });

    it('handles token with missing parts', () => {
      localStorage.setItem('jboard_token', 'incomplete-token');

      const result = authService.getUserData();

      expect(result).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('returns premium role when user has premium access', () => {
      const mockPayload = { sub: 'user123', role: 'premium' };
      const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

      localStorage.setItem('jboard_token', mockToken);

      const result = authService.getUserRole();

      expect(result).toBe('premium');
    });

    it('returns free role when user has free access', () => {
      const mockPayload = { sub: 'user123', role: 'free' };
      const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

      localStorage.setItem('jboard_token', mockToken);

      const result = authService.getUserRole();

      expect(result).toBe('free');
    });

    it('returns free as default when no role is specified', () => {
      const mockPayload = { sub: 'user123' };
      const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

      localStorage.setItem('jboard_token', mockToken);

      const result = authService.getUserRole();

      expect(result).toBe('free');
    });

    it('returns free when no token exists', () => {
      const result = authService.getUserRole();

      expect(result).toBe('free');
    });

    it('returns free when token is invalid', () => {
      localStorage.setItem('jboard_token', 'invalid-token');

      const result = authService.getUserRole();

      expect(result).toBe('free');
    });
  });

  describe('getSkills', () => {
    it('successfully fetches skills from API', async () => {
      const mockResponse = {
        data: {
          skills: ['javascript', 'react', 'node.js'],
          meta: { totalRecords: 3 }
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await authService.getSkills();

      expect(mockApi.get).toHaveBeenCalledWith('/api/skills');
      expect(result).toEqual(mockResponse.data);
    });

    it('throws authentication error when unauthorized', async () => {
      mockApi.get.mockRejectedValue({ response: { status: 401 } });

      await expect(authService.getSkills()).rejects.toThrow('Não autorizado. Faça login novamente.');
    });

    it('throws generic error for other API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(authService.getSkills()).rejects.toThrow('Erro ao carregar habilidades. Tente novamente.');
    });
  });

  describe('addSkill', () => {
    it('successfully adds a new skill', async () => {
      const mockResponse = { data: { success: true } };
      const skillToAdd = 'python';

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.addSkill(skillToAdd);

      expect(mockApi.post).toHaveBeenCalledWith('/api/skills', { skill: skillToAdd });
      expect(result).toEqual(mockResponse.data);
    });

    it('throws authentication error when unauthorized', async () => {
      mockApi.post.mockRejectedValue({ response: { status: 401 } });

      await expect(authService.addSkill('python')).rejects.toThrow('Não autorizado. Faça login novamente.');
    });

    it('throws validation error for bad request', async () => {
      mockApi.post.mockRejectedValue({ response: { status: 400 } });

      await expect(authService.addSkill('invalid-skill')).rejects.toThrow('Habilidade inválida ou já existe.');
    });

    it('throws generic error for other API errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Server error'));

      await expect(authService.addSkill('python')).rejects.toThrow('Erro ao adicionar habilidade. Tente novamente.');
    });
  });

  describe('removeSkill', () => {
    it('successfully removes a skill', async () => {
      const mockResponse = { data: { success: true } };
      const skillToRemove = 'javascript';

      mockApi.put.mockResolvedValue(mockResponse);

      const result = await authService.removeSkill(skillToRemove);

      expect(mockApi.put).toHaveBeenCalledWith('/api/skills', { skill: skillToRemove });
      expect(result).toEqual(mockResponse.data);
    });

    it('throws authentication error when unauthorized', async () => {
      mockApi.put.mockRejectedValue({ response: { status: 401 } });

      await expect(authService.removeSkill('javascript')).rejects.toThrow('Não autorizado. Faça login novamente.');
    });

    it('throws not found error when skill does not exist', async () => {
      mockApi.put.mockRejectedValue({ response: { status: 404 } });

      await expect(authService.removeSkill('nonexistent')).rejects.toThrow('Habilidade não encontrada.');
    });

    it('throws generic error for other API errors', async () => {
      mockApi.put.mockRejectedValue(new Error('Network error'));

      await expect(authService.removeSkill('javascript')).rejects.toThrow('Erro ao remover habilidade. Tente novamente.');
    });
  });

  describe('removeAllSkills', () => {
    it('successfully removes all skills', async () => {
      const mockResponse = { data: { success: true } };

      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await authService.removeAllSkills();

      expect(mockApi.delete).toHaveBeenCalledWith('/api/skills');
      expect(result).toEqual(mockResponse.data);
    });

    it('throws authentication error when unauthorized', async () => {
      mockApi.delete.mockRejectedValue({ response: { status: 401 } });

      await expect(authService.removeAllSkills()).rejects.toThrow('Não autorizado. Faça login novamente.');
    });

    it('throws generic error for other API errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Server error'));

      await expect(authService.removeAllSkills()).rejects.toThrow('Erro ao remover todas as habilidades. Tente novamente.');
    });
  });

  describe('integration scenarios', () => {
    it('handles complete user workflow with skills', async () => {
      const mockPayload = { sub: 'user123', role: 'premium' };
      const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;
      localStorage.setItem('jboard_token', mockToken);

      expect(authService.getUserRole()).toBe('premium');

      mockApi.get.mockResolvedValue({ data: { skills: [] } });
      mockApi.post.mockResolvedValue({ data: { success: true } });
      mockApi.put.mockResolvedValue({ data: { success: true } });
      mockApi.delete.mockResolvedValue({ data: { success: true } });

      const initialSkills = await authService.getSkills();
      expect(initialSkills.skills).toEqual([]);

      await authService.addSkill('javascript');
      await authService.addSkill('react');

      await authService.removeSkill('javascript');

      await authService.removeAllSkills();

      expect(mockApi.get).toHaveBeenCalledWith('/api/skills');
      expect(mockApi.post).toHaveBeenCalledWith('/api/skills', { skill: 'javascript' });
      expect(mockApi.post).toHaveBeenCalledWith('/api/skills', { skill: 'react' });
      expect(mockApi.put).toHaveBeenCalledWith('/api/skills', { skill: 'javascript' });
      expect(mockApi.delete).toHaveBeenCalledWith('/api/skills');
    });
  });
});
