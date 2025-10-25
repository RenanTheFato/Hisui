import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { CreatePortfolioController } from "../controllers/portfolio/create-portfolio-controller.js";

export async function portfolioRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/portfolio/create", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreatePortfolioController().handle(req, rep)
  })
}