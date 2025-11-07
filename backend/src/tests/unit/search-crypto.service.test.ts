import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchCryptoService } from '../../services/crypto/search-crypto-service.js';
import { prisma } from '../../config/prisma.js';

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    cryptos: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('SearchCryptoService', () => {
  const searchCryptoService = new SearchCryptoService()
  const mockCryptos = [
    {
      id: '1',
      name: 'Bitcoin',
      ticker: 'BTC',
      blockchain: 'Bitcoin',
      protocol: 'PoW',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '2',
      name: 'Ethereum',
      ticker: 'ETH',
      blockchain: 'Ethereum',
      protocol: 'PoS',
      created_at: new Date(),
      updated_at: new Date()
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.cryptos.findMany).mockResolvedValue(mockCryptos)
    vi.mocked(prisma.cryptos.count).mockResolvedValue(mockCryptos.length)
  })

  it('should return the list of cryptos without filters, with correct pagination', async () => {
    const params = { page: 1, limit: 10 }
    const result = await searchCryptoService.execute(params)

    expect(prisma.cryptos.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: {
        name: 'asc',
      },
    })
    expect(prisma.cryptos.count).toHaveBeenCalledWith({ where: {} })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.total).toBe(mockCryptos.length)
    expect(result.totalPages).toBe(1)
    expect(result.cryptos).toEqual(mockCryptos)
  })

  it('should apply filter by name (case-insensitive)', async () => {
    const params = { page: 1, limit: 10, name: 'bit' }
    await searchCryptoService.execute(params)

    expect(prisma.cryptos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          name: {
            contains: 'bit',
            mode: 'insensitive',
          },
        },
      })
    )
  })

  it('should apply filter by ticker (case-sensitive, mode: default)', async () => {
    const params = { page: 1, limit: 10, ticker: 'BTC' }
    await searchCryptoService.execute(params)

    expect(prisma.cryptos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ticker: {
            contains: 'BTC',
            mode: 'default',
          },
        },
      })
    )
  })

  it('should apply filter by blockchain (case-insensitive)', async () => {
    const params = { page: 1, limit: 10, blockchain: 'ethereum' }
    await searchCryptoService.execute(params)

    expect(prisma.cryptos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          blockchain: {
            contains: 'ethereum',
            mode: 'insensitive',
          },
        },
      })
    )
  })

  it('should apply multiple filters', async () => {
    const params = {
      page: 1,
      limit: 10,
      protocol: 'PoW',
      ticker: 'BTC',
    }
    await searchCryptoService.execute(params)

    expect(prisma.cryptos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          protocol: {
            contains: 'PoW',
            mode: 'insensitive',
          },
          ticker: {
            contains: 'BTC',
            mode: 'default',
          },
        },
      })
    )
  })

  it('should throw an error if no cryptos are found', async () => {
    vi.mocked(prisma.cryptos.findMany).mockResolvedValue([])
    vi.mocked(prisma.cryptos.count).mockResolvedValue(0)
    const params = { page: 1, limit: 10, name: 'non-existent' }

    await expect(searchCryptoService.execute(params)).rejects.toThrow(
      'No crypto found with the provided filters'
    )
  })
})