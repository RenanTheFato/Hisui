import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateOrderService } from "../../../services/orders/create-order-service.js";
import { prisma } from "../../../config/prisma.js";
import { sendOrderConfirmationEmail } from "../../../packages/order-mail-package.js";

vi.mock("../../../config/prisma.js", () => ({
  prisma: {
    portfolio: {
      findFirst: vi.fn(),
    },
    stocks: {
      findUnique: vi.fn(),
    },
    cryptos: {
      findUnique: vi.fn(),
    },
    users: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock("../../../packages/order-mail-package.js", () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}))

describe("CreateOrderService", () => {
  const createOrderService = new CreateOrderService()
  const mockUserId = "user-123"
  const mockPortfolioId = "port-456"
  const mockTicker = "PETR4"

  const mockOrder = {
    portfolioId: mockPortfolioId,
    userId: mockUserId,
    ticker: mockTicker,
    type: "STOCK" as const,
    action: "BUY" as const,
    order_price: 10.5,
    order_currency: "BRL",
    amount: 100,
    order_execution_date: new Date(),
    fees: 0.5,
    tax_amount: 0.1,
  }

  const mockPortfolio = { id: mockPortfolioId, user_id: mockUserId }
  const mockStock = { id: 1, ticker: mockTicker, name: "Petrobras" }
  const mockUser = {
    email: "test@example.com",
    username: "Test User",
    userPreferences: {
      user_id: mockUserId,
      allow_news_notifications: true,
      allow_orders_notifications: true,
      allow_updates_notifications: true,
    }
  }
  const mockNewOrder = { id: "order-789", ...mockOrder }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.portfolio.findFirst).mockResolvedValue(mockPortfolio as any)
    vi.mocked(prisma.stocks.findUnique).mockResolvedValue(mockStock as any)
    vi.mocked(prisma.users.findUnique).mockResolvedValue(mockUser as any)

    vi.mocked(prisma.$transaction).mockImplementation((callback: any) => {
      const tx = {
        orders: {
          findFirst: vi.fn().mockResolvedValue({ id: 1 }),
          create: vi.fn().mockResolvedValue(mockNewOrder),
        },
      }
      return callback(tx)
    })
  })

  it("should create a STOCK BUY order successfully", async () => {
    const result = await createOrderService.execute(mockOrder)

    expect(prisma.portfolio.findFirst).toHaveBeenCalled()
    expect(prisma.stocks.findUnique).toHaveBeenCalledWith({
      where: { ticker: mockTicker },
    })
    expect(prisma.cryptos.findUnique).not.toHaveBeenCalled()
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result).toEqual(mockNewOrder)
    expect(sendOrderConfirmationEmail).toHaveBeenCalled()
  })

  it("should create a STOCK SELL order successfully if the asset is owned", async () => {
    const sellOrder = { ...mockOrder, action: "SELL" as const }
    const result = await createOrderService.execute(sellOrder)

    expect(prisma.portfolio.findFirst).toHaveBeenCalled()
    expect(prisma.stocks.findUnique).toHaveBeenCalled()
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result).toEqual(mockNewOrder)
    expect(sendOrderConfirmationEmail).toHaveBeenCalled()
  })

  it("should throw an error if the portfolio does not exist", async () => {
    vi.mocked(prisma.portfolio.findFirst).mockResolvedValue(null)

    await expect(createOrderService.execute(mockOrder)).rejects.toThrow(
      "The portfolio doesn't exists"
    )
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("should throw an error if the user is not the portfolio owner", async () => {
    vi.mocked(prisma.portfolio.findFirst).mockResolvedValue({
      ...mockPortfolio,
      user_id: "other-user",
    } as any)

    await expect(createOrderService.execute(mockOrder)).rejects.toThrow(
      "You are not allowed to modify this portfolio"
    )
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("should throw an error if the STOCK does not exist", async () => {
    vi.mocked(prisma.stocks.findUnique).mockResolvedValue(null)

    await expect(createOrderService.execute(mockOrder)).rejects.toThrow(
      `The stock ${mockTicker} doesn't exist in the database`
    )
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("should throw an error if the CRYPTO does not exist", async () => {
    const cryptoOrder = {
      ...mockOrder,
      type: "CRYPTO" as const,
      ticker: "BTC"
    }
    vi.mocked(prisma.stocks.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.cryptos.findUnique).mockResolvedValue(null)

    await expect(createOrderService.execute(cryptoOrder)).rejects.toThrow(
      `The crypto BTC doesn't exist in the database`
    )
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("should throw an error if trying to SELL an asset not owned", async () => {
    const sellOrder = { ...mockOrder, action: "SELL" as const }
    let txOrdersCreateMock: any

    vi.mocked(prisma.$transaction).mockImplementation((callback: any) => {
      const tx = {
        orders: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockNewOrder),
        },
      }
      txOrdersCreateMock = tx.orders.create
      return callback(tx)
    })

    await expect(createOrderService.execute(sellOrder)).rejects.toThrow(
      `You don't own ${mockTicker} in this portfolio to can be sell it`
    )
    expect(txOrdersCreateMock).not.toHaveBeenCalled()
  })

  it("should create a CRYPTO BUY order successfully", async () => {
    const cryptoOrder = {
      ...mockOrder,
      type: "CRYPTO" as const,
      ticker: "BTC"
    }

    vi.mocked(prisma.stocks.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.cryptos.findUnique).mockResolvedValue({
      id: 1,
      ticker: "BTC",
      name: "Bitcoin",
    } as any)

    const result = await createOrderService.execute(cryptoOrder)

    expect(prisma.portfolio.findFirst).toHaveBeenCalled()
    expect(prisma.stocks.findUnique).not.toHaveBeenCalled()
    expect(prisma.cryptos.findUnique).toHaveBeenCalledWith({
      where: { ticker: "BTC" },
    })
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result).toEqual(mockNewOrder)
    expect(sendOrderConfirmationEmail).toHaveBeenCalled()
  })
})