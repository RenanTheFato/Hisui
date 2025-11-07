import { z } from "zod/v4";

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("No portfolios found for the authenticated user.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const listPortfolioSchema = {
  tags: ["portfolio"],
  summary: "List user portfolios",
  description: "Retrieves all portfolios belonging to the authenticated user. Allows optional filtering by portfolio name. Requires authentication via bearer token.",
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    name: z.string().optional().describe("Optional name filter to search for portfolios.").meta({
      example: "Crypto"
    }),
  }),
  response: {
    200: z.object({
      message: z.string().describe("Success message."),
      portfolios: z.array(z.object({
        id: z.string().describe("Unique identifier of the portfolio."),
        name: z.string().describe("Name of the portfolio."),
        description: z.string().nullable().describe("Description of the portfolio."),
        user_id: z.string().describe("ID of the user who owns the portfolio."),
        created_at: z.date().describe("Date and time when the portfolio was created."),
        updated_at: z.date().describe("Date and time when the portfolio was last updated."),
      })),
    }).describe("List of portfolios retrieved successfully."),
    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),
    404: notFoundErrorSchema.describe("Not Found — User has no portfolios."),
    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during portfolio listing."),
  }
}
