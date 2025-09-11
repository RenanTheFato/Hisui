import { prisma } from "../../config/prisma.js";

export class VerifyEmailService {
  async execute({ token }: { token: string }) {
    const user = await prisma.users.findFirst({
      where: {
        verification_token: token,
        verification_token_expires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    if (user.is_verified) {
      throw new Error("Email already verified");
    }

    await prisma.users.update({
      where: {
        id: user.id
      },
      data: {
        is_verified: true,
        verification_token: null,
        verification_token_expires: null
      }
    })

    return {
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_verified: true
      }
    }
  }
}