import { FastifyReply, FastifyRequest } from "fastify";
import { hash } from "bcryptjs";
import { z } from "zod/v4";
import { CreateUserService } from "../../services/users/create-user-service.js";

export class CreateUserController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const userValidate = z.object({
      email: z.email({ message: "The value has entered isn't a email or the email is invalid." })
        .min(2, { message: "The email doesn't meet the minimum number of characters (2)." }),
      password: z.string()
        .min(8, { message: "The password doesn't meet the minimum number of characters (8)." })
        .max(128, { message: "The password has exceeded the character limit (128)." })
        .refine((password) => /[A-Z]/.test(password), { message: "Password must contain at least one uppercase letter." })
        .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number." })
        .refine((password) => /[@#$*&]/.test(password), { message: "Password must contain at least one of this special characters ('@' '#' '$' '*' '&')." }),
      username: z.string()
        .min(2, { message: "The name doesn't meet the minimum number of characters (2)." })
        .max(128, { message: "The name has exceeded the character limit (128)." }),
    })

    const { email, password, username } = req.body as z.infer<typeof userValidate>

    try {
      userValidate.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/"),
        }))

        return rep.status(400).send({ message: "Validation Error Ocurred", errors })
      }
    }

    const hashedPassword = await hash(password, 10)

    try {
      const createUserService = new CreateUserService()
      await createUserService.execute({ email, password: hashedPassword, username })

      return rep.status(201).send({ message: "Please check your email to verify your account" })
    } catch (error: any) {
      switch (error.message) {
        case "The email is already in use":
          return rep.status(400).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}`})
      }
    }
  }
}