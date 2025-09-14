import { FastifyReply, FastifyRequest } from "fastify";
import { GetPythonServerStatusService } from "../../../services/machine/admin/get-python-server-status-service.js";
import { User } from "../../../models/user-model.js";

export class GetPythonServerStatusController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(401).send({ message: "Unauthorized" })
    }

    try {
      const getPythonServerStatusService = new GetPythonServerStatusService()
      const data = await getPythonServerStatusService.execute()

      return rep.status(200).send({ message: data })

    } catch (error: any) {
      return rep.status(500).send({ error: error.message })
    }
  }
}
