import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyEmailService } from '../../../services/users/verify-email-service.js';
import { prisma } from '../../../config/prisma.js';
import { Role } from '@prisma/client';

vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    users: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('VerifyEmailService', () => {
  const verifyEmailService = new VerifyEmailService()
  const validToken = 'valid-token-123'
  const unverifiedUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password_hash: 'hashed_password',
    role: Role.USER,
    is_verified: false,
    verification_token: validToken,
    verification_token_expires: new Date(Date.now() + 3600000),
    created_at: new Date(),
    updated_at: new Date(),
  }
  const verifiedUser = {
    ...unverifiedUser,
    is_verified: true,
    verification_token: null,
    verification_token_expires: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should verify email successfully for a valid token', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(unverifiedUser)
    vi.mocked(prisma.users.update).mockResolvedValue({
      ...unverifiedUser,
      is_verified: true,
      verification_token: null,
      verification_token_expires: null,
    })

    const result = await verifyEmailService.execute({ token: validToken })

    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      where: {
        verification_token: validToken,
        verification_token_expires: {
          gt: expect.any(Date),
        },
      },
    })
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: unverifiedUser.id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_token_expires: null,
      },
    })
    expect(result.message).toBe('Email verified successfully')
    expect(result.user.is_verified).toBe(true)
  })

  it('should throw an error if the token is invalid or expired', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null)

    await expect(verifyEmailService.execute({ token: 'invalid-token' })).rejects.toThrow(
      'Invalid or expired verification token'
    )
    expect(prisma.users.update).not.toHaveBeenCalled()
  })

  it('should throw an error if the email is already verified', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(verifiedUser)

    await expect(verifyEmailService.execute({ token: 'verified-token-789' })).rejects.toThrow(
      'Email already verified'
    )
    expect(prisma.users.update).not.toHaveBeenCalled()
  })
})