import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  error: z.string(),
  message: z.string(),
}).describe("Bad Request — Missing or invalid parameters.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. User does not have ADMIN privileges.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("News not found.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const deleteNewsSchema = {
  tags: ["news", "admin"],
  summary: "Delete news article",
  description: `Allows an authenticated administrator to delete a specific news article. Requires authentication and ADMIN privileges.`,
  security: [{ bearerAuth: [] }],

  params: z.object({
    newsId: z.string({ message: "Invalid news ID format." })
      .describe("Unique identifier of the news article to delete.")
      .meta({ example: "news-5d2f3a6b-91e2-4c2b-bb0a-21c1e4e7d6f2" }),
  }),

  response: {
    204: z.object({}).describe("News deleted successfully (no content)."),

    400: validationErrorSchema.describe("Bad Request — Missing or invalid parameters."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema.describe("Forbidden — User does not have ADMIN privileges."),

    404: notFoundErrorSchema.describe("Not Found — The specified news article does not exist."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during news deletion."),
  },
}