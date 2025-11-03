import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { SearchStockService } from "../../services/stocks/search-stock-service.js";
import { SearchCryptoService } from "../../services/crypto/search-crypto-service.js";

export class SearchCryptoController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const userId = req.user.id as string

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const searchCryptoValidate = z.object({
      name: z.string({ error: "The value entered isn't a string." }).optional(),

      ticker: z.string({ error: "The value entered isn't a string." }).optional(),

      type: z.string({ error: "The value entered isn't a string." }).optional(),

      blockchain: z.string({ error: "The value entered isn't a string." }).optional(),

      protocol: z.string({ error: "The value entered isn't a string." }).optional(),

      page: z.coerce.number({ error: "The page must be a number." })
        .min(1, { error: "The page must be at least 1." })
        .default(1),

      limit: z.coerce.number({ error: "The limit must be a number." })
        .min(1, { error: "The limit must be at least 1." })
        .max(100, { error: "The limit cannot exceed 100." })
        .default(20),
    })

    let queryParams = req.query as z.infer<typeof searchCryptoValidate>

    try {
      queryParams = searchCryptoValidate.parse(req.query)
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
      const searchCryptoService = new SearchCryptoService()
      const result = await searchCryptoService.execute(queryParams)

      return rep.status(200).send(result)
    } catch (error: any) {
      switch (error.message) {
        case "No crypto found with the provided filters":
          return rep.status(404).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}