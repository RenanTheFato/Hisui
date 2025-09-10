import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserController } from "./controllers/users/create-user-controller.js";
import { AuthUserController } from "./controllers/users/auth-user-controller.js";
import { FastifyTypedInstance } from "./@types/fastify-types.js";
import { authentication } from "./middlewares/auth-middleware.js";
import { DeleteUserController } from "./controllers/users/delete-user-controller.js";

export async function routes(fastify: FastifyTypedInstance) {
  fastify.get("/", async(req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(200).send({ message: "Accepted"})
  })

  fastify.post("/create-user", async(req: FastifyRequest, rep: FastifyReply) =>{
    return new CreateUserController().handle(req, rep)
  })

  fastify.post("/auth-user", async(req: FastifyRequest, rep: FastifyReply) =>{
    return new AuthUserController().handle(req, rep)
  })

  fastify.delete("/delete-user", {preHandler: [authentication]} , async(req: FastifyRequest, rep: FastifyReply) =>{
    return new DeleteUserController().handle(req, rep)
  })
}