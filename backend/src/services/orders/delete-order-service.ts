import { prisma } from "../../config/prisma.js";
import { Order } from "../../models/order-model.js";

export class DeleteOrderService {
  async execute({ user_id: userId, id: orderId }: Pick<Order, 'user_id' | 'id'>) {

    const userMakeTheOrder = await prisma.orders.findFirst({
      where: {
        id: orderId,
        user_id: userId
      },
      select: {
        id: true,
        user_id: true
      }
    })

    if (userMakeTheOrder === null) {
      throw new Error("Order not found")
    }

    if (!userMakeTheOrder) {
      throw new Error("You are not allowed to delete this order")
    }

    await prisma.orders.delete({
      where: userMakeTheOrder
    })
  }
}