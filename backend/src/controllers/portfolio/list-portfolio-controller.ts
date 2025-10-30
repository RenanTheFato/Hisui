import { FastifyReply, FastifyRequest } from "fastify";
import { ListPortfolioService } from "../../services/portfolio/list-portfolio-service.js";

export class ListPortfolioController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const userId = req.user.id as string
    const { name } = req.query as { name?: string }

    try {
      const listPortfolioService = new ListPortfolioService()
      const portfolios = await listPortfolioService.execute({ name, userId })

      return rep.status(200).send({ message: "portfolio(s) fetched successfully", portfolios })
    } catch (error: any) {
      switch (error.message) {
        case `You don't have a portfolio`:
          return rep.status(404).send({ error: error.message })

        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}