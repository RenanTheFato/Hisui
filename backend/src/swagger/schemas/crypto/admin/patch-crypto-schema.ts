import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.");

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("The specified cryptocurrency was not found.");

const serviceErrorSchema = z.object({
  error: z.string(),
}).describe("A business logic error occurred during crypto update.");

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.");

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. User does not have ADMIN privileges.");

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.");

export const patchCryptoSchema = {
  tags: ["crypto", "admin"],
  summary: "Update cryptocurrency data",
  description: "Allows administrators to update existing cryptocurrency information. Requires authentication and admin privileges.",
  security: [{ bearerAuth: [] }],

  params: z.object({
    id: z.string().describe("Unique identifier of the cryptocurrency to update.").meta({
      example: "id102082198-y3t190293i1mkd-192l12p",
    }),
  }),

  body: z.object({
    name: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The crypto name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The crypto name exceeds the maximum number of characters (256)." })
      .optional()
      .describe("New name of the cryptocurrency.")
      .meta({
        example: "Ethereum",
      }),

    ticker: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The crypto ticker doesn't meet the minimum number of characters (2)." })
      .max(24, { error: "The crypto ticker exceeds the maximum number of characters (24)." })
      .toUpperCase()
      .optional()
      .describe("New ticker symbol for the cryptocurrency (must be uppercase).")
      .meta({
        example: "ETH",
      }),

    blockchain: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The blockchain name doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The blockchain name exceeds the maximum number of characters (256)." })
      .optional()
      .describe("New blockchain network name where the cryptocurrency operates.")
      .meta({
        example: "Ethereum",
      }),

    protocol: z.string({ error: "The value entered isn't a string." })
      .min(2, { error: "The protocol doesn't meet the minimum number of characters (2)." })
      .max(256, { error: "The protocol exceeds the maximum number of characters (256)." })
      .optional()
      .describe("New protocol or standard used by the cryptocurrency (optional).")
      .meta({
        example: "ERC-20",
      }),
  }),

  response: {
    200: z.object({
      message: z.string().describe("Success message."),
    }).describe("Cryptocurrency updated successfully."),

    400: z.union([validationErrorSchema, serviceErrorSchema])
      .describe("Bad Request — Validation failure or business rule violation."),

    401: unauthorizedErrorSchema
      .describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema
      .describe("Forbidden — User does not have ADMIN privileges."),

    404: notFoundErrorSchema
      .describe("Not Found — The specified cryptocurrency does not exist."),

    500: internalErrorSchema
      .describe("Internal Server Error — Unexpected failure during crypto update."),
  },
}