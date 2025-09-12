import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { ListAllUsersController } from "../controllers/admin/list-all-users-controller.js";
import { checkAdmin } from "../middlewares/admin-middleware.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { listAllUsersSchema } from "../swagger/schemas/admin/list-all-users-schema.js";

export async function adminRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/list-users", { preHandler: [authentication, checkAdmin], schema: listAllUsersSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListAllUsersController().handle(req, rep)
  })
}