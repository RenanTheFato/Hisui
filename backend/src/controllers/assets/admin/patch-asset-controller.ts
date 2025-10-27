import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { PatchAssetService } from "../../../services/assets/admin/patch-asset-service.js";
import { Assets } from "../../../models/asset-model.js";

export class PatchAssetController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string
    const { id } = req.params as Pick<Assets, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The asset id is missing" })
    }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const assetValidate = z.object({
      name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The asset name exceeds the maximum number of characters (256)." })
        .nonempty({ message: "The asset name cannot be empty" })
        .optional(),

      ticker: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset ticker doesn't meet the minimum number of characters (2)." })
        .max(24, { error: "The asset ticker exceeds the maximum number of characters (24)." })
        .uppercase({ error: "The asset ticker must be only in uppercase" })
        .nonempty({ message: "The asset ticker cannot be empty" })
        .optional(),

      type: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset type doesn't meet the minimum number of characters (2)." })
        .max(128, { error: "The asset type exceeds the maximum number of characters (128)." })
        .nonempty({ message: "The asset type cannot be empty" })
        .optional(),

      sector: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The asset sector doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The asset sector exceeds the maximum number of characters (256)." })
        .nonempty({ message: "The asset sector cannot be empty" })
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
      const patchAssetService = new PatchAssetService()
      await patchAssetService.execute({ id, name, ticker, type, sector, company_name, country, exchange })

      return rep.status(200).send({ message: "Asset patched successfully" })
    } catch (error: any) {
      switch (error.message) {
        case `The asset doesn't exists`:
          return rep.status(404).send({ error: error.message })
        case `The new ticker: ${ticker} is already in use`:
          return rep.status(400).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}