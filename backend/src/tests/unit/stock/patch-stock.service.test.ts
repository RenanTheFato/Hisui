import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatchStockService } from "../../../services/stocks/admin/patch-stock-service.js";
import { prisma } from "../../../config/prisma.js";

vi.mock("../../../config/prisma.js", () => ({
  prisma: {
    stocks: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe("PatchStockService", () => {
  const patchStockService = new PatchStockService()
  const mockStockId = "stock-123"

  const mockExistingStock = {
    id: mockStockId,
    name: "Petrobras",
    ticker: "PETR4",
    sector: "Oil & Gas",
    company_name: "Petróleo Brasileiro S.A.",
    country: "Brazil",
    exchange: "B3",
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should update the stock successfully without changing the ticker", async () => {
    vi.mocked(prisma.stocks.findFirst).mockResolvedValue(mockExistingStock)
    vi.mocked(prisma.stocks.update).mockResolvedValue({
      ...mockExistingStock,
      name: "Petrobras S.A.",
    })

    const updateData = { id: mockStockId, name: "Petrobras S.A." }

    await expect(patchStockService.execute(updateData)).resolves.toBeUndefined()

    expect(prisma.stocks.findFirst).toHaveBeenCalledWith({
      where: { id: mockStockId },
    })
    expect(prisma.stocks.findFirst).toHaveBeenCalledTimes(1)
    expect(prisma.stocks.update).toHaveBeenCalledWith({
      where: { id: mockStockId },
      data: { name: "Petrobras S.A." },
    })
  })

  it("should update the stock successfully by changing the ticker to an unused one", async () => {
    vi.mocked(prisma.stocks.findFirst)
      .mockResolvedValueOnce(mockExistingStock) 
      .mockResolvedValueOnce(null) 

    vi.mocked(prisma.stocks.update).mockResolvedValue({
      ...mockExistingStock,
      ticker: "PETR3",
    })

    const updateData = { id: mockStockId, ticker: "PETR3" }

    await expect(patchStockService.execute(updateData)).resolves.toBeUndefined()

    expect(prisma.stocks.findFirst).toHaveBeenCalledWith({
      where: { id: mockStockId },
    })
    expect(prisma.stocks.findFirst).toHaveBeenCalledWith({
      where: { ticker: "PETR3", NOT: { id: mockStockId } },
    })
    expect(prisma.stocks.update).toHaveBeenCalledWith({
      where: { id: mockStockId },
      data: { ticker: "PETR3" },
    })
  })

  it("should throw an error if the stock does not exist", async () => {
    vi.mocked(prisma.stocks.findFirst).mockResolvedValue(null)

    const updateData = { id: "non-existent-id", name: "New Name" }

    await expect(patchStockService.execute(updateData)).rejects.toThrow(
      "The stock doesn't exists"
    )

    expect(prisma.stocks.update).not.toHaveBeenCalled()
  })

  it("should throw an error if the new ticker is already in use by another stock", async () => {
    vi.mocked(prisma.stocks.findFirst)
      .mockResolvedValueOnce(mockExistingStock)
      .mockResolvedValueOnce({ id: "other-stock-id", ticker: "VALE3" } as any)

    const updateData = { id: mockStockId, ticker: "VALE3" }

    await expect(patchStockService.execute(updateData)).rejects.toThrow(
      "The new ticker: VALE3 is already in use"
    )

    expect(prisma.stocks.update).not.toHaveBeenCalled()
  })
})