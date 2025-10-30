import { prisma } from "../../config/prisma.js";
import { Portfolio } from "../../models/portfolio-model.js";

export class ListPortfolioService {
  async execute({ name, userId }: { name?: string} & Pick<Portfolio, 'userId'>) {

    const portfolio = await prisma.portfolio.findMany({
      where: {
        user_id: userId,
        ...(name?.trim() && {
          name: {
            contains: name.trim(),
            mode: 'insensitive'
          }
        })
      },
      orderBy: {
        name: 'asc'
      }
    })

    if (portfolio.length === 0) {
      throw new Error("You don't have a portfolio")
    }

    return portfolio

  }
}