import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../../@types/interfaces/user-interface.js";
import { GetPETR4MetricsService } from "../../../services/machine/petr4/get-petr4-metrics-service.js";

export class GetPETR4MetricsController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(401).send({ message: "Unauthorized" })
    }

    try {
      const getPETR4MetricsService = new GetPETR4MetricsService()
      const data = await getPETR4MetricsService.execute()

      return rep.status(200).send({ data })
    } catch (error: any) {
      return rep.status(500).send({ error: error.message})
    }
  }
}