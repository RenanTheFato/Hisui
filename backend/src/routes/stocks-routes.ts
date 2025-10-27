import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { CreateStockController } from "../controllers/stocks/admin/create-stock-controller.js";
import { SearchStockController } from "../controllers/stocks/search-stock-controller.js";
import { checkAdmin } from "../middlewares/admin-middleware.js";
import { PatchStockController } from "../controllers/stocks/admin/patch-stock-controller.js";

export async function stocksRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/stocks/create", { preHandler: [authentication, checkAdmin]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateStockController().handle(req, rep)
  })

  fastify.get("/stocks/search", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new SearchStockController().handle(req, rep)
  })

  fastify.patch("/stocks/patch/:id", { preHandler: [authentication, checkAdmin]}, async(req: FastifyRequest, rep: FastifyReply) => {
    return new PatchStockController().handle(req, rep)
  })
}