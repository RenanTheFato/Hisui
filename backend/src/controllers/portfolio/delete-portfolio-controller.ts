import { FastifyReply, FastifyRequest } from "fastify";
import { DeletePortfolioService } from "../../services/portfolio/delete-portfolio-service.js";

export class DeletePortfolioController {
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
      const deletePortfolioService = new DeletePortfolioService()
      await deletePortfolioService.execute({ id: portfolioId, userId })

      return rep.status(204).send({})
    } catch (error: any) {
      switch (error.message) {
        case `Portfolio not found`:
          return rep.status(404).send({ error: error.message })
        case `You are not allowed to delete this portfolio`:
          return rep.status(403).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }

  }
}