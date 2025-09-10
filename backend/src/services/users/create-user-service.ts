import { User } from "../../@types/interfaces/user-interface.js";
import { prisma } from "../../config/prisma.js";

export class CreateUserService{
  async execute({ email, password, username }: Pick<User, 'email' | 'password' | 'username'>){

    const isEmailAlreadyRegister = await prisma.users.findFirst({
      where: {
        email,
      }
    })

    if (isEmailAlreadyRegister) {
      throw new Error("The email is already in use")
    }

    await prisma.users.create({
      data: {
        email,
        password_hash: password,
        username,
      }
    })
  }
}