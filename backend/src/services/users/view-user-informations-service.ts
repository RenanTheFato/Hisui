import { User } from "../../@types/interfaces/user-interface.js";
import { prisma } from "../../config/prisma.js";

export class ViewUserInformationService{
  async execute({ id }: Pick<User, 'id'>){
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
      omit: {
        password_hash: true,
        verification_token: true,
        verification_token_expires: true,
      }
    })

    if (!user) {
      throw new Error("The user not exists")
    }

    return user
  }
}