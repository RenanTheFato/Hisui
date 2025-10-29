import { prisma } from "../../config/prisma.js";
import { Portfolio } from "../../models/portfolio-model.js";

export class CreatePortfolioService {
  async execute({ userId, name, description }: Pick<Portfolio, 'userId' |'name' | 'description'>) {

   return await prisma.portfolio.create({
      data: {
        name,
        description,
        user_id: userId,
      }
    })

  }
}