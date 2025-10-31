import { FastifyReply, FastifyRequest } from "fastify";
import { ViewPortfolioAssetsService } from "../../services/portfolio/view-portfolio-assets-service.js";

export class ViewPortfolioAssetsController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string
    const { portfolioId } = req.params as { portfolioId: string }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    if (!portfolioId) {
      return rep.status(400).send({ error: "The portfolio id is missing" })
    }

    try {
      const viewPortfolioAssetsService = new ViewPortfolioAssetsService()
      const assets = await viewPortfolioAssetsService.execute({ user_id: userId, portfolio_id: portfolioId })

      return rep.status(200).send({ message: "Assets fetched successfully", assets })
    } catch (error: any) {
      switch (error.message) {
        case `The portfolio doesn't exists`:
          return rep.status(404).send({ error: error.message })

        case `You are not allowed to view this portfolio`:
          return rep.status(403).send({ error: error.message })

        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}