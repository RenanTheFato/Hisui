import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { PatchPortfolioService } from "../../services/portfolio/patch-portfolio-service.js";

export class PatchPortfolioController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const userId = req.user.id as string
    const { portfolioId } = req.params as { portfolioId: string }

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    if (!userId) {
      return rep.status(400).send({ error: "The portfolio id id is missing" })
    }

    const patchPortfolioValidate = z.object({
      name: z.string({ error: "The value has entered isn't an string." })
        .min(2, { error: "The name doesn't meet the minimum number of characters (2)." })
        .optional(),
      description: z.string({ error: "The value has entered isn't an string." })
        .optional()
    })

    try {
      patchPortfolioValidate.parse(req.body)
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

    const { name, description } = req.body as z.infer<typeof patchPortfolioValidate>

    try {
      const patchPortfolioService = new PatchPortfolioService()
      await patchPortfolioService.execute({ userId, name, description })

      return rep.status(201).send({ message: "Portfolio patched successfully" })
    } catch (error: any) {
      switch (error.message) {
        case `The portfolio doesn't exists`:
          return rep.status(404).send({ error: error.message })

        case `You are not allowed to modify this portfolio`:
          return rep.status(403).send({ error: error.message })

        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}