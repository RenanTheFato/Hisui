import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { checkAdmin } from "../middlewares/admin-middleware.js";
import { CreateCryptoController } from "../controllers/crypto/admin/create-crypto-controller.js";
import { SearchCryptoController } from "../controllers/crypto/search-crypto-controller.js";

export async function cryptoRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/crypto/create", { preHandler: [authentication, checkAdmin] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateCryptoController().handle(req, rep)
  })

  fastify.get("/crypto/search", { preHandler: [authentication] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new SearchCryptoController().handle(req, rep)
  })

}