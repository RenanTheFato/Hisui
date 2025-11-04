import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteOrderService } from "../../services/orders/delete-order-service.js";
import { prisma } from "../../config/prisma.js";

vi.mock("../../config/prisma.js", () => ({
  prisma: {
    orders: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe("DeleteOrderService", () => {
  const deleteOrderService = new DeleteOrderService()
  const mockUserId = "user-123"
  const mockOtherUserId = "user-456"
  const mockOrderId = "order-789"

  const mockOrder: any = {
    id: mockOrderId,
    user_id: mockUserId,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should delete the order successfully if the user is the owner", async () => {
    vi.mocked(prisma.orders.findFirst).mockResolvedValue(mockOrder)
    vi.mocked(prisma.orders.delete).mockResolvedValue(mockOrder)

    await expect(
      deleteOrderService.execute({ user_id: mockUserId, id: mockOrderId })
    ).resolves.toBeUndefined()

    expect(prisma.orders.findFirst).toHaveBeenCalledWith({
      where: {
        id: mockOrderId,
        user_id: mockUserId,
      },
      select: {
        id: true,
        user_id: true,
      },
    })
    expect(prisma.orders.delete).toHaveBeenCalledWith({
      where: mockOrder,
    })
  })

  it("should throw an error if the order is not found", async () => {
    vi.mocked(prisma.orders.findFirst).mockResolvedValue(null)

    await expect(
      deleteOrderService.execute({ user_id: mockUserId, id: "non-existent-id" })
    ).rejects.toThrow("Order not found")
    expect(prisma.orders.delete).not.toHaveBeenCalled()
  })

  it('should throw "Order not found" if the order exists but does not belong to the user', async () => {
    vi.mocked(prisma.orders.findFirst).mockResolvedValue(null)

    await expect(
      deleteOrderService.execute({ user_id: mockOtherUserId, id: mockOrderId })
    ).rejects.toThrow("Order not found")
    expect(prisma.orders.delete).not.toHaveBeenCalled()
  })
})