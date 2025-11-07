import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { checkAdmin } from "../middlewares/admin-middleware.js";
import { CreateCryptoController } from "../controllers/crypto/admin/create-crypto-controller.js";
import { SearchCryptoController } from "../controllers/crypto/search-crypto-controller.js";
import { PatchCryptoController } from "../controllers/crypto/admin/patch-crypto-controller.js";
import { createCryptoSchema } from "../swagger/schemas/crypto/admin/create-crypto-schema.js";
import { patchCryptoSchema } from "../swagger/schemas/crypto/admin/patch-crypto-schema.js";
import { searchCryptoSchema } from "../swagger/schemas/crypto/search-crypto-schema.js";

export async function cryptoRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/crypto/create", { preHandler: [authentication, checkAdmin], schema: createCryptoSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateCryptoController().handle(req, rep)
  })

  fastify.get("/crypto/search", { preHandler: [authentication], schema: searchCryptoSchema}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new SearchCryptoController().handle(req, rep)
  })

  fastify.patch("/crypto/patch/:id", { preHandler: [authentication, checkAdmin], schema: patchCryptoSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new PatchCryptoController().handle(req, rep)
  })
}