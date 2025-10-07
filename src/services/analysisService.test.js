import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analysisService } from './api.js';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance)
    }
  };
});

vi.mock('./auth.js', () => ({
  authService: {
    getToken: vi.fn(() => 'mock-token'),
    isAuthenticated: vi.fn(() => true),
    logout: vi.fn()
  }
}));

vi.mock('../config.js', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:3000',
    ENDPOINTS: {
      ANALYSIS: '/api/analysis',
      JOBS: '/api/jobs'
    }
  }
}));

describe('analysisService', () => {
  let mockAxiosInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    const axios = await import('axios');
    mockAxiosInstance = axios.default.create();
  });

  describe('analyzeJob', () => {
    it('faz chamada POST para endpoint correto com payload adequado', async () => {
      const mockResponse = {
        data: {
          message: 'Análise da vaga concluída com sucesso'
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const jobUrl = 'https://example.com/job/123';
      const result = await analysisService.analyzeJob(jobUrl);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/analysis', {
        position: jobUrl
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('lança erro customizado com statusCode 400 para erro de habilidades', async () => {
      const mockError = {
        response: {
          status: 400
        }
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      try {
        await analysisService.analyzeJob('https://example.com/job/123');
        expect.fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error.message).toBe('Você precisa cadastrar suas habilidades para usar a análise com IA');
        expect(error.statusCode).toBe(400);
      }
    });

    it('lança erro customizado com statusCode 401 para token inválido', async () => {
      const mockError = {
        response: {
          status: 401
        }
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      try {
        await analysisService.analyzeJob('https://example.com/job/123');
        expect.fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error.message).toBe('Token inválido. Faça login novamente.');
        expect(error.statusCode).toBe(401);
      }
    });

    it('lança erro customizado com statusCode 403 para sem permissão', async () => {
      const mockError = {
        response: {
          status: 403
        }
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      try {
        await analysisService.analyzeJob('https://example.com/job/123');
        expect.fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error.message).toBe('Você não tem permissão para usar a análise com IA. Atualize seu plano para premium.');
        expect(error.statusCode).toBe(403);
      }
    });

    it('lança erro genérico para outros códigos de status', async () => {
      const mockError = {
        response: {
          status: 500
        }
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      try {
        await analysisService.analyzeJob('https://example.com/job/123');
        expect.fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error.message).toBe('Erro ao analisar a vaga. Tente novamente.');
        expect(error.statusCode).toBeUndefined();
      }
    });

    it('lança erro genérico para erro sem response', async () => {
      const mockError = new Error('Erro de rede');

      mockAxiosInstance.post.mockRejectedValue(mockError);

      try {
        await analysisService.analyzeJob('https://example.com/job/123');
        expect.fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error.message).toBe('Erro ao analisar a vaga. Tente novamente.');
      }
    });

    it('retorna dados de análise válidos', async () => {
      const mockAnalysis = {
        message: 'Esta vaga é adequada para seu perfil.\nRecomendações:\n— Destaque suas habilidades em React\n— Mencione experiência com TypeScript'
      };

      const mockResponse = {
        data: mockAnalysis
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await analysisService.analyzeJob('https://example.com/job/123');

      expect(result).toEqual(mockAnalysis);
      expect(result.message).toContain('Esta vaga é adequada');
      expect(result.message).toContain('\n');
      expect(result.message).toContain('—');
    });
  });
});
