import { FastifyReply, FastifyRequest } from "fastify";

export async function checkAdmin(req: FastifyRequest, rep: FastifyReply){

  const role = req.user.role

  if (role === 'ADMIN') {
    return
  }

  return rep.status(403).send({ error: 'Not allowed to proceed. Is not a admin.' })
}