import { compare } from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import { User } from "../../models/user-model.js";

export class AuthUserService{
  async execute({ email, password_hash }: Pick<User, 'email' | 'password_hash'>){
    
    const isUserExists = await prisma.users.findFirst({
      where: {
        email,
      },
    })

    if (!isUserExists) {
      throw new Error("Invalid email or password")
    }

    const checkPassword = await compare(password_hash, isUserExists.password_hash)

    if (!checkPassword) {
      throw new Error("Invalid email or password")
    }

    const token = jwt.sign({ id: isUserExists.id }, String(process.env.JWT_SECRET), { expiresIn: '6h' })

    return token
  }
}