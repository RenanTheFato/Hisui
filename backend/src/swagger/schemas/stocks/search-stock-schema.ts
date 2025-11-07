import { z } from "zod/v4"

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing query parameters.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("No stocks were found with the provided filters.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const searchStockSchema = {
  tags: ["stocks", "user"],
  summary: "Search for stocks",
  description:"Allows authenticated users to search for registered stocks using filters such as name, ticker, sector, company name, country, and exchange. Supports pagination via 'page' and 'limit' query parameters.",
  security: [{ bearerAuth: [] }],

  querystring: z.object({
    name: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by stock name.")
      .meta({ example: "Apple Inc." }),

    ticker: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by stock ticker symbol.")
      .meta({ example: "AAPL" }),

    sector: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by economic sector.")
      .meta({ example: "Technology" }),

    company_name: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by company name.")
      .meta({ example: "Apple Inc." }),

    country: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by country acronym or name.")
      .meta({ example: "US" }),

    exchange: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter results by exchange name.")
      .meta({ example: "NASDAQ" }),

    page: z.coerce.number({ error: "The page must be a number." })
      .min(1, { error: "The page must be at least 1." })
      .default(1)
      .describe("Pagination page number (starts from 1).")
      .meta({ example: 1 }),

    limit: z.coerce.number({ error: "The limit must be a number." })
      .min(1, { error: "The limit must be at least 1." })
      .max(100, { error: "The limit cannot exceed 100." })
      .default(20)
      .describe("Maximum number of results per page (1–100).")
      .meta({ example: 20 }),
  }),

  response: {
    200: z.object({
        page: z.number().describe("Current page number."),
        limit: z.number().describe("Number of items per page."),
        total: z.number().describe("Total number of stocks found."),
        totalPages: z.number().describe("Total number of pages available."),
        stocks: z.array(
            z.object({
              id: z.string().describe("Unique identifier of the stock."),
              name: z.string().describe("Name of the stock."),
              ticker: z.string().describe("Ticker symbol of the stock."),
              sector: z.string().nullable().describe("Sector of the company."),
              company_name: z.string().nullable().describe("Full company name."),
              country: z.string().nullable().describe("Country of origin or listing."),
              exchange: z.string().nullable().describe("Stock exchange where it is listed."),
              created_at: z.date().describe("Date and time the stock was created."),
              updated_at: z.date().describe("Date and time the stock was last updated."),
            })
          )
          .describe("List of stocks that match the search filters."),
      })
      .describe("List of stocks retrieved successfully."),

    400: validationErrorSchema.describe("Bad Request — Validation failure in query parameters."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    404: notFoundErrorSchema.describe("Not Found — No stock matched the provided filters."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during stock search."),
  },
}