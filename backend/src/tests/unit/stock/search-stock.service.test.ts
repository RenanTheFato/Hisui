import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchStockService } from '../../../services/stocks/search-stock-service.js';
import { prisma } from '../../../config/prisma.js';

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    stocks: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('SearchStockService', () => {
  const searchStockService = new SearchStockService()
  const mockStocks = [
    {
      id: '1',
      name: 'Petrobras',
      ticker: 'PETR4',
      sector: 'Oil & Gas',
      company_name: 'Petróleo Brasileiro S.A.',
      country: 'Brazil',
      exchange: 'B3',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '2',
      name: 'Vale',
      ticker: 'VALE3',
      sector: 'Mining',
      company_name: 'Vale S.A.',
      country: 'Brazil',
      exchange: 'B3',
      created_at: new Date(),
      updated_at: new Date()
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.stocks.findMany).mockResolvedValue(mockStocks)
    vi.mocked(prisma.stocks.count).mockResolvedValue(mockStocks.length)
  })

  it('should return the list of stocks without filters, with correct pagination', async () => {
    const params = { page: 1, limit: 10 }
    const result = await searchStockService.execute(params)

    expect(prisma.stocks.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: {
        name: 'asc',
      },
    })
    expect(prisma.stocks.count).toHaveBeenCalledWith({ where: {} })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.total).toBe(mockStocks.length)
    expect(result.totalPages).toBe(1)
    expect(result.stocks).toEqual(mockStocks)
  })

  it('should apply filter by name (case-insensitive)', async () => {
    const params = { page: 1, limit: 10, name: 'petro' }
    await searchStockService.execute(params)

    expect(prisma.stocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          name: {
            contains: 'petro',
            mode: 'insensitive',
          },
        },
      })
    )
  })

  it('should apply filter by ticker (case-sensitive, mode: default)', async () => {
    const params = { page: 1, limit: 10, ticker: 'PETR4' }
    await searchStockService.execute(params)

    expect(prisma.stocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ticker: {
            contains: 'PETR4',
            mode: 'default',
          },
        },
      })
    )
  })

  it('should apply filter by sector (case-insensitive)', async () => {
    const params = { page: 1, limit: 10, sector: 'oil' }
    await searchStockService.execute(params)

    expect(prisma.stocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          sector: {
            contains: 'oil',
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
      country: 'Brazil',
      exchange: 'B3',
    }
    await searchStockService.execute(params)

    expect(prisma.stocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          country: {
            contains: 'Brazil',
            mode: 'insensitive',
          },
          exchange: {
            contains: 'B3',
            mode: 'insensitive',
          },
        },
      })
    )
  })

  it('should throw an error if no stocks are found', async () => {
    vi.mocked(prisma.stocks.findMany).mockResolvedValue([])
    vi.mocked(prisma.stocks.count).mockResolvedValue(0)
    const params = { page: 1, limit: 10, name: 'non-existent' }

    await expect(searchStockService.execute(params)).rejects.toThrow(
      'No stock found with the provided filters'
    )
  })
})
