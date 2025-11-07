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

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. The user is not allowed to modify this portfolio.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("The specified portfolio or asset was not found in the database.")

const serviceErrorSchema = z.object({
  error: z.string(),
}).describe("A business logic error occurred during order creation, such as attempting to sell an asset not owned by the user.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const createOrderSchema = {
  tags: ["orders", "portfolio"],
  summary: "Create a new order (buy or sell) in a portfolio",
  description: "Allows a user to register a new stock or cryptocurrency order (buy/sell) associated with an existing portfolio. Requires authentication via bearer token.",
  security: [{ bearerAuth: [] }],
  params: z.object({
    portfolioId: z.string().uuid().describe("Unique identifier of the portfolio.").meta({
      example: "c3df7d85-8cb1-42f9-90e0-f8b3a4cbb22f"
    }),
  }),
  body: z.object({
    ticker: z.string({ error: "The value has entered isn't an string." })
      .nonempty({ message: "The ticker cannot be empty" })
      .describe("Ticker symbol of the stock or cryptocurrency.")
      .meta({
        example: "BTC"
      }),
    type: z.enum(["STOCK", "CRYPTO"], { error: "The type must be one of the followings: STOCK, CRYPTO." })
      .describe("Asset type of the order (STOCK or CRYPTO).")
      .meta({
        example: "CRYPTO"
      }),
    action: z.enum(["BUY", "SELL"], { error: "The action must be one of the followings: BUY, SELL." })
      .describe("Type of order action (buy or sell).")
      .meta({
        example: "BUY"
      }),
    order_price: z.number({ error: "The value has entered isn't an number" })
      .positive({ error: "Order price must be positive" })
      .describe("Price per unit of the asset being ordered.")
      .meta({
        example: 64000.50
      }),
    order_currency: z.string({ error: "The value has entered isn't an string" })
      .min(1, { error: "The order currency doesn't meet the minimum number of characters (1)." })
      .nonempty({ error: "The order_currency name cannot be empty" })
      .toUpperCase()
      .describe("Currency used for the order price.")
      .meta({
        example: "USD"
      }),
    amount: z.number({ error: "The amount has entered isn't an number" })
      .positive({ error: "The order amount must be positive" })
      .describe("Quantity of the asset being ordered.")
      .meta({
        example: 0.5
      }),
    order_execution_date: z.string({ error: "Invalid date format" })
      .describe("Date and time when the order was executed, must follow the format YYYY/MM/DD HH:mm or YYYY/MM/DD.")
      .meta({
        example: "2025/05/21 14:30"
      }),
    tax_amount: z.number({ error: "The value has entered isn't an number" })
      .positive({ error: "Tax amount must be positive" })
      .nullable()
      .optional()
      .describe("Tax amount applied to the order, if any.")
      .meta({
        example: 12.5
      }),
    fees: z.number({ error: "The value has entered isn't an number" })
      .positive({ error: "Fees must be positive" })
      .nullable()
      .optional()
      .describe("Transaction fees applied to the order, if any.")
      .meta({
        example: 5.0
      }),
  }),
  response: {
    201: z.object({
      message: z.string().describe("Success message."),
      order: z.object({
        id: z.string().describe("Unique identifier of the created order."),
        portfolio_id: z.string().describe("ID of the portfolio where the order was registered."),
        user_id: z.string().describe("ID of the user who created the order."),
        asset_type: z.string().describe("Type of asset (STOCK or CRYPTO)."),
        action: z.string().describe("Type of action (BUY or SELL)."),
        order_price: z.number().describe("Price per unit of the asset."),
        order_currency: z.string().describe("Currency used for the order price."),
        amount: z.number().describe("Quantity of the asset being ordered."),
        order_execution_date: z.date().describe("Execution date of the order."),
        fees: z.number().nullable().describe("Transaction fees applied to the order."),
        tax_amount: z.number().nullable().describe("Tax amount applied to the order."),
        created_at: z.date().describe("Date and time when the order was created."),
        updated_at: z.date().describe("Date and time when the order was last updated."),
      }),
    }).describe("Order created successfully."),

    400: z.union([validationErrorSchema, serviceErrorSchema]).describe("Bad Request — Validation failure or business rule violation."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema.describe("Forbidden — User is not allowed to modify this portfolio."),

    404: notFoundErrorSchema.describe("Not Found — Portfolio or asset not found."),
    
    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during order creation."),
  }
}