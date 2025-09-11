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
        id: z.string().describe("Unique identifier of the user."),
        name: z.string().describe("User's full name."),
        email: z.email().describe("User's email address."),
        role: z.string().describe("User's role (ADMIN or USER)."),
        created_at: z.iso.date().describe("User account creation date."),
        updated_at: z.iso.date().describe("Last update date for the user."),
      })),
    }).describe("All users successfully fetched."),

    400: z.object({
      error: z.string(),
    }).describe("Missing or invalid user ID in request."),

    401: z.object({
      message: z.string(),
    }).describe("Unauthorized. Missing, invalid or expired JWT token."),

    403: z.object({
      error: z.string(),
    }).describe("Forbidden. User does not have ADMIN privileges."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}
