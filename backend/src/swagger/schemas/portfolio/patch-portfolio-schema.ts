import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
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
}).describe("Forbidden. User does not have permission to modify this portfolio.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const patchPortfolioSchema = {
  tags: ["portfolio"],
  summary: "Update portfolio data",
  description: "Allows an authenticated user to update an existing portfolio. Only the portfolio owner can modify its data. Requires authentication.",
  security: [{ bearerAuth: [] }],

  params: z.object({
    portfolioId: z.string().describe("Unique identifier of the portfolio to update.").meta({
      example: "prt-1a2b3c4d5e6f7g8h9i0j",
    }),
  }),

  body: z.object({
    name: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The name doesn't meet the minimum number of characters (2)." })
      .optional()
      .describe("New name of the portfolio.")
      .meta({
        example: "My Updated Portfolio",
      }),

    description: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("New description for the portfolio.")
      .meta({
        example: "This is my updated portfolio focused on long-term investments.",
      }),
  }),

  response: {
    201: z.object({
        message: z.string().describe("Success message."),
      }).describe("Portfolio updated successfully."),

    400: validationErrorSchema.describe("Bad Request — Validation failure or missing data."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema.describe("Forbidden — The user does not have permission to modify this portfolio."),

    404: notFoundErrorSchema.describe("Not Found — The specified portfolio does not exist."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during portfolio update."),
  },
}