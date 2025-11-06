import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPythonServerStatusService } from '../../services/machine/admin/get-python-server-status-service.js';

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('GetPythonServerStatusService', () => {
  const getPythonServerStatusService = new GetPythonServerStatusService()
  const mockStatus = {
    status: 'ok',
    version: '1.0.0',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PYTHON_SERVER_URL = 'http://mock-python-server.com'
  })

  it('should return Python server status successfully', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockStatus),
    })

    const result = await getPythonServerStatusService.execute()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://mock-python-server.com/health',
      expect.objectContaining({
        method: 'GET',
      })
    )
    expect(result).toEqual(mockStatus)
  })

  it('should throw an error if the server response is not 200', async () => {
    const errorMessage = 'Server is down'
    mockFetch.mockResolvedValue({
      status: 503,
      json: () => Promise.resolve({ message: errorMessage }),
    })

    await expect(getPythonServerStatusService.execute()).rejects.toThrow(
      `Failed to get status of Python server: ${errorMessage}`
    )
  })

  it('should throw an error if fetch fails', async () => {
    const fetchError = new Error('Network error')
    mockFetch.mockRejectedValue(fetchError)

    await expect(getPythonServerStatusService.execute()).rejects.toThrow(
      `Failed to get status of Python server: ${fetchError.message}`
    )
  })
})