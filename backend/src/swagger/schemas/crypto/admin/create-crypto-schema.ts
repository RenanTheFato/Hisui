import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.");

const serviceErrorSchema = z.object({
  error: z.string(),
}).describe("A business logic error occurred during crypto creation.");

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.");

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. User does not have ADMIN privileges.");

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.");

export const createCryptoSchema = {
  tags: ["crypto", "admin"],
  summary: "Create a new cryptocurrency",
  description: "Allows administrators to register a new cryptocurrency in the system. Requires authentication and admin role.",
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string({ error: "The value has entered isn't an string." })
      .min(2, { error: "The crypto name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The crypto name exceeds the maximum number of characters (256)." })
      .describe("Name of the cryptocurrency.")
      .meta({
        example: "Bitcoin"
      }),

    ticker: z.string({ error: "The value has entered isn't an string." })
      .min(2, { error: "The crypto ticker doesn't meet the minimum number of characters (2)." })
      .max(24, { error: "The crypto ticker exceeds the maximum number of characters (24)." })
      .toUpperCase()
      .describe("Cryptocurrency ticker symbol (must be uppercase).")
      .meta({
        example: "BTC"
      }),

    blockchain: z.string({ error: "The value has entered isn't an string." })
      .min(2, { error: "The crypto blockchain doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The crypto blockchain exceeds the maximum number of characters (256)." })
      .describe("Blockchain network where the crypto operates.")
      .meta({
        example: "Bitcoin"
      }),

    protocol: z.string({ error: "The value has entered isn't an string." })
      .min(2, { error: "The protocol doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The protocol exceeds the maximum number of characters (256)." })
      .optional()
      .describe("Protocol or standard used by the cryptocurrency (optional).")
      .meta({
        example: "Native"
      }),
  }),
  response: {
    201: z.object({
      message: z.string().describe("Success message."),
    }).describe("Cryptocurrency created successfully."),

    400: z.union([validationErrorSchema, serviceErrorSchema])
      .describe("Bad Request — Validation failure or business rule violation."),

    401: unauthorizedErrorSchema
      .describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema
      .describe("Forbidden — User does not have ADMIN privileges."),

    500: internalErrorSchema
      .describe("Internal Server Error — Unexpected failure during crypto creation."),
  }
}