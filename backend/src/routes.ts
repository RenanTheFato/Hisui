import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserController } from "./controllers/users/create-user-controller.js";
import { AuthUserController } from "./controllers/users/auth-user-controller.js";
import { FastifyTypedInstance } from "./@types/fastify-types.js";
import { authentication } from "./middlewares/auth-middleware.js";
import { DeleteUserController } from "./controllers/users/delete-user-controller.js";
import { createUserSchema } from "./swagger/schemas/users/create-user-schema.js";
import { deleteUserSchema } from "./swagger/schemas/users/delete-user-schema.js";
import { authUserSchema } from "./swagger/schemas/users/auth-user-schema.js";
import { VerifyEmailController } from "./controllers/users/verify-email-controller.js";
import { ResetPasswordController } from "./controllers/users/reset-password-controller.js";

export async function routes(fastify: FastifyTypedInstance) {
  fastify.get("/", async (req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(200).send({ message: "Accepted" })
  })

  fastify.post("/create-user", { schema: createUserSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateUserController().handle(req, rep)
  })

  fastify.post("/auth-user", { schema: authUserSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new AuthUserController().handle(req, rep)
  })

  fastify.delete("/delete-user", { preHandler: [authentication], schema: deleteUserSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new DeleteUserController().handle(req, rep)
  })

  fastify.get("/verify-email", async (req: FastifyRequest, rep: FastifyReply) => {
    return new VerifyEmailController().handle(req, rep)
  })

  fastify.patch("/reset-password", { preHandler: [authentication] }, async(req: FastifyRequest, rep: FastifyReply) => {
    return new ResetPasswordController().handle(req, rep)
  })
}