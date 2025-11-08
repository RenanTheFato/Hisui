import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListOrdersService } from '../../../services/orders/list-orders-service.js';
import { prisma } from '../../../config/prisma.js';
import { AssetType, Action, Prisma } from '@prisma/client';

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    orders: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('ListOrdersService', () => {
  const listOrdersService = new ListOrdersService()
  const mockUserId = 'user-123'
  const mockPortfolioId = 'port-456'
  const mockOrders = [
    {
      id: 'order-1',
      user_id: mockUserId,
      portfolio_id: mockPortfolioId,
      asset_type: AssetType.STOCK, 
      action: Action.BUY,       
      stock_ticker: 'PETR4',
      crypto_ticker: null,
      order_price: new Prisma.Decimal(10.5),
      order_currency: 'BRL',
      amount: new Prisma.Decimal(100),
      order_execution_date: new Date(),
      fees: new Prisma.Decimal(0.5),
      tax_amount: new Prisma.Decimal(0.1),
      portfolio: { name: 'My Stock Portfolio' },
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'order-2',
      user_id: mockUserId,
      portfolio_id: mockPortfolioId,
      asset_type: AssetType.CRYPTO,
      action: Action.SELL,
      stock_ticker: null,
      crypto_ticker: 'BTC',
      order_price: new Prisma.Decimal(30000),
      order_currency: 'USD',
      amount: new Prisma.Decimal(0.01),
      order_execution_date: new Date(),
      fees: new Prisma.Decimal(1),
      tax_amount: new Prisma.Decimal(0),
      portfolio: { name: 'My Crypto Portfolio' },
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.orders.findMany).mockResolvedValue(mockOrders)
    vi.mocked(prisma.orders.count).mockResolvedValue(mockOrders.length)
  })

  it('should return the list of orders without filters, with correct pagination and formatting', async () => {
    const params = { page: 1, limit: 10 }
    const result = await listOrdersService.execute(params, { user_id: mockUserId })

    expect(prisma.orders.findMany).toHaveBeenCalledWith({
      where: { user_id: mockUserId },
      include: { portfolio: { select: { name: true } } },
      omit: { portfolio_id: true },
      skip: 0,
      take: 10,
      orderBy: { order_price: 'asc' },
    })
    expect(prisma.orders.count).toHaveBeenCalledWith({ where: { user_id: mockUserId } })

    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.total).toBe(mockOrders.length)
    expect(result.totalPages).toBe(1)

    const stockOrders = result.orders.stock ?? []
    const cryptoOrders = result.orders.crypto ?? []

    expect(stockOrders).toHaveLength(1)
    expect(cryptoOrders).toHaveLength(1)

    expect(stockOrders[0].portfolio_name).toBe('My Stock Portfolio')
    expect(stockOrders[0].portfolio).toBeUndefined()
  })

  it('should apply filter by ticker (STOCK)', async () => {
    const params = { page: 1, limit: 10, ticker: 'PETR4' }
    await listOrdersService.execute(params, { user_id: mockUserId })

    expect(prisma.orders.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: mockUserId,
          OR: [
            { stock_ticker: { contains: 'PETR4', mode: 'insensitive' } },
            { crypto_ticker: { contains: 'PETR4', mode: 'insensitive' } },
          ],
        },
      })
    )
  })

  it('should apply filter by type (CRYPTO)', async () => {
    const params = { page: 1, limit: 10, type: AssetType.CRYPTO }
    await listOrdersService.execute(params, { user_id: mockUserId })

    expect(prisma.orders.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: mockUserId, asset_type: AssetType.CRYPTO },
      })
    )
  })

  it('should apply filter by action (SELL)', async () => {
    const params = { page: 1, limit: 10, action: Action.SELL }
    await listOrdersService.execute(params, { user_id: mockUserId })

    expect(prisma.orders.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: mockUserId, action: Action.SELL },
      })
    )
  })

  it('should apply filter by order_currency', async () => {
    const params = { page: 1, limit: 10, order_currency: 'USD' }
    await listOrdersService.execute(params, { user_id: mockUserId })

    expect(prisma.orders.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: mockUserId, order_currency: { contains: 'USD', mode: 'insensitive' } },
      })
    )
  })

  it('should throw an error if no orders are found', async () => {
    vi.mocked(prisma.orders.findMany).mockResolvedValue([])
    vi.mocked(prisma.orders.count).mockResolvedValue(0)
    const params = { page: 1, limit: 10 }

    await expect(listOrdersService.execute(params, { user_id: mockUserId }))
      .rejects.toThrow('No orders found with the provided filters')
  })
})
