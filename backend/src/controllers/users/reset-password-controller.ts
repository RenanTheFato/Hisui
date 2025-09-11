import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../@types/interfaces/user-interface.js";
import { z } from "zod/v4";
import { ResetPasswordService } from "../../services/users/reset-password-service.js";

export class ResetPasswordController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const { id } = req.user as Pick<User, 'id'>

    const resetPasswordValidate = z.object({
      old_password: z.string({ error: "The value has entered isn't a email" }),
      new_password: z.string({ error: "The value has entered isn't a email" })
        .min(8, { error: "The password doesn't meet the minimum number of characters (8)." })
        .max(128, { error: "The password has exceeded the character limit (128)." })
        .refine((password) => /[A-Z]/.test(password), { error: "Password must contain at least one uppercase letter." })
        .refine((password) => /[0-9]/.test(password), { error: "Password must contain at least one number." })
        .refine((password) => /[@#$*&]/.test(password), { error: "Password must contain at least one of this special characters ('@' '#' '$' '*' '&')." }),
    })

    try {
      resetPasswordValidate.parse(req.body)
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

    const { old_password, new_password } = req.body as z.infer<typeof resetPasswordValidate>

    try {
      const resetPasswordService = new ResetPasswordService()
      await resetPasswordService.execute({ id, old_password, new_password })

      return rep.status(200).send({ message: "Password reseted successfully" })
    } catch (error: any) {
      switch (error.message) {
        case "User not found":
          return rep.status(400).send({ error: error.message })
        case "The entered password and the current password do not match":
          return rep.status(401).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }

  }
}