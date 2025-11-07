import { z } from "zod/v4";
import { Action, AssetType } from "@prisma/client";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("No orders found with the provided filters.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

const decimalToNumber = z.any()
  .transform(val => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'number') return val;
    if (val && typeof val === 'object' && 'toNumber' in val) {
      return val.toNumber();
    }
    return Number(val);
  })

const baseOrderSchema = z.object({
  id: z.string().describe("Unique identifier of the order."),

  user_id: z.string().describe("ID of the user who created the order."),

  asset_type: z.enum(["STOCK", "CRYPTO"]).describe("Type of asset (STOCK or CRYPTO)."),

  action: z.enum(Action).describe("Type of action (BUY or SELL)."),

  order_price: decimalToNumber.pipe(z.number()).describe("Price per unit of the asset."),

  order_currency: z.string().describe("Currency used for the order price."),

  amount: decimalToNumber.pipe(z.number()).describe("Quantity of the asset being ordered."),

  order_execution_date: z.date().describe("Execution date of the order."),

  fees: decimalToNumber.pipe(z.number()).nullable().describe("Transaction fees applied to the order."),

  tax_amount: decimalToNumber.pipe(z.number()).nullable().describe("Tax amount applied to the order."),

  stock_ticker: z.string().nullable().describe("Stock ticker symbol (if asset type is STOCK)."),

  crypto_ticker: z.string().nullable().describe("Crypto ticker symbol (if asset type is CRYPTO)."),

  portfolio_name: z.string().nullable().describe("Name of the portfolio where the order belongs."),

  created_at: z.date().describe("Date and time when the order was created."),

  updated_at: z.date().describe("Date and time when the order was last updated."),
})

export const listOrdersSchema = {
  tags: ["orders"],
  summary: "List user orders with filters",
  description: "Retrieves a paginated list of orders for the authenticated user. Supports multiple filters such as ticker, type, action, amount, and portfolio.",
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    ticker: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Asset ticker symbol used for filtering.")
      .meta({ example: "BTC" }),

    type: z.enum(AssetType, { error: "Invalid asset type provided." })
      .optional()
      .describe("Type of asset (e.g., CRYPTO or STOCK).")
      .meta({ example: "CRYPTO" }),

    action: z.enum(Action, { error: "Invalid action type provided." })
      .optional()
      .describe("Type of order action (e.g., BUY or SELL).")
      .meta({ example: "BUY" }),

    order_price: z.number({ error: "The value entered isn't a number." })
      .optional()
      .describe("Exact price value of the order.")
      .meta({ example: 1250.50 }),

    order_currency: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Currency used in the order (case insensitive).")
      .meta({ example: "USD" }),

    amount: z.number({ error: "The value entered isn't a number." })
      .optional()
      .describe("Amount of assets in the order.")
      .meta({ example: 0.75 }),

    portfolio_id: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Portfolio identifier for filtering orders.")
      .meta({ example: "af453b2e-6f7c-4c1b-9e12-9b321dbb2c71" }),

    page: z.coerce.number({ error: "The page must be a number." })
      .min(1, { error: "The page must be at least 1." })
      .default(1)
      .describe("Page number for pagination.")
      .meta({ example: 1 }),

    limit: z.coerce.number({ error: "The limit must be a number." })
      .min(1, { error: "The limit must be at least 1." })
      .max(100, { error: "The limit cannot exceed 100." })
      .default(20)
      .describe("Number of records per page (max 100).")
      .meta({ example: 20 }),
  }),

  response: {
    200: z.object({
      page: z.number().describe("Current page number."),
      limit: z.number().describe("Number of records per page."),
      total: z.number().describe("Total number of orders matching the filters."),
      totalPages: z.number().describe("Total number of available pages."),
      orders: z.object({
        crypto: z.array(baseOrderSchema.extend({
          asset_type: z.literal("CRYPTO"),
        })).optional()
          .describe("List of cryptocurrency orders."),
        stock: z.array(baseOrderSchema.extend({
          asset_type: z.literal("STOCK"),
        })).optional()
          .describe("List of stock orders."),
      }).describe("Grouped list of user orders by asset type."),
    }).describe("Orders listed successfully."),

    400: validationErrorSchema.describe("Bad Request — Validation failure or invalid parameters."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    404: notFoundErrorSchema.describe("Not Found — No orders found with the provided filters."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during order listing."),
  }
}