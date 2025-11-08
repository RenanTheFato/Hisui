import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListAllUsersService } from "../../../services/admin/list-all-users-service.js";
import { prisma } from "../../../config/prisma.js";

vi.mock("../../../config/prisma.js", () => ({
  prisma: {
    users: {
      findMany: vi.fn(),
    },
  },
}))

describe("ListAllUsersService", () => {
  const listAllUsersService = new ListAllUsersService()

  const expectedUsers = [
    {
      id: "1",
      email: "user1@example.com",
      username: "User A",
      is_verified: true,
      role: "USER",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "2",
      email: "user2@example.com",
      username: "User B",
      is_verified: false,
      role: "ADMIN",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ] as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return the list of all users, omitting sensitive fields and ordered by username", async () => {
    vi.mocked(prisma.users.findMany).mockResolvedValue(expectedUsers)

    const result = await listAllUsersService.execute()

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      orderBy: { username: "asc" },
      omit: {
        password_hash: true,
        verification_token: true,
        verification_token_expires: true,
      },
    })

    expect(result).toEqual(expectedUsers)

    for (const user of result) {
      expect("password_hash" in user).toBe(false)
      expect("verification_token" in user).toBe(false)
      expect("verification_token_expires" in user).toBe(false)
    }
  })

  it("should return an empty array if there are no users", async () => {
    vi.mocked(prisma.users.findMany).mockResolvedValue([])

    const result = await listAllUsersService.execute()

    expect(result).toEqual([])
  })
})