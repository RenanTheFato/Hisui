import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("The specified stock was not found.")

const serviceErrorSchema = z.object({
  error: z.string(),
}).describe("A business logic error occurred during stock update.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. User does not have ADMIN privileges.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const patchStockSchema = {
  tags: ["stocks", "admin"],
  summary: "Update stock data",
  description: "Allows administrators to update existing stock information. Requires authentication and admin privileges.",
  security: [{ bearerAuth: [] }],

  params: z.object({
    id: z.string().describe("Unique identifier of the stock to update.").meta({
      example: "stk-9219120-as8912has912-12891as",
    }),
  }),

  body: z.object({
    name: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The stock name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The stock name exceeds the maximum number of characters (256)." })
      .optional()
      .describe("New name of the stock.")
      .meta({
        example: "Apple Inc.",
      }),

    ticker: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The stock ticker doesn't meet the minimum number of characters (2)." })
      .max(24, { error: "The stock ticker exceeds the maximum number of characters (24)." })
      .toUpperCase()
      .optional()
      .describe("New ticker symbol for the stock (must be uppercase).")
      .meta({
        example: "AAPL",
      }),

    sector: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The sector doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The sector exceeds the maximum number of characters (256)." })
      .optional()
      .describe("New sector of the company.")
      .meta({
        example: "Technology",
      }),

    company_name: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The company name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The company name exceeds the maximum number of characters (256)." })
      .optional()
      .describe("New company name associated with the stock.")
      .meta({
        example: "Apple Inc.",
      }),

    country: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The country acronym doesn't meet the minimum number of characters (2)." })
      .max(6, { error: "The country acronym exceeds the maximum number of characters (6)." })
      .optional()
      .describe("New country of origin or listing.")
      .meta({
        example: "US",
      }),

    exchange: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The exchange name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The exchange name exceeds the maximum number of characters (256)." })
      .optional()
      .describe("New exchange where the stock is listed.")
      .meta({
        example: "NASDAQ",
      }),
  }),

  response: {
    200: z.object({
      message: z.string().describe("Success message."),
    }).describe("Stock updated successfully."),

    400: z.union([validationErrorSchema, serviceErrorSchema]).describe("Bad Request — Validation failure or business rule violation."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema.describe("Forbidden — User does not have ADMIN privileges."),

    404: notFoundErrorSchema.describe("Not Found — The specified stock does not exist."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during stock update."),
  },
}