import { prisma } from "../../config/prisma.js";
import { User } from "../../@types/interfaces/user-interface.js";

export class DeleteUserService {
  async execute({ id }: Pick<User, 'id'>) {

    const userExists = await prisma.users.findUnique({
      where: {
        id
      }
    })

    if (!userExists) {
      throw new Error("The user not exists")
    }
    await prisma.users.delete({
      where: {
        id,
      },
    })
  }
}