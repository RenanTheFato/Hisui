import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { CreatePortfolioService } from "../../services/portfolio/create-portfolio-service.js";

export class CreatePortfolioController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const userId = req.user.id as string

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const portfolioValidate = z.object({
      name: z.string({ error: "The value has entered isn't am string." })
        .min(2, { error: "The name doesn't meet the minimum number of characters (2)." }),
      description: z.string().nullable()
    })

    try {
      portfolioValidate.parse(req.body)
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

    const { name, description } = req.body as z.infer<typeof portfolioValidate>


    try {
      const createPortfolioService = new CreatePortfolioService()
      await createPortfolioService.execute({ userId, name, description })

      return rep.status(201).send({ message: "Portfolio created successfully" })
    } catch (error: any) {
      return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
    }
  }
}