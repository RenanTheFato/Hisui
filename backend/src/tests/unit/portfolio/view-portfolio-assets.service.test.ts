import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewPortfolioAssetsService } from "../../../services/portfolio/view-portfolio-assets-service.js";
import { prisma } from "../../../config/prisma.js";
import { AssetType, Action, Prisma } from "@prisma/client";

vi.mock("../../../config/prisma.js", () => ({
  prisma: {
    portfolio: { findFirst: vi.fn() },
    orders: { findMany: vi.fn() },
  },
}))

describe("ViewPortfolioAssetsService", () => {
  const service = new ViewPortfolioAssetsService()
  const mockUserId = "user-1"
  const mockOtherUserId = "user-2"
  const mockPortfolioId = "port-10"

  const mockPortfolio = {
    id: mockPortfolioId,
    user_id: mockUserId,
    name: "My Portfolio",
    description: null,
    created_at: new Date(),
    updated_at: new Date(),
  }

  const mockStockOrders = [
    {
      id: "order-1",
      user_id: mockUserId,
      portfolio_id: mockPortfolioId,
      asset_type: AssetType.STOCK,
      action: Action.BUY,
      stock_ticker: "PETR4",
      crypto_ticker: null,
      order_price: new Prisma.Decimal(10.5),
      order_currency: "BRL",
      amount: new Prisma.Decimal(100),
      order_execution_date: new Date(),
      fees: new Prisma.Decimal(0.5),
      tax_amount: new Prisma.Decimal(0.1),
      portfolio: { name: "My Stock Portfolio" },
      created_at: new Date(),
      updated_at: new Date(),
      stock: {
        name: "Petrobras",
        ticker: "PETR4",
        company_name: "Petróleo Brasileiro S.A.",
      },
      crypto: null,
    },
    {
      id: "order-2",
      user_id: mockUserId,
      portfolio_id: mockPortfolioId,
      asset_type: AssetType.STOCK,
      action: Action.BUY,
      stock_ticker: "VALE3",
      crypto_ticker: null,
      order_price: new Prisma.Decimal(20),
      order_currency: "BRL",
      amount: new Prisma.Decimal(50),
      order_execution_date: new Date(),
      fees: new Prisma.Decimal(0.3),
      tax_amount: new Prisma.Decimal(0.05),
      portfolio: { name: "My Stock Portfolio" },
      created_at: new Date(),
      updated_at: new Date(),
      stock: {
        name: "Vale",
        ticker: "VALE3",
        company_name: "Vale S.A.",
      },
      crypto: null,
    },
  ]

  const mockCryptoOrders = [
    {
      id: "order-3",
      user_id: mockUserId,
      portfolio_id: mockPortfolioId,
      asset_type: AssetType.CRYPTO,
      action: Action.SELL,
      stock_ticker: null,
      crypto_ticker: "BTC",
      order_price: new Prisma.Decimal(30000),
      order_currency: "USD",
      amount: new Prisma.Decimal(0.01),
      order_execution_date: new Date(),
      fees: new Prisma.Decimal(1),
      tax_amount: new Prisma.Decimal(0),
      portfolio: { name: "My Crypto Portfolio" },
      created_at: new Date(),
      updated_at: new Date(),
      crypto: {
        name: "Bitcoin",
        ticker: "BTC",
        blockchain: "Bitcoin",
      },
      stock: null,
    },
    {
      id: "order-4",
      user_id: mockUserId,
      portfolio_id: mockPortfolioId,
      asset_type: AssetType.CRYPTO,
      action: Action.SELL,
      stock_ticker: null,
      crypto_ticker: "ETH",
      order_price: new Prisma.Decimal(2000),
      order_currency: "USD",
      amount: new Prisma.Decimal(0.5),
      order_execution_date: new Date(),
      fees: new Prisma.Decimal(0.5),
      tax_amount: new Prisma.Decimal(0),
      portfolio: { name: "My Crypto Portfolio" },
      created_at: new Date(),
      updated_at: new Date(),
      crypto: {
        name: "Ethereum",
        ticker: "ETH",
        blockchain: "Ethereum",
      },
      stock: null,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return portfolio assets (stocks and cryptos) successfully", async () => {
    vi.mocked(prisma.portfolio.findFirst).mockResolvedValue(mockPortfolio)

    vi.mocked(prisma.orders.findMany)
      .mockResolvedValueOnce(mockStockOrders as any)
      .mockResolvedValueOnce(mockCryptoOrders as any)

    const result = await service.execute({ user_id: mockUserId, portfolio_id: mockPortfolioId })

    expect(prisma.portfolio.findFirst).toHaveBeenCalledWith({
      where: { id: mockPortfolioId },
      select: { id: true, user_id: true },
    })
    expect(prisma.orders.findMany).toHaveBeenCalledTimes(2)
    expect(result.stocks).toEqual(mockStockOrders.map(o => o.stock))
    expect(result.cryptos).toEqual(mockCryptoOrders.map(o => o.crypto))
  })

  it("should throw if the portfolio does not exist", async () => {
    vi.mocked(prisma.portfolio.findFirst).mockResolvedValue(null)

    await expect(service.execute({ user_id: mockUserId, portfolio_id: "nonexistent" }))
      .rejects.toThrow("The portfolio doesn't exists")
    expect(prisma.orders.findMany).not.toHaveBeenCalled()
  })

  it("should throw if the user is not the owner", async () => {
    vi.mocked(prisma.portfolio.findFirst).mockResolvedValue(mockPortfolio)

    await expect(service.execute({ user_id: mockOtherUserId, portfolio_id: mockPortfolioId }))
      .rejects.toThrow("You are not allowed to view this portfolio")
    expect(prisma.orders.findMany).not.toHaveBeenCalled()
  })

  it("should return empty arrays if there are no assets", async () => {
    vi.mocked(prisma.portfolio.findFirst).mockResolvedValue(mockPortfolio)
    vi.mocked(prisma.orders.findMany).mockResolvedValue([])

    const result = await service.execute({ user_id: mockUserId, portfolio_id: mockPortfolioId })
    expect(result.stocks).toEqual([])
    expect(result.cryptos).toEqual([])
  })
})