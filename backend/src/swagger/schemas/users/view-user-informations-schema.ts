import { z } from "zod/v4";

export const viewUserInformationsSchema = {
  tags: ["user", "profile"],
  summary: "View authenticated user information",
  description: "Fetches the profile data of the currently authenticated user. Requires a valid JWT token.",
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      message: z.string().describe("Success message."),
      user: z.object({
        id: z.string().describe("Unique identifier of the user."),
        name: z.string().describe("User's full name."),
        email: z.email().describe("User's email address."),
        role: z.string().describe("User's role (e.g. ADMIN or USER)."),
        is_verified: z.boolean().describe("User Status"),
        created_at: z.iso.date().describe("Account creation timestamp."),
        updated_at: z.iso.date().describe("Last update timestamp."),
      }),
    }).describe("User data successfully fetched."),

    400: z.object({
      error: z.string(),
    }).describe("Missing user ID or user does not exist."),

    401: z.object({
      message: z.string(),
    }).describe("Unauthorized. Missing, invalid or expired JWT token."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}
