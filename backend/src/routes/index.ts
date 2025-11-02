import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { userRoutes } from "./user-routes.js";
import { adminRoutes } from "./admin-routes.js";
import { machineRoutes } from "./machine-routes.js";
import { portfolioRoutes } from "./portfolio-routes.js";
import { stocksRoutes } from "./stocks-routes.js";
import { cryptoRoutes } from "./crypto-routes.js";
import { orderRoutes } from "./order-routes.js";
import { NewsPackage } from "../packages/news-package.js";

export async function routes(fastify: FastifyTypedInstance) {
  fastify.get("/", async (req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(200).send({ message: "Accepted" })
  })

  fastify.get("/news", async (req: FastifyRequest, rep: FastifyReply) => {
    return new NewsPackage().fetchNews(rep)
  })

  await userRoutes(fastify)
  await adminRoutes(fastify)
  await machineRoutes(fastify)
  await portfolioRoutes(fastify)
  await stocksRoutes(fastify)
  await cryptoRoutes(fastify)
  await orderRoutes(fastify)
}