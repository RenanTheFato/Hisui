import { prisma } from "../../config/prisma.js";
import { UserPreferences } from "../../models/user-preferences-model.js";

export class SetUserPreferencesService {
  async execute({ user_id, allow_news_notifications, allow_orders_notifications, allow_updates_notifications }: UserPreferences) {

    const isUserExists = await prisma.userPreferences.findFirst({
      where: {
        user_id,
      },
      select: {
        user_id: true
      }
    })

    if (!isUserExists) {
      throw new Error(`The user doesn't exists`)
    }

    await prisma.userPreferences.update({
      data: {
        allow_news_notifications,
        allow_orders_notifications,
        allow_updates_notifications,
      },
      where: {
        user_id,
      }
    })

  }
}