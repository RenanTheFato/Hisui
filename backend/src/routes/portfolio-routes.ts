import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { CreatePortfolioController } from "../controllers/portfolio/create-portfolio-controller.js";
import { ListPortfolioController } from "../controllers/portfolio/list-portfolio-controller.js";
import { ViewPortfolioAssetsController } from "../controllers/portfolio/view-portfolio-assets-controller.js";

export async function portfolioRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/portfolio/create", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreatePortfolioController().handle(req, rep)
  })

  fastify.get("/portfolio/list", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListPortfolioController().handle(req, rep)
  })

  fastify.get("/portfolio/assets/:portfolioId", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ViewPortfolioAssetsController().handle(req, rep)
  })
}