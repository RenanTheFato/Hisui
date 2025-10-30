import { Action, AssetType } from "@prisma/client";
import dayjs from "dayjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { CreateOrderService } from "../../services/orders/create-order-service.js";

export class CreateOrderController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string
    const { portfolioId } = req.params as { portfolioId: string }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    if (!portfolioId) {
      return rep.status(400).send({ error: "The portfolio id is missing" })
    }

    const assetTypes = Object.values(AssetType)
    const actionOptions = Object.values(Action)

    const orderValidate = z.object({
      ticker: z.string({ error: "The value has entered isn't an string." })
        .nonempty({ message: "The ticker cannot be empty" }),

      type: z.enum(assetTypes as [AssetType, ...AssetType[]], { error: `The type must be one of the followings ${assetTypes.join(", ")}` }),

      action: z.enum(actionOptions as [Action, ...Action[]], { error: `The type must be one of the followings ${actionOptions.join(", ")}` }),

      order_price: z.number({ error: "The value has entered isn't an number" })
        .positive({ error: "Order price must be positive" }),

      order_currency: z.string({ error: "The value has entered isn't an string" })
        .min(1, { error: "The order currency doesn't meet the minimum number of characters (1)." })
        .nonempty({ message: "The order_currency name cannot be empty" })
        .toUpperCase(),

      amount: z.number({ error: "The amount has entered isn't an number" })
        .positive({ error: "The order amount must be positive" }),

      order_execution_date: z.string({ message: "Invalid date format" })
        .refine((val) => dayjs(val, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true)
        .isValid(),{ message: "The order execution date must be in format YYYY/MM/DD HH:mm or YYYY/MM/DD" }),

      tax_amount: z.number({ error: "The value has entered isn't an number" })
        .positive({ message: "Tax amount must be positive" })
        .optional()
        .nullable(),

      fees: z.number({ error: "The value has entered isn't an number" })
        .positive({ message: "Fees must be positive" })
        .optional()
        .nullable(),
    })

    try {
      orderValidate.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/"),
        }))

        return rep.status(400).send({ message: "Validation Error Ocurred", errors })
      }
    }

    const { ticker, type, action, order_price, order_currency, amount, order_execution_date, fees, tax_amount } = req.body as z.infer<typeof orderValidate>
    const orderExecutionDate = dayjs(order_execution_date, "YYYY/MM/DD HH:mm").toDate()

    try {
      const createOrderService = new CreateOrderService()
      const order = await createOrderService.execute({ portfolioId, userId, ticker, type, action, order_price, order_currency, amount, order_execution_date: orderExecutionDate, fees, tax_amount })

      return rep.status(201).send({ message: "Order created successfully", order })
    } catch (error: any) {
      switch (error.message) {
        case `The portfolio doesn't exists`:
          return rep.status(404).send({ error: error.message })

        case `You are not allowed to modify this portfolio`:
          return rep.status(403).send({ error: error.message })

        case `The stock ${ticker} doesn't exist in the database`:
          return rep.status(404).send({ error: error.message })

        case `The crypto ${ticker} doesn't exist in the database`:
          return rep.status(404).send({ error: error.message })

        case `You don't own ${ticker} in this portfolio to can be sell it`:
          return rep.status(400).send({ error: error.message })

        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}