import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  error: z.string(),
  message: z.string(),
}).describe("Bad Request — Missing or invalid parameters.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const forbiddenErrorSchema = z.object({
  error: z.string(),
}).describe("Forbidden. User is not allowed to delete this order.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("Order not found.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")

export const deleteOrderSchema = {
  tags: ["orders"],
  summary: "Delete an existing order",
  description: `Deletes a specific order belonging to the authenticated user.The user must be the creator of the order. Requires authentication.`,
  security: [{ bearerAuth: [] }],

  params: z.object({
    orderId: z.string({ message: "Invalid order ID format." })
      .describe("Unique identifier of the order to be deleted.")
      .meta({ example: "a9f0e7c3-8b52-4c4e-9c3f-bb3d6f5e9b87" }),
  }),

  response: {
    204: z.object({}).describe("Order deleted successfully (no content)."),

    400: validationErrorSchema.describe("Bad Request — Validation failure or missing parameters."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    403: forbiddenErrorSchema.describe("Forbidden — User is not allowed to delete this order."),

    404: notFoundErrorSchema.describe("Not Found — The specified order does not exist."),

    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during order deletion."),
  },
}