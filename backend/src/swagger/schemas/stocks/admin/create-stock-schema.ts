import { z } from "zod/v4"

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.")

const serviceErrorSchema = z.object({
  error: z.string(),
}).describe("A business logic error occurred during stock creation.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. User does not have ADMIN privileges.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const createStockSchema = {
  tags: ["stocks", "admin"],
  summary: "Register a new stock",
  description:
    "Allows administrators to register a new stock in the system. Requires authentication and admin privileges.",
  security: [{ bearerAuth: [] }],

  body: z.object({
    name: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The stock name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The stock name exceeds the maximum number of characters (256)." })
      .describe("Name of the stock.")
      .meta({ example: "Apple Inc." }),

    ticker: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The stock ticker doesn't meet the minimum number of characters (2)." })
      .max(24, { error: "The stock ticker exceeds the maximum number of characters (24)." })
      .toUpperCase()
      .describe("Unique ticker symbol representing the stock (must be uppercase).")
      .meta({ example: "AAPL" }),

    sector: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The stock sector doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The stock sector exceeds the maximum number of characters (256)." })
      .describe("Sector or industry where the company operates.")
      .meta({ example: "Technology" }),

    company_name: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The company name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The company name exceeds the maximum number of characters (256)." })
      .describe("Full name of the company issuing the stock.")
      .meta({ example: "Apple Inc." }),

    country: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The country acronym doesn't meet the minimum number of characters (2)." })
      .max(6, { error: "The country acronym exceeds the maximum number of characters (6)." })
      .describe("Country where the company is registered (acronym format).")
      .meta({ example: "USA" }),

    exchange: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The exchange name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The exchange name exceeds the maximum number of characters (256)." })
      .describe("Stock exchange where the company is listed.")
      .meta({ example: "NASDAQ" }),
  }),

  response: {
    201: z.object({
        message: z.string().describe("Success message."),
      })
      .describe("Stock created successfully."),

    400: z.union([validationErrorSchema, serviceErrorSchema])
      .describe("Bad Request — Validation failure or business rule violation."),

    401: unauthorizedErrorSchema
      .describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema
      .describe("Forbidden — User does not have ADMIN privileges."),

    500: internalErrorSchema
      .describe("Internal Server Error — Unexpected failure during stock creation."),
  },
}