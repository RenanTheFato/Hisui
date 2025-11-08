import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("The specified user does not exist.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")


export const setUserPreferencesSchema = {
  tags: ["user"],
  summary: "Update user notification preferences",
  description: "Allows authenticated users to update their notification preferences. Each field is optional, and only provided values will be updated.",
  security: [{ bearerAuth: [] }],

  body: z.object({
    allow_news_notifications: z.boolean({ error: "The value has entered isn't boolean. Must be only 'true' or 'false'." })
      .optional()
      .describe("Determines whether the user allows news notifications.")
      .meta({ example: true }),

    allow_orders_notifications: z.boolean({ error: "The value has entered isn't boolean. Must be only 'true' or 'false'." })
      .optional()
      .describe("Determines whether the user allows order-related notifications.")
      .meta({ example: false }),

    allow_updates_notifications: z.boolean({ error: "The value has entered isn't boolean. Must be only 'true' or 'false'." })
      .optional()
      .describe("Determines whether the user allows update-related notifications.")
      .meta({ example: true }),
  }),

  response: {
    200: z.object({
      message: z.string()
        .describe("Success message confirming that preferences were updated."),
    })
      .describe("User preferences updated successfully."),

    400: validationErrorSchema.describe("Bad Request — Validation failure for one or more fields."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid authentication token."),

    404: notFoundErrorSchema.describe("Not Found — The specified user does not exist."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during user preferences update."),
  },
}