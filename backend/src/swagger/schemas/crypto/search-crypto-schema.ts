import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing query parameters.");

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.");

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("No cryptocurrencies were found with the provided filters.");

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.");

export const searchCryptoSchema = {
  tags: ["crypto", "user"],
  summary: "Search for cryptocurrencies",
  description: "Allows authenticated users to search for cryptocurrencies using filters such as name, ticker, blockchain, and protocol. Supports pagination via 'page' and 'limit' query parameters.",
  security: [{ bearerAuth: [] }],

  querystring: z.object({
    name: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by cryptocurrency name.")
      .meta({ example: "Bitcoin" }),

    ticker: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by cryptocurrency ticker symbol.")
      .meta({ example: "BTC" }),

    blockchain: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by blockchain name.")
      .meta({ example: "Ethereum" }),

    protocol: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by protocol or token standard.")
      .meta({ example: "ERC-20" }),

    page: z.coerce.number({ error: "The page must be a number." })
      .min(1, { error: "The page must be at least 1." })
      .default(1)
      .describe("Pagination page number (starts from 1).")
      .meta({ example: 1 }),

    limit: z.coerce.number({ error: "The limit must be a number." })
      .min(1, { error: "The limit must be at least 1." })
      .max(100, { error: "The limit cannot exceed 100." })
      .default(20)
      .describe("Maximum number of results per page (1-100).")
      .meta({ example: 20 }),
  }),

  response: {
    200: z.object({
        page: z.number().describe("Current page number."),
        limit: z.number().describe("Number of items per page."),
        total: z.number().describe("Total number of cryptocurrencies found."),
        totalPages: z.number().describe("Total number of pages available."),
        cryptos: z.array(
            z.object({
              id: z.string().describe("Unique identifier of the cryptocurrency."),
              name: z.string().describe("Name of the cryptocurrency."),
              ticker: z.string().describe("Ticker symbol of the cryptocurrency."),
              blockchain: z.string().nullable().describe("Blockchain where the crypto operates."),
              protocol: z.string().nullable().describe("Protocol or token standard (if applicable)."),
              created_at: z.date().describe("Date and time the crypto was created."),
              updated_at: z.date().describe("Date and time the crypto was last updated."),
            })
          )
          .describe("List of cryptocurrencies that match the search filters."),
      })
      .describe("List of cryptocurrencies retrieved successfully."),

    400: validationErrorSchema.describe("Bad Request — Validation failure in query parameters."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    404: notFoundErrorSchema.describe("Not Found — No cryptocurrency matched the filters."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during crypto search."),
  },
}