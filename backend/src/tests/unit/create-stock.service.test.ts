import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateStockService } from "../../services/stocks/admin/create-stock-service.js";
import { prisma } from "../../config/prisma.js";

vi.mock("../../config/prisma.js", () => ({
  prisma: {
    stocks: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe("CreateStockService", () => {
  const createStockService = new CreateStockService()

  const mockStockData = {
    id: "1",
    name: "Petrobras",
    ticker: "PETR4",
    sector: "Oil & Gas",
    company_name: "Petróleo Brasileiro S.A.",
    country: "Brazil",
    exchange: "B3",
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a new stock successfully if the ticker does not exist", async () => {
    vi.mocked(prisma.stocks.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.stocks.create).mockResolvedValue(mockStockData)

    await expect(
      createStockService.execute(mockStockData)
    ).resolves.toBeUndefined()

    expect(prisma.stocks.findFirst).toHaveBeenCalledWith({
      where: { ticker: mockStockData.ticker },
    })

    expect(prisma.stocks.create).toHaveBeenCalledWith({
      data: {
        name: mockStockData.name,
        ticker: mockStockData.ticker,
        sector: mockStockData.sector,
        company_name: mockStockData.company_name,
        country: mockStockData.country,
        exchange: mockStockData.exchange,
      },
    })
  })

  it("should throw an error if the stock with the ticker already exists", async () => {
    vi.mocked(prisma.stocks.findFirst).mockResolvedValue(mockStockData)

    await expect(createStockService.execute(mockStockData)).rejects.toThrow(
      `The stock ${mockStockData.ticker} has been already registered`
    )
    expect(prisma.stocks.create).not.toHaveBeenCalled()
  })
})