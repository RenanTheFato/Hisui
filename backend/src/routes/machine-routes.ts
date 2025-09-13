import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { GetPythonServerStatusController } from "../controllers/machine/get-python-server-status-controller.js";
import { PredictPETR4Controller } from "../controllers/machine/petr4/predict-petr4-controller.js";

export async function machineRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/check-python", async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetPythonServerStatusController().handle(req, rep)
  })

  fastify.post("/machine", async (req: FastifyRequest, rep: FastifyReply) => {
    return new PredictPETR4Controller().handle(req, rep)
  })
}