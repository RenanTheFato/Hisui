import { prisma } from "../../config/prisma.js";

export class ListAllUsersService{
  async execute(){
    const result = await prisma.users.findMany({
      orderBy: {
        username: 'asc'
      },
      omit: {
        password_hash: true,
        verification_token: true,
        verification_token_expires: true,
      }
    })

    return result
  }

}