import { FastifyReply, FastifyRequest } from "fastify";

export class GetResponsePetr4 {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const response = await fetch(`${process.env.PYTHON_SERVER_URL}/health`)
    const data = await response.json()

    return rep.status(200).send({ message: data })
  }
}