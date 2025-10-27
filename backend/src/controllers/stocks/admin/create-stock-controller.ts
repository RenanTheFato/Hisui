import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { CreateStockService } from "../../../services/stocks/admin/create-stock-service.js";

export class CreateStockController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const stockValidate = z.object({
      name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The stock name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The stock name exceeds the maximum number of characters (256)." }),

      ticker: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The stock ticker doesn't meet the minimum number of characters (2)." })
        .max(24, { error: "The stock ticker exceeds the maximum number of characters (24)." })
        .uppercase({ error: "The stock ticker must be only in uppercase" }),

      sector: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The stock sector doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The stock sector exceeds the maximum number of characters (256)." }),

      company_name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The company name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The company name exceeds the maximum number of characters (256)." }),

      country: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The country acronym doesn't meet the minimum number of characters (2)." })
        .max(6, { error: "The country acronym exceeds the maximum number of characters (6)." }),

      exchange: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The exchange name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The exchange name exceeds the maximum number of characters (256)." }),
    })

    try {
      stockValidate.parse(req.body)
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

    const { name, ticker, sector, company_name, country, exchange } = req.body as z.infer<typeof stockValidate>

    try {
      const createStockService = new CreateStockService()
      await createStockService.execute({ name, ticker, sector, company_name, country, exchange })

      return rep.status(201).send({ message: "Stock created successfully" })
    } catch (error: any) {
      switch (error.message) {
        case `The stock ${ticker} has been already registered`:
          return rep.status(400).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}