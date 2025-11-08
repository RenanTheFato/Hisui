import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ViewPETR4ModelInfoService } from '../../../services/machine/admin/view-petr4-model-info-service.js';

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('ViewPETR4ModelInfoService', () => {
  const viewPETR4ModelInfoService = new ViewPETR4ModelInfoService()
  const mockModelInfo = {
    model_name: 'PETR4 Predictor',
    version: '1.0',
    last_trained: '2025-10-30',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PYTHON_SERVER_URL = 'http://mock-python-server.com'
  })

  it('should return PETR4 model info successfully', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockModelInfo),
    })

    const result = await viewPETR4ModelInfoService.execute()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://mock-python-server.com/petr4/info',
      expect.objectContaining({
        method: 'GET',
      })
    )
    expect(result).toEqual(mockModelInfo)
  })

  it('should throw an error if the server response is not 200', async () => {
    const errorMessage = 'Model info not found'
    mockFetch.mockResolvedValue({
      status: 404,
      json: () => Promise.resolve({ message: errorMessage }),
    })

    await expect(viewPETR4ModelInfoService.execute()).rejects.toThrow(
      `Failed to get the PETR4 model info from Python server: ${errorMessage}`
    )
  })

  it('should throw an error if fetch fails', async () => {
    const fetchError = new Error('Network error')
    mockFetch.mockRejectedValue(fetchError)

    await expect(viewPETR4ModelInfoService.execute()).rejects.toThrow(
      `Failed to get the PETR4 model info from Python server: ${fetchError.message}`
    )
  })
})