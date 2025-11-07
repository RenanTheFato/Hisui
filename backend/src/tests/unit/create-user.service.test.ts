import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { CreateUserService } from "../../services/users/create-user-service.js";
import { prisma } from "../../config/prisma.js";
import { Role } from "@prisma/client";
import { generateVerificationToken, getTokenExpiration, sendVerificationEmail } from "../../packages/mail-package.js"

vi.mock("../../config/prisma.js", () => ({
  prisma: {
    users: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("../../packages/mail-package.js", () => ({
  generateVerificationToken: vi.fn(),
  getTokenExpiration: vi.fn(),
  sendVerificationEmail: vi.fn(),
}))

describe("CreateUserService", () => {
  const createUserService = new CreateUserService()

  const mockUserInput = {
    email: "newuser@example.com",
    password_hash: "hashed_password",
    username: "New User",
  }

  const mockToken = "mock-verification-token"
  const mockTokenExpires = new Date(Date.now() + 3600000)

  const mockCreatedUser = {
    id: "1",
    email: mockUserInput.email,
    password_hash: mockUserInput.password_hash,
    username: mockUserInput.username,
    role: Role.USER,
    is_verified: false,
    verification_token: mockToken,
    verification_token_expires: mockTokenExpires,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeAll(() => {
    vi.mocked(generateVerificationToken).mockReturnValue(mockToken)
    vi.mocked(getTokenExpiration).mockReturnValue(mockTokenExpires)
    vi.mocked(sendVerificationEmail).mockResolvedValue(undefined)
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a new user with preferences and send verification email successfully", async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.users.create).mockResolvedValue(mockCreatedUser)

    await createUserService.execute(mockUserInput)

    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      where: { email: mockUserInput.email },
    })
    expect(prisma.users.create).toHaveBeenCalledWith({
      data: {
        email: mockUserInput.email,
        password_hash: mockUserInput.password_hash,
        username: mockUserInput.username,
        verification_token: mockToken,
        verification_token_expires: mockTokenExpires,
        is_verified: false,
        userPreferences: {
          create: {}
        }
      },
    })
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      mockUserInput.email,
      mockUserInput.username,
      mockToken
    )
  })

  it("should throw an error if email is already in use", async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(mockCreatedUser)

    await expect(
      createUserService.execute(mockUserInput)
    ).rejects.toThrow("The email is already in use")

    expect(prisma.users.create).not.toHaveBeenCalled()
    expect(sendVerificationEmail).not.toHaveBeenCalled()
  })
})