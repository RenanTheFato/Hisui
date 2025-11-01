import { FastifyReply, FastifyRequest } from "fastify";
import { DeleteOrderService } from "../../services/orders/delete-order-service.js";

export class DeleteOrderController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string
    const { orderId } = req.params as { orderId: string }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    if (!orderId) {
      return rep.status(400).send({ error: "The order id is missing" })
    }

    try {
      const deleteOrderService = new DeleteOrderService()
      await deleteOrderService.execute({ user_id: userId, id: orderId })

      return rep.status(204).send({})
    } catch (error: any) {
      switch (error.message) {
        case `Order not found`:
          return rep.status(404).send({ error: error.message })
        case `You are not allowed to delete this order`:
          return rep.status(403).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }

  }
}