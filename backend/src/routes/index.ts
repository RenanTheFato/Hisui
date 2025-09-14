import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { userRoutes } from "./user-routes.js";
import { adminRoutes } from "./admin-routes.js";
import { GetPythonServerStatusController } from "../controllers/machine/get-python-server-status-controller.js";
import { PredictPETR4Controller } from "../controllers/machine/petr4/predict-petr4-controller.js";
import { machineRoutes } from "./machine-routes.js";

export async function routes(fastify: FastifyTypedInstance) {
  fastify.get("/", async (req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(200).send({ message: "Accepted" })
  })

  await userRoutes(fastify)
  await adminRoutes(fastify)
  await machineRoutes(fastify)
}