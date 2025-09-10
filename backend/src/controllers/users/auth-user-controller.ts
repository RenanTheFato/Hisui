import { FastifyReply, FastifyRequest } from "fastify";
import { AuthUserService } from "../../services/users/auth-user-service.js";
import { z } from "zod/v4";

export class AuthUserController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const validadeSchema = z.object({
      email: z.email({ message: "The value entered isn't a string type and/or isn't an e-mail or the e-mail is invalid.." }),
      password: z.string({ message: "The value entered isn't a string type." })
    })

    const { email, password } = req.body as z.infer<typeof validadeSchema>

    try {
      validadeSchema.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/"),
        }))

        return rep.status(400).send({ message: "Authorization Error Ocurred", errors })
      }
    }

    try {
      const authService = new AuthUserService()
      const token = await authService.execute({ email, password })
      return rep.status(200).send({ token })
    } catch (error: any) {
      switch (error.message) {
        case "Invalid email or password":
          return rep.status(401).send({ error: error.message })      
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}`})
      }
    }
  }
}