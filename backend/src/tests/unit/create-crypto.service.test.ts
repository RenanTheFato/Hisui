import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateCryptoService } from "../../services/crypto/admin/create-crypto-service.js";
import { prisma } from "../../config/prisma.js";

vi.mock("../../config/prisma.js", () => ({
  prisma: {
    cryptos: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe("CreateCryptoService", () => {
  const createCryptoService = new CreateCryptoService()
  const mockCryptoData = {
    name: "Bitcoin",
    ticker: "BTC",
    blockchain: "Bitcoin",
    protocol: "PoW",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a new crypto successfully if the ticker does not exist", async () => {
    vi.mocked(prisma.cryptos.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.cryptos.create).mockResolvedValue(mockCryptoData as any)

    await expect(
      createCryptoService.execute(mockCryptoData)
    ).resolves.toBeUndefined()

    expect(prisma.cryptos.findFirst).toHaveBeenCalledWith({
      where: { ticker: mockCryptoData.ticker },
    })
    expect(prisma.cryptos.create).toHaveBeenCalledWith({
      data: mockCryptoData,
    })
  })

  it("should throw an error if the crypto with the ticker already exists", async () => {
    vi.mocked(prisma.cryptos.findFirst).mockResolvedValue({ 
      id: 1, 
      ...mockCryptoData 
    } as any)

    await expect(createCryptoService.execute(mockCryptoData)).rejects.toThrow(
      `The crypto ${mockCryptoData.ticker} has been already registered`
    )
    expect(prisma.cryptos.create).not.toHaveBeenCalled()
  })
})