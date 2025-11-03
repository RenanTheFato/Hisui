import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { SearchNewsController } from "../controllers/news/search-news-controller.js";

export async function newsRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/news/search", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new SearchNewsController().handle(req, rep)
  })
}