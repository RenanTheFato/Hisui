import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResetPasswordService } from "../../../services/users/reset-password-service.js";
import { prisma } from "../../../config/prisma.js";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

vi.mock("../../../config/prisma.js", () => ({
  prisma: {
    users: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}))

describe("ResetPasswordService", () => {
  const resetPasswordService = new ResetPasswordService()
  const mockUserId = "1"
  const mockOldPassword = "OldPassword123*"
  const mockNewPassword = "NewPassword456#"
  const mockOldHashedPassword = "hashed_old_password"
  const mockNewHashedPassword = "hashed_new_password"

  const mockUser = {
    id: mockUserId,
    email: "test@example.com",
    username: "testuser",
    password_hash: mockOldHashedPassword,
    role: Role.USER,
    is_verified: true,
    verification_token: null,
    verification_token_expires: null,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should reset password successfully with correct old password", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(mockUser);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(mockNewHashedPassword)
    vi.mocked(prisma.users.update).mockResolvedValue({
      ...mockUser,
      password_hash: mockNewHashedPassword,
    })

    await expect(
      resetPasswordService.execute({
        id: mockUserId,
        old_password: mockOldPassword,
        new_password: mockNewPassword,
      })
    ).resolves.toBeUndefined()

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
    })
    expect(bcrypt.compare).toHaveBeenCalledWith(
      mockOldPassword,
      mockOldHashedPassword
    )
    expect(bcrypt.hash).toHaveBeenCalledWith(mockNewPassword, 10)
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: mockUserId },
      data: { password_hash: mockNewHashedPassword },
    })
  })

  it("should throw an error if user is not found", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null)

    await expect(
      resetPasswordService.execute({
        id: "999",
        old_password: mockOldPassword,
        new_password: mockNewPassword,
      })
    ).rejects.toThrow("User not found")
  })

  it("should throw an error if old password is incorrect", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(mockUser);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false)

    await expect(
      resetPasswordService.execute({
        id: mockUserId,
        old_password: "WrongOldPassword",
        new_password: mockNewPassword,
      })
    ).rejects.toThrow(
      "The entered password and the current password do not match"
    )
  })
})