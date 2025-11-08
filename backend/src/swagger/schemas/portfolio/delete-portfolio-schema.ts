import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("The specified portfolio was not found.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. The user does not have permission to delete this portfolio.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const deletePortfolioSchema = {
  tags: ["portfolio"],
  summary: "Delete portfolio",
  description:"Allows an authenticated user to delete one of their portfolios. Only the portfolio owner can perform this action. Requires authentication.",
  security: [{ bearerAuth: [] }],

  params: z.object({
    portfolioId: z.string()
      .describe("Unique identifier of the portfolio to delete.")
      .meta({
        example: "prt-1a2b3c4d5e6f7g8h9i0j",
      }),
  }),

  response: {
    204: z.object({})
      .describe("Portfolio deleted successfully. No content is returned in the response body."),

    400: validationErrorSchema.describe("Bad Request — Validation failure or missing parameters."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema.describe("Forbidden — The user does not have permission to delete this portfolio."),

    404: notFoundErrorSchema.describe("Not Found — The specified portfolio does not exist."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during portfolio deletion."),
  },
}