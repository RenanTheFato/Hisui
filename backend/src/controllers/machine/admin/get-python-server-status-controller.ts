import { FastifyReply, FastifyRequest } from "fastify";

export class GetPythonServerStatusController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    try {
      const response = await fetch(`${process.env.PYTHON_SERVER_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      })

      const data = await response.json();

      return rep.status(200).send({ message: data });

    } catch (error: any) {
      return rep.status(500).send({ error: error.message })
    }
  }
}
