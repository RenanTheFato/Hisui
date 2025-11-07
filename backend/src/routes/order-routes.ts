import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { CreateOrderController } from "../controllers/orders/create-order-controller.js";
import { ListOrdersController } from "../controllers/orders/list-orders-controller.js";
import { DeleteOrderController } from "../controllers/orders/delete-order-controller.js";
import { createOrderSchema } from "../swagger/schemas/orders/create-order-schema.js";
import { listOrdersSchema } from "../swagger/schemas/orders/list-orders-schema.js";
import { deleteOrderSchema } from "../swagger/schemas/orders/delete-order-schema.js";

export async function orderRoutes(fastify: FastifyTypedInstance) {

  fastify.post("/order/create/:portfolioId", { preHandler: [authentication], schema: createOrderSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateOrderController().handle(req, rep)
  }
  )
  fastify.get("/order/list", { preHandler: [authentication], schema: listOrdersSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListOrdersController().handle(req, rep)
  })

  fastify.delete("/order/delete/:orderId", { preHandler: [authentication], schema: deleteOrderSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new DeleteOrderController().handle(req, rep)
  })
}