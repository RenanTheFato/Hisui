import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { Crypto } from "../../../models/crypto-model.js";
import { PatchCryptoService } from "../../../services/crypto/admin/patch-crypto-service.js";

export class PatchCryptoController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userId = req.user.id as string
    const { id } = req.params as Pick<Crypto, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The crypto id is missing" })
    }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const cryptoValidate = z.object({
      name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The crypto name doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The crypto name exceeds the maximum number of characters (256)." })
        .nonempty({ error: "The crypto name cannot be empty" })
        .optional(),

      ticker: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The crypto ticker doesn't meet the minimum number of characters (2)." })
        .max(24, { error: "The crypto ticker exceeds the maximum number of characters (24)." })
        .uppercase({ error: "The crypto ticker must be only in uppercase" })
        .nonempty({ error: "The crypto ticker cannot be empty" })
        .optional(),

      blockchain: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The crypto blockchain doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The crypto blockchain exceeds the maximum number of characters (256)." })
        .nonempty({ error: "The crypto blockchain cannot be empty" })
        .optional(),

      protocol: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The protocol doesn't meet the minimum number of characters (2)." })
        .max(256, { error: "The protocol exceeds the maximum number of characters (256)." })
        .nonempty({ error: "The protocol cannot be empty" })
        .optional()
    })

    try {
      cryptoValidate.parse(req.body)
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

    const { name, ticker, blockchain, protocol } = req.body as z.infer<typeof cryptoValidate>

    try {
      const patchCryptoService = new PatchCryptoService()
      await patchCryptoService.execute({ id, name, ticker, blockchain, protocol })

      return rep.status(200).send({ message: "Crypto patched successfully" })
    } catch (error: any) {
      switch (error.message) {
        case `The crypto doesn't exists`:
          return rep.status(404).send({ error: error.message })
        case `The new ticker: ${ticker} is already in use`:
          return rep.status(400).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}