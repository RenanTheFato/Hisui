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

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const createPortfolioSchema = {
  tags: ["portfolio"],
  summary: "Create a new portfolio",
  description: "Creates a new portfolio for the authenticated user. Requires authentication via bearer token.",
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string({ error: "The value has entered isn't an string." })
      .min(2, { error: "The name doesn't meet the minimum number of characters (2)." })
      .describe("Name of the portfolio.")
      .meta({
        example: "My Investments"
      }),
    description: z.string().nullable().describe("Optional description of the portfolio.").meta({
      example: "Long-term investments and crypto assets."
    }),
  }),
  response: {
    201: z.object({
      message: z.string().describe("Success message."),
      portfolio: z.object({
        id: z.string().describe("Unique identifier of the created portfolio."),
        name: z.string().describe("Name of the portfolio."),
        description: z.string().nullable().describe("Description of the portfolio."),
        user_id: z.string().describe("ID of the user who owns the portfolio."),
        created_at: z.date().describe("Date and time when the portfolio was created."),
        updated_at: z.date().describe("Date and time when the portfolio was last updated."),
      }),
    }).describe("Portfolio created successfully."),
    400: validationErrorSchema.describe("Bad Request — Validation failure or missing fields."),
    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),
    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during portfolio creation."),
  }
}
