import { FastifyReply, FastifyRequest } from "fastify";
import { userRoutes } from "./user-routes.js";
import { FastifyTypedInstance } from "../@types/fastify-types.js";

import { adminRoutes } from "./admin-routes.js";
import { GetResponsePetr4 } from "../controllers/machine/petr4/get-response-petr4.js";

export async function routes(fastify: FastifyTypedInstance) {
  fastify.get("/", async (req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(200).send({ message: "Accepted" })
  })

  fastify.get("/machine", async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetResponsePetr4().handle(req, rep)
  })

  await userRoutes(fastify)
  await adminRoutes(fastify)
}