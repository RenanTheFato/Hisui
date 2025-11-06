import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatchCryptoService } from "../../services/crypto/admin/patch-crypto-service.js";
import { prisma } from "../../config/prisma.js";

vi.mock("../../config/prisma.js", () => ({
  prisma: {
    cryptos: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe("PatchCryptoService", () => {
  const patchCryptoService = new PatchCryptoService()
  const mockCryptoId = "crypto-123"

  const mockExistingCrypto = {
    id: mockCryptoId,
    name: "Bitcoin",
    ticker: "BTC",
    blockchain: "Bitcoin",
    protocol: "PoW",
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should update the crypto successfully without changing the ticker", async () => {
    vi.mocked(prisma.cryptos.findFirst).mockResolvedValue(mockExistingCrypto)
    vi.mocked(prisma.cryptos.update).mockResolvedValue({
      ...mockExistingCrypto,
      name: "Bitcoin Core",
    })

    const updateData = { id: mockCryptoId, name: "Bitcoin Core" }

    await expect(patchCryptoService.execute(updateData)).resolves.toBeUndefined()

    expect(prisma.cryptos.findFirst).toHaveBeenCalledWith({
      where: { id: mockCryptoId },
    })
    expect(prisma.cryptos.findFirst).toHaveBeenCalledTimes(1)
    expect(prisma.cryptos.update).toHaveBeenCalledWith({
      where: { id: mockCryptoId },
      data: { name: "Bitcoin Core" },
    })
  })

  it("should update the crypto successfully by changing the ticker to an unused one", async () => {
    vi.mocked(prisma.cryptos.findFirst)
      .mockResolvedValueOnce(mockExistingCrypto)
      .mockResolvedValueOnce(null)

    vi.mocked(prisma.cryptos.update).mockResolvedValue({
      ...mockExistingCrypto,
      ticker: "XBT",
    })

    const updateData = { id: mockCryptoId, ticker: "XBT" }

    await expect(patchCryptoService.execute(updateData)).resolves.toBeUndefined()

    expect(prisma.cryptos.findFirst).toHaveBeenCalledWith({
      where: { id: mockCryptoId },
    })
    expect(prisma.cryptos.findFirst).toHaveBeenCalledWith({
      where: { ticker: "XBT", NOT: { id: mockCryptoId } },
    })
    expect(prisma.cryptos.update).toHaveBeenCalledWith({
      where: { id: mockCryptoId },
      data: { ticker: "XBT" },
    })
  })

  it("should throw an error if the crypto does not exist", async () => {
    vi.mocked(prisma.cryptos.findFirst).mockResolvedValue(null)

    const updateData = { id: "non-existent-id", name: "New Name" }

    await expect(patchCryptoService.execute(updateData)).rejects.toThrow(
      "The crypto doesn't exists"
    )

    expect(prisma.cryptos.update).not.toHaveBeenCalled()
  })

  it("should throw an error if the new ticker is already in use by another crypto", async () => {
    vi.mocked(prisma.cryptos.findFirst)
      .mockResolvedValueOnce(mockExistingCrypto)
      .mockResolvedValueOnce({ id: "other-crypto-id", ticker: "ETH" } as any)

    const updateData = { id: mockCryptoId, ticker: "ETH" }

    await expect(patchCryptoService.execute(updateData)).rejects.toThrow(
      "The new ticker: ETH is already in use"
    )

    expect(prisma.cryptos.update).not.toHaveBeenCalled()
  })
})
