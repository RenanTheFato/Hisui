import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { PatchStockService } from "../../../services/stocks/admin/patch-stock-service.js";
import { Stock } from "../../../models/stock-model.js";

export class PatchStockController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string
    const { id } = req.params as Pick<Stock, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The stock id is missing" })
    }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const stockValidate = z.object({
      name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The stock name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The stock name exceeds the maximum number of characters (256)." })
        .nonempty({ message: "The stock name cannot be empty" })
        .optional(),

      ticker: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The stock ticker doesn't meet the minimum number of characters (2)." })
        .max(24, { error: "The stock ticker exceeds the maximum number of characters (24)." })
        .uppercase({ error: "The stock ticker must be only in uppercase" })
        .nonempty({ message: "The stock ticker cannot be empty" })
        .optional(),

      sector: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The stock sector doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The stock sector exceeds the maximum number of characters (256)." })
        .nonempty({ message: "The stock sector cannot be empty" })
        .optional(),

      company_name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The company name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The company name exceeds the maximum number of characters (256)." })
        .nonempty({ message: "The company name cannot be empty" })
        .optional(),

      country: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The country acronym doesn't meet the minimum number of characters (2)." })
        .max(6, { error: "The country acronym exceeds the maximum number of characters (6)." })
        .nonempty({ message: "The country cannot be empty" })
        .optional(),

      exchange: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The exchange name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The exchange name exceeds the maximum number of characters (256)." })
        .nonempty({ message: "The exchange cannot be empty" })
        .optional(),
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
      const patchStockService = new PatchStockService()
      await patchStockService.execute({ id, name, ticker, sector, company_name, country, exchange })

      return rep.status(200).send({ message: "Stock patched successfully" })
    } catch (error: any) {
      switch (error.message) {
        case `The stock doesn't exists`:
          return rep.status(404).send({ error: error.message })
        case `The new ticker: ${ticker} is already in use`:
          return rep.status(400).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}