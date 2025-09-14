import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { GetPythonServerStatusController } from "../controllers/machine/admin/get-python-server-status-controller.js";
import { PredictPETR4Controller } from "../controllers/machine/petr4/predict-petr4-controller.js";
import { predictPETR4Schema } from "../swagger/schemas/machine/petr4/petr4-prediction-schema.js";
import { authentication } from "../middlewares/auth-middleware.js";

export async function machineRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/check-python", async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetPythonServerStatusController().handle(req, rep)
  })

  fastify.post("/machine/predict-petr4", { preHandler: [authentication], schema: predictPETR4Schema }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new PredictPETR4Controller().handle(req, rep)
  })
}