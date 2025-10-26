import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { SearchAssetService } from "../../services/assets/search-asset-service.js";

export class SearchAssetController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const userId = req.user.id as string

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const searchAssetValidate = z.object({
      name: z.string({ message: "The value entered isn't a string." }).optional(),

      ticker: z.string({ message: "The value entered isn't a string." }).optional(),

      type: z.string({ message: "The value entered isn't a string." }).optional(),

      sector: z.string({ message: "The value entered isn't a string." }).optional(),

      company_name: z.string({ message: "The value entered isn't a string." }).optional(),

      country: z.string({ message: "The value entered isn't a string." }).optional(),

      exchange: z.string({ message: "The value entered isn't a string." }).optional(),

      page: z.coerce.number({ message: "The page must be a number." })
        .min(1, { message: "The page must be at least 1." })
        .default(1),

      limit: z.coerce.number({ message: "The limit must be a number." })
        .min(1, { message: "The limit must be at least 1." })
        .max(100, { message: "The limit cannot exceed 100." })
        .default(20),
    })

    let queryParams = req.query as z.infer<typeof searchAssetValidate>

    try {
      queryParams = searchAssetValidate.parse(req.query)
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
      const searchAssetService = new SearchAssetService()
      const result = await searchAssetService.execute(queryParams)

      return rep.status(200).send(result)
    } catch (error: any) {
      switch (error.message) {
        case "No assets found with the provided filters":
          return rep.status(404).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}