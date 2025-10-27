import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { CreateAssetService } from "../../../services/assets/admin/create-asset-service.js";

export class CreateAssetController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const assetValidate = z.object({
      name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The asset name exceeds the maximum number of characters (256)." }),

      ticker: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset ticker doesn't meet the minimum number of characters (2)." })
        .max(24, { error: "The asset ticker exceeds the maximum number of characters (24)." })
        .uppercase({ error: "The asset ticker must be only in uppercase" }),

      type: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset type doesn't meet the minimum number of characters (2)." })
        .max(128, { error: "The asset type exceeds the maximum number of characters (128)." }),

      sector: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset sector doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The asset sector exceeds the maximum number of characters (256)." }),

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
      assetValidate.parse(req.body)
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

    const { name, ticker, type, sector, company_name, country, exchange } = req.body as z.infer<typeof assetValidate>

    try {
      const createAssetService = new CreateAssetService()
      await createAssetService.execute({ name, ticker, type, sector, company_name, country, exchange })

      return rep.status(201).send({ message: "Asset created successfully" })
    } catch (error: any) {
      switch (error.message) {
        case `The asset ${ticker} has been already registered`:
          return rep.status(400).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}