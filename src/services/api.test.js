import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API Service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('should fetch jobs successfully', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({
        data: {
          data: [{ id: '1', title: 'Test Job', company: 'Test Company' }]
        }
      })
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))

    const { jobsService } = await import('../services/api')
    const result = await jobsService.getJobs()

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/jobs')
    expect(result).toEqual({
      data: [{ id: '1', title: 'Test Job', company: 'Test Company' }]
    })
  })

  it('should handle API errors', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockRejectedValue(new Error('Network Error'))
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))

    const { jobsService } = await import('../services/api')

    await expect(jobsService.getJobs()).rejects.toThrow('Falha ao carregar as vagas de emprego')
  })

  it('should create axios instance with correct config', async () => {
    const mockAxiosInstance = { get: vi.fn() }
    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))

    await import('../services/api')

    expect(mockAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8081',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })
})
