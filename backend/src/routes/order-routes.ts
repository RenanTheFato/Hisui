import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { CreateOrderController } from "../controllers/orders/create-order-controller.js";
import { ListOrdersController } from "../controllers/orders/list-orders-controller.js";

export async function orderRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/order/create/:portfolioId", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateOrderController().handle(req, rep)
  }
)
  fastify.get("/order/list", { preHandler: [authentication]}, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListOrdersController().handle(req, rep)
  })
}