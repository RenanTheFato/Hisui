import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { CreatePortfolioController } from "../controllers/portfolio/create-portfolio-controller.js";
import { ListPortfolioController } from "../controllers/portfolio/list-portfolio-controller.js";
import { ViewPortfolioAssetsController } from "../controllers/portfolio/view-portfolio-assets-controller.js";
import { createPortfolioSchema } from "../swagger/schemas/portfolio/create-portfolio-schema.js";
import { listPortfolioSchema } from "../swagger/schemas/portfolio/list-portfolio-schema.js";
import { viewPortfolioAssetsSchema } from "../swagger/schemas/portfolio/view-portfolio-assets-schema.js";
import { PatchPortfolioController } from "../controllers/portfolio/patch-portfolio-controller.js";
import { DeletePortfolioController } from "../controllers/portfolio/delete-portfolio-controller.js";
import { patchPortfolioSchema } from "../swagger/schemas/portfolio/patch-portfolio-schema.js";
import { deletePortfolioSchema } from "../swagger/schemas/portfolio/delete-portfolio-schema.js";

export async function portfolioRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/portfolio/create", { preHandler: [authentication], schema: createPortfolioSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreatePortfolioController().handle(req, rep)
  })

  fastify.get("/portfolio/list", { preHandler: [authentication], schema: listPortfolioSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListPortfolioController().handle(req, rep)
  })

  fastify.get("/portfolio/assets/:portfolioId", { preHandler: [authentication], schema: viewPortfolioAssetsSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ViewPortfolioAssetsController().handle(req, rep)
  })

  fastify.patch("/portfolio/patch/:portfolioId", { preHandler: [authentication], schema: patchPortfolioSchema}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new PatchPortfolioController().handle(req, rep)
  })

  fastify.delete("/portfolio/delete/:portfolioId", { preHandler: [authentication], schema: deletePortfolioSchema}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new DeletePortfolioController().handle(req, rep)
  })
}