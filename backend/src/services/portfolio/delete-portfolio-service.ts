import { prisma } from "../../config/prisma.js";
import { Portfolio } from "../../models/portfolio-model.js";

export class DeletePortfolioService {
  async execute({ id: portfolioId, userId }: Pick<Portfolio, 'id' | 'userId'>) {

    const userIsOwnerOfPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        user_id: userId
      },
      select: {
        id: true,
        user_id: true
      }
    })

    if (userIsOwnerOfPortfolio === null) {
      throw new Error("Portfolio not found")
    }

    if (!userIsOwnerOfPortfolio) {
      throw new Error("You are not allowed to delete this portfolio")
    }

    await prisma.portfolio.delete({
      where: userIsOwnerOfPortfolio
    })
  }
}