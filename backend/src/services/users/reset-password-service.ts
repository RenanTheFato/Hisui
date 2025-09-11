import { User } from "../../@types/interfaces/user-interface.js";
import { prisma } from "../../config/prisma.js";
import bcrypt from "bcryptjs";

interface ResetPasswordProps{
  old_password: string,
  new_password: string,
}

export class ResetPasswordService{
  async execute({ id, old_password, new_password }: Pick<User, 'id'> & ResetPasswordProps){

    const usersExists = await prisma.users.findUnique({
      where: {
        id,
      }
    })

    if (!usersExists) {
      throw new Error("User not found")
    }

    const isPasswordCorrect = await bcrypt.compare(old_password, usersExists.password_hash)

    if (!isPasswordCorrect) {
      throw new Error("The entered password and the current password do not match")
    }

    const new_password_hash = await bcrypt.hash(new_password, 10)

    await prisma.users.update({
      where: {
        id,
      },
      data: {
        password_hash: new_password_hash
      }
    })

  }
}