import { FastifyReply, FastifyRequest } from "fastify";
import { DeleteUserService } from "../../services/users/delete-user-service.js";
import { User } from "../../models/user-model.js";

export class DeleteUserController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const deleteUserService = new DeleteUserService()
      await deleteUserService.execute({ id })

      return rep.status(204).send({})
    } catch (error: any) {
      switch (error.message) {
        case "The user not exists":
          return rep.status(400).send({ error: error.message })      
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}`})            
      }
    }

  }
}