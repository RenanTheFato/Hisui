import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { SearchNewsController } from "../controllers/news/search-news-controller.js";
import { searchNewsSchema } from "../swagger/schemas/news/search-news-schema.js";
import { checkAdmin } from "../middlewares/admin-middleware.js";
import { DeleteNewsController } from "../controllers/news/admin/delete-news-controller.js";
import { deleteNewsSchema } from "../swagger/schemas/news/admin/delete-news-schema.js";

export async function newsRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/news/search", { preHandler: [authentication], schema: searchNewsSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new SearchNewsController().handle(req, rep)
  })

  fastify.delete("/news/delete/:newsId", { preHandler: [authentication, checkAdmin], schema: deleteNewsSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new DeleteNewsController().handle(req, rep)
  })
}