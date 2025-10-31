import { Action, AssetType } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { ListOrdersService } from "../../services/orders/list-orders-service.js";

export class ListOrdersController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const assetTypes = Object.values(AssetType)
    const actionOptions = Object.values(Action)

    const listOrdersValidate = z.object({
      ticker: z.string({ message: "The value entered isn't a string." }).optional(),

      type: z.enum(assetTypes as [AssetType, ...AssetType[]], { error: `The type must be one of the followings ${assetTypes.join(", ")}` })
        .optional(),

      action: z.enum(actionOptions as [Action, ...Action[]], { error: `The type must be one of the followings ${actionOptions.join(", ")}` })
        .optional(),

      order_price: z.number({ message: "The value entered isn't a number." }).optional(),

      order_currency: z.string({ message: "The value entered isn't a string." }).optional(),

      amount: z.number({ message: "The value entered isn't a number." }).optional(),

      portfolio_id: z.string({ message: "The value entered isn't a string." }).optional(),

      page: z.coerce.number({ message: "The page must be a number." })
        .min(1, { message: "The page must be at least 1." })
        .default(1),

      limit: z.coerce.number({ message: "The limit must be a number." })
        .min(1, { message: "The limit must be at least 1." })
        .max(100, { message: "The limit cannot exceed 100." })
        .default(20),
    })

    let queryParams = req.query as z.infer<typeof listOrdersValidate>

    try {
      queryParams = listOrdersValidate.parse(req.query)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/"),
        }))

        return rep.status(400).send({ message: "Validation Error Occurred", errors })
      }
    }

    try {
      const listOrdersService = new ListOrdersService()
      const result = await listOrdersService.execute(queryParams, { user_id: userId })

      return rep.status(200).send(result)
    } catch (error: any) {
      switch (error.message) {
        case "No orders found with the provided filters":
          return rep.status(404).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}