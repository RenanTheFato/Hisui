import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { SetUserPreferencesService } from "../../services/users/set-user-preferences-service.js";

export class SetUserPreferencesController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const user_id = req.user.id as string

    if (!user_id) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const userPreferencesValidate = z.object({
      allow_news_notifications: z.boolean({ error: "The value has entered isn't boolean. Must be only 'true' or 'false'. " })
        .optional(),

      allow_orders_notifications: z.boolean({ error: "The value has entered isn't boolean. Must be only 'true' or 'false'. " })
        .optional(),

      allow_updates_notifications: z.boolean({ error: "The value has entered isn't boolean. Must be only 'true' or 'false'. " })
        .optional(),
    })

    try {
      userPreferencesValidate.parse(req.body)
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

    const { allow_news_notifications, allow_orders_notifications, allow_updates_notifications } = req.body as z.infer<typeof userPreferencesValidate>

    try {
      const setUserPreferencesService = new SetUserPreferencesService()
      await setUserPreferencesService.execute({ user_id, allow_news_notifications, allow_orders_notifications, allow_updates_notifications})
      return rep.status(200).send({ message: "Preferences patched successfully" })
    } catch (error: any) {
      switch (error.message) {
        case `The user doesn't exists`:
          return rep.status(404).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}