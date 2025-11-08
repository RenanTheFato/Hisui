import { z } from "zod/v4";

export const listAllUsersSchema = {
  tags: ["admin"],
  summary: "List all users",
  description: "Allows administrators to fetch all registered users. Requires authentication and admin role.",
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      message: z.string().describe("Success message."),
      users: z.array(z.object({
        id: z.string()
          .describe("Unique identifier of the user.")
          .meta({
            example: "example_id"
          }),
        email: z.email()
          .describe("User's email address.")
          .meta({
            example: "johndoe_admin@email.com"
          }),
        username: z.string()
          .describe("User's full name.")
          .meta({
            example: "super_admin"
          }),
        role: z.string()
          .describe("User's role (ADMIN or USER).")
          .meta({
            example: "user or admin example"
          }),
        is_verified: z.boolean().describe("User Status")
          .meta({
            example: true
          }),
        created_at: z.date().describe("User account creation date."),
        updated_at: z.date().describe("Last update date for the user."),
      })),
    }).describe("All users successfully fetched."),

    400: z.object({
      error: z.string(),
    }).describe("Missing or invalid user ID in request."),

    401: z.object({
      error: z.string(),
    }).describe("Unauthorized. Missing, invalid or expired JWT token."),

    403: z.object({
      error: z.string(),
    }).describe("Forbidden. User does not have ADMIN privileges."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}
