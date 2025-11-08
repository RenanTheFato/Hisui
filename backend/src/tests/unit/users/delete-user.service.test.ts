import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteUserService } from "../../../services/users/delete-user-service.js";
import { prisma } from "../../../config/prisma.js";

vi.mock("../../../config/prisma.js", () => ({
  prisma: {
    users: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe("DeleteUserService", () => {
  const deleteUserService = new DeleteUserService()
  const mockUserId = "1"

  const mockUser =  {
    id: mockUserId,
    email: "test@example.com",
    username: "testuser",
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should delete user successfully if it exists", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(mockUser)
    vi.mocked(prisma.users.delete).mockResolvedValue(mockUser)

    await expect(deleteUserService.execute({ id: mockUserId })).resolves.toBeUndefined()

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
    })
    expect(prisma.users.delete).toHaveBeenCalledWith({
      where: { id: mockUserId },
    })
  })

  it("should throw an error if user does not exist", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null)

    await expect(deleteUserService.execute({ id: "999" })).rejects.toThrow(
      "The user not exists"
    )

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: "999" },
    })
    expect(prisma.users.delete).not.toHaveBeenCalled()
  })
})
