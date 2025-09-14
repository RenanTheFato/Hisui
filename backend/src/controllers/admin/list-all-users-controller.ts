import { FastifyReply, FastifyRequest } from "fastify";
import { ListAllUsersService } from "../../services/admin/list-all-users-service.js";
import { User } from "../../models/user-model.js";

export class ListAllUsersController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const listAllUsersService = new ListAllUsersService()
      const users = await listAllUsersService.execute()

      return rep.status(200).send({ message: "All users successfully fetched", users })
    } catch (error: any) {
      return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
    }
  }
}