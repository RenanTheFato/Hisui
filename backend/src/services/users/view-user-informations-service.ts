import { prisma } from "../../config/prisma.js";
import { User } from "../../models/user-model.js";

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