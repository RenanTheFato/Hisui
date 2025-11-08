import { z } from "zod/v4";

export const viewUserInformationsSchema = {
  tags: ["user", "profile"],
  summary: "View authenticated user information",
  description: "Fetches the profile data of the currently authenticated user. Requires a valid JWT token.",
  security: [
    {
      bearerAuth: []
    }
  ],
  response: {
    200: z.object({
      message: z.string()
        .describe("Success message."),
      user: z.object({
        id: z.string()
          .describe("Unique identifier of the user.")
          .meta({
            example: "example_id"
          }),
        email: z.email().describe("User's email address.")
          .meta({
            example: "johndoe@email.com"
          }),
        username: z.string()
          .describe("User's full name.")
          .meta({
            example: "johndoe"
          }),
        role: z.string()
          .describe("User's role (e.g. ADMIN or USER).")
          .meta({
            example: "user or admin example"
          }),
        is_verified: z.boolean()
          .describe("User Status")
          .meta({
            example: true
          }),
        created_at: z.date().describe("Account creation timestamp."),
        updated_at: z.date().describe("Last update timestamp."),
      }),
    }).describe("User data successfully fetched."),

    400: z.object({
      error: z.string(),
    }).describe("Missing user ID or user does not exist."),

    401: z.object({
      error: z.string(),
    }).describe("Unauthorized. Missing, invalid or expired JWT token."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}
