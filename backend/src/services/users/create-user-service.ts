import { prisma } from "../../config/prisma.js";
import { User } from "../../models/user-model.js";
import { generateVerificationToken, getTokenExpiration, sendVerificationEmail } from "../../packages/mail-package.js";

export class CreateUserService{
  async execute({ email, password_hash, username }: Pick<User, 'email' | 'password_hash' | 'username'>){

    const isEmailAlreadyRegister = await prisma.users.findFirst({
      where: {
        email,
      }
    })

    if (isEmailAlreadyRegister) {
      throw new Error("The email is already in use")
    }

    const verificationToken = generateVerificationToken()
    const tokenExpires = getTokenExpiration()

    await prisma.users.create({
      data: {
        email,
        password_hash,
        username,
        verification_token: verificationToken,
        verification_token_expires: tokenExpires,
        is_verified: false
      }
    })

    await sendVerificationEmail(email, username, verificationToken)
  }
}