import { FastifyReply, FastifyRequest } from "fastify";
import { ViewPETR4ModelInfoService } from "../../../services/machine/admin/view-petr4-model-info-service.js";
import { User } from "../../../models/user-model.js";

export class ViewPETR4ModelInfoController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(401).send({ message: "Unauthorized" })
    }

    try {
      const viewPETR4ModelInfoService = new ViewPETR4ModelInfoService()
      const data = await viewPETR4ModelInfoService.execute()

      return rep.status(200).send({ data })
    } catch (error: any) {
      return rep.status(500).send({ error: error.message })
    }
  }
}