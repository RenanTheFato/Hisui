import { z } from "zod/v4";

const validationErrorSchema = z.object({
  error: z.string(),
}).describe("Invalid request. Missing or incorrect parameters.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. User is not allowed to view this portfolio.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("The requested portfolio was not found.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const viewPortfolioAssetsSchema = {
  tags: ["portfolio"],
  summary: "View assets of a portfolio",
  description: "Retrieves all assets (stocks and cryptocurrencies) associated with a specific portfolio owned by the authenticated user. Requires authentication via bearer token.",
  security: [{ bearerAuth: [] }],
  params: z.object({
    portfolioId: z.string().uuid().describe("Unique identifier of the portfolio.").meta({
      example: "b9f22a84-4a30-4dfc-8d3d-729ea32f6f53"
    }),
  }),
  response: {
    200: z.object({
      message: z.string().describe("Success message."),
      assets: z.object({
        stocks: z.array(z.object({
          name: z.string().describe("Name of the stock."),
          ticker: z.string().describe("Stock ticker symbol."),
          company_name: z.string().describe("Company name associated with the stock."),
        })).describe("List of stock assets in the portfolio."),
        cryptos: z.array(z.object({
          name: z.string().describe("Name of the cryptocurrency."),
          ticker: z.string().describe("Cryptocurrency ticker symbol."),
          blockchain: z.string().describe("Blockchain network where the crypto operates."),
        })).describe("List of cryptocurrency assets in the portfolio."),
      }),
    }).describe("Assets retrieved successfully."),
    400: validationErrorSchema.describe("Bad Request — Missing or invalid portfolio ID."),
    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),
    403: forbiddenErrorSchema.describe("Forbidden — The user is not allowed to view this portfolio."),
    404: notFoundErrorSchema.describe("Not Found — Portfolio does not exist."),
    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during asset retrieval."),
  }
}