import { FastifyReply, FastifyRequest } from "fastify";
import { DeleteNewsService } from "../../../services/news/admin/delete-news-service.js";

export class DeleteNewsController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string
    const { newsId } = req.params as { newsId: string }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    if (!newsId) {
      return rep.status(400).send({ error: "The news id is missing" })
    }

    try {
      const deleteNewsService = new DeleteNewsService()
      await deleteNewsService.execute({ id: newsId })

      return rep.status(204).send({})
    } catch (error: any) {
      switch (error.message) {
        case "News not found":
          return rep.status(404).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}