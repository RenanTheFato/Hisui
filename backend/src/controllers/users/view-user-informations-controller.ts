import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../@types/interfaces/user-interface.js";
import { ViewUserInformationService } from "../../services/users/view-user-informations-service.js";

export class ViewUserInformationsController{
  async handle(req: FastifyRequest, rep: FastifyReply){

    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing"})
    }

    try {
      const viewUserInformationService = new ViewUserInformationService()
      const user = await viewUserInformationService.execute({ id })

      return rep.status(200).send({ message: "Your data has fetched with success", user })
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