import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { PredictPETR4Service } from "../../../services/machine/petr4/predict-petr4-service.js";
import { User } from "../../../@types/interfaces/user-interface.js";

export class PredictPETR4Controller {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(401).send({ message: "Unauthorized" })
    }

    const predictValidate = z.object({
      period: z.enum(['1y', '2y', '3y', '4y', '5y', '6y', '7y', '8y'] as const,
        { error: "The period value must be one of this  values ['1y', '2y', '3y', '4y', '5y', '6y', '7y', '8y']" }),
      retrain: z.boolean({ error: "The value must be 'true' or 'false' " }).optional()
    })

    try {
      predictValidate.parse(req.body)
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

    const { period, retrain } = req.body as z.infer<typeof predictValidate>

    try {
      const predictPETR4Service = new PredictPETR4Service()
      const result = await predictPETR4Service.execute({ period, retrain })

      return rep.status(200).send({ result })
    } catch (error: any) {
      return rep.status(500).send({ error: error.message})
    }
  }
}