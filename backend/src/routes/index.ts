import { FastifyReply, FastifyRequest } from "fastify";
import { userRoutes } from "./user-routes.js";
import { FastifyTypedInstance } from "../@types/fastify-types.js";

import { adminRoutes } from "./admin-routes.js";

export async function routes(fastify: FastifyTypedInstance) {
  fastify.get("/", async (req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(200).send({ message: "Accepted" })
  })

  await userRoutes(fastify)
  await adminRoutes(fastify)
}