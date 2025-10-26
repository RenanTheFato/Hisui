import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { CreateAssetController } from "../controllers/assets/create-asset-controller.js";
import { SearchAssetController } from "../controllers/assets/search-asset-controller.js";

export async function assetsRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/assets/create", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateAssetController().handle(req, rep)
  })

  fastify.get("/assets/search", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new SearchAssetController().handle(req, rep)
  })
}