import { prisma } from "../../config/prisma.js";
import { Portfolio } from "../../models/portfolio-model.js";

export class PatchPortfolioService {
  async execute({ id: portfolioId, userId, name, description }: Partial<Pick<Portfolio, 'id' | 'userId' | 'name' | 'description'>>) {

    const isPortfolioExists = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
      },
      select: {
        id: true,
        user_id: true,
      }
    })

    if (!isPortfolioExists) {
      throw new Error(`The portfolio doesn't exists`)
    }

    if (isPortfolioExists.user_id !== userId) {
      throw new Error(`You are not allowed to modify this portfolio`)
    }

    await prisma.portfolio.update({
      data: {
        name,
        description,
      },
      where: {
        id: isPortfolioExists.id
      }
    })
  }
}