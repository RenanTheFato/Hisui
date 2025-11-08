import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewUserInformationService } from "../../../services/users/view-user-informations-service.js";
import { prisma } from "../../../config/prisma.js";
import { Role } from "@prisma/client";

vi.mock("../../../config/prisma.js", () => ({
  prisma: {
    users: {
      findUnique: vi.fn(),
    },
  },
}))

describe("ViewUserInformationService", () => {
  const viewUserInformationService = new ViewUserInformationService()
  const mockUserId = "1"
  
  const fullUser = {
    id: mockUserId,
    email: "test@example.com",
    username: "testuser",
    password_hash: "hashed_password",
    role: Role.USER,
    is_verified: true,
    verification_token: null,
    verification_token_expires: null,
    created_at: new Date(),
    updated_at: new Date(),
  }

  const expectedUser = {
    id: mockUserId,
    email: "test@example.com",
    username: "testuser",
    role: Role.USER,
    is_verified: true,
    created_at: fullUser.created_at,
    updated_at: fullUser.updated_at,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return user information, omitting sensitive fields", async () => {

    vi.mocked(prisma.users.findUnique).mockResolvedValue(expectedUser as any)

    const result = await viewUserInformationService.execute({ id: mockUserId })

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      omit: {
        password_hash: true,
        verification_token: true,
        verification_token_expires: true,
      },
    })
    expect(result).toEqual(expectedUser)
    expect(result).not.toHaveProperty("password_hash")
    expect(result).not.toHaveProperty("verification_token")
    expect(result).not.toHaveProperty("verification_token_expires")
  })

  it("should throw an error if user does not exist", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null)

    await expect(
      viewUserInformationService.execute({ id: "999" })
    ).rejects.toThrow("The user not exists")
  })
})