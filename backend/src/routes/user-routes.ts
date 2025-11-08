import { FastifyReply, FastifyRequest } from "fastify";
import { AuthUserController } from "../controllers/users/auth-user-controller.js";
import { CreateUserController } from "../controllers/users/create-user-controller.js";
import { DeleteUserController } from "../controllers/users/delete-user-controller.js";
import { ResetPasswordController } from "../controllers/users/reset-password-controller.js";
import { VerifyEmailController } from "../controllers/users/verify-email-controller.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { authUserSchema } from "../swagger/schemas/users/auth-user-schema.js";
import { createUserSchema } from "../swagger/schemas/users/create-user-schema.js";
import { deleteUserSchema } from "../swagger/schemas/users/delete-user-schema.js";
import { resetPasswordSchema } from "../swagger/schemas/users/reset-password-schema.js";
import { verifyEmailSchema } from "../swagger/schemas/users/verify-email-schema.js";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { viewUserInformationsSchema } from "../swagger/schemas/users/view-user-informations-schema.js";
import { ViewUserInformationsController } from "../controllers/users/view-user-informations-controller.js";
import { SetUserPreferencesController } from "../controllers/users/set-user-preferences-controller.js";
import { setUserPreferencesSchema } from "../swagger/schemas/users/user-prefereces-schema.js";

export async function userRoutes(fastify: FastifyTypedInstance) {
  fastify.post("/create-user", { schema: createUserSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateUserController().handle(req, rep)
  })

  fastify.post("/auth-user", { schema: authUserSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new AuthUserController().handle(req, rep)
  })

  fastify.delete("/delete-user", { preHandler: [authentication], schema: deleteUserSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new DeleteUserController().handle(req, rep)
  })

  fastify.get("/verify-email", { schema: verifyEmailSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new VerifyEmailController().handle(req, rep)
  })

  fastify.patch("/reset-password", { preHandler: [authentication], schema: resetPasswordSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ResetPasswordController().handle(req, rep)
  })

  fastify.patch("/set-preferences", { preHandler: [authentication], schema: setUserPreferencesSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new SetUserPreferencesController().handle(req, rep)
  })

  fastify.get("/view-user-informations", { preHandler: [authentication], schema: viewUserInformationsSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ViewUserInformationsController().handle(req, rep)
  })
}