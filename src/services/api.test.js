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
      }),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
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
      get: vi.fn().mockRejectedValue(new Error('Network Error')),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))

    const { jobsService } = await import('../services/api')

    await expect(jobsService.getJobs()).rejects.toThrow('Falha ao carregar as vagas de emprego')
  })

  it('should create axios instance with correct config', async () => {
    const mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }
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

  it('adds authorization header when token is available', async () => {
    const mockToken = 'test-token-123'
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue(mockToken),
      isAuthenticated: vi.fn().mockReturnValue(true)
    }

    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: { data: [] } }),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
    const config = { headers: {} }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe('Bearer test-token-123')
  })

  it('does not add authorization header when token is not available', async () => {
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue(null),
      isAuthenticated: vi.fn().mockReturnValue(false)
    }

    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: { data: [] } }),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
    const config = { headers: {} }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

  it('handles empty token string correctly', async () => {
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue('')
    }

    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: { data: [] } }),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
    const config = { headers: {} }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

  it('preserves existing headers when adding authorization', async () => {
    const mockToken = 'test-token-123'
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue(mockToken)
    }

    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: { data: [] } }),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
    const config = {
      headers: {
        'Custom-Header': 'custom-value',
        'Content-Type': 'application/json'
      }
    }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe('Bearer test-token-123')
    expect(result.headers['Custom-Header']).toBe('custom-value')
    expect(result.headers['Content-Type']).toBe('application/json')
  })

  it('handles request interceptor error correctly', async () => {
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))

    await import('../services/api')

    const errorHandler = mockAxiosInstance.interceptors.request.use.mock.calls[0][1]
    const error = new Error('Request error')

    await expect(errorHandler(error)).rejects.toBe(error)
  })

  it('returns jobs data when response has nested data structure', async () => {
    const mockJobsData = {
      data: [
        { id: '1', title: 'Frontend Developer', company: 'Tech Corp' },
        { id: '2', title: 'Backend Developer', company: 'Software Inc' }
      ],
      meta: { total: 2 }
    }

    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({
        data: mockJobsData
      }),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))

    const { jobsService } = await import('../services/api')
    const result = await jobsService.getJobs()

    expect(result).toEqual(mockJobsData)
  })

  it('should logout and redirect when 401 error occurs and user is authenticated', async () => {
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue('valid-token'),
      isAuthenticated: vi.fn().mockReturnValue(true),
      logout: vi.fn()
    }

    const mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    const mockLocation = { href: '' }
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    })

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]

    const error = {
      response: { status: 401 }
    }

    await expect(responseErrorHandler(error)).rejects.toEqual(error)

    expect(mockAuthService.logout).toHaveBeenCalled()
    expect(mockLocation.href).toBe('/login')
  })

  it('should not logout when 401 error occurs but user is not authenticated', async () => {
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue(null),
      isAuthenticated: vi.fn().mockReturnValue(false),
      logout: vi.fn()
    }

    const mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    const mockLocation = { href: '' }
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    })

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]

    const error = {
      response: { status: 401 }
    }

    await expect(responseErrorHandler(error)).rejects.toEqual(error)

    expect(mockAuthService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('')
  })

  it('should not logout when error is not 401', async () => {
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue('valid-token'),
      isAuthenticated: vi.fn().mockReturnValue(true),
      logout: vi.fn()
    }

    const mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    const mockLocation = { href: '' }
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    })

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]

    const error = {
      response: { status: 500 }
    }

    await expect(responseErrorHandler(error)).rejects.toEqual(error)

    expect(mockAuthService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('')
  })

  it('should handle errors without response object', async () => {
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue('valid-token'),
      isAuthenticated: vi.fn().mockReturnValue(true),
      logout: vi.fn()
    }

    const mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]

    const error = new Error('Network Error')

    await expect(responseErrorHandler(error)).rejects.toEqual(error)

    expect(mockAuthService.logout).not.toHaveBeenCalled()
  })

  it('should pass through successful responses', async () => {
    const mockAuthService = {
      getToken: vi.fn().mockReturnValue('valid-token'),
      isAuthenticated: vi.fn().mockReturnValue(true),
      logout: vi.fn()
    }

    const mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }

    const mockAxios = {
      create: vi.fn().mockReturnValue(mockAxiosInstance)
    }

    vi.doMock('axios', () => ({ default: mockAxios }))
    vi.doMock('./auth.js', () => ({ authService: mockAuthService }))

    await import('../services/api')

    const responseSuccessHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]

    const response = { data: { success: true } }

    const result = responseSuccessHandler(response)

    expect(result).toEqual(response)
    expect(mockAuthService.logout).not.toHaveBeenCalled()
  })

  describe('jobsService - 401 Error Handling', () => {
    it('should not set error state when 401 occurs', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue({
          response: { status: 401 },
          message: 'Unauthorized'
        }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }

      const mockAxios = {
        create: vi.fn().mockReturnValue(mockAxiosInstance)
      }

      vi.doMock('axios', () => ({ default: mockAxios }))

      const { jobsService } = await import('../services/api')

      await expect(jobsService.getJobs()).rejects.toThrow('Falha ao carregar as vagas de emprego')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/jobs')
    })
  })
})
