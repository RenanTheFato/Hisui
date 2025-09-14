import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { ListAllUsersController } from "../controllers/admin/list-all-users-controller.js";
import { checkAdmin } from "../middlewares/admin-middleware.js";
import { authentication } from "../middlewares/auth-middleware.js";
import { listAllUsersSchema } from "../swagger/schemas/admin/list-all-users-schema.js";
import { ViewPETR4ModelInfoController } from "../controllers/machine/admin/view-petr4-model-info-controller.js";
import { viewPETR4ModelInfoSchema } from "../swagger/schemas/admin/view-petr4-model-info-schema.js";
import { GetPythonServerStatusController } from "../controllers/machine/admin/get-python-server-status-controller.js";
import { getPythonServerStatusSchema } from "../swagger/schemas/admin/get-python-server-status-schema.js";

export async function adminRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/list-users", { preHandler: [authentication, checkAdmin], schema: listAllUsersSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListAllUsersController().handle(req, rep)
  })

  fastify.get("/check-python", { preHandler: [authentication, checkAdmin], schema: getPythonServerStatusSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetPythonServerStatusController().handle(req, rep)
  })

  fastify.get("/model/petr4/info", { preHandler: [authentication, checkAdmin], schema: viewPETR4ModelInfoSchema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ViewPETR4ModelInfoController().handle(req, rep)
  })
}