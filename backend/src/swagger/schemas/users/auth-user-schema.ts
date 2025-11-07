import { z } from "zod/v4";

export const authUserSchema = {
  tags: ["user", "auth"],
  summary: "Authenticate a user account",
  description: "Validates user credentials and returns an access token upon successful authentication.",
  body: z.object({
    email: z.email({ error: "The provided value must be a string or invalid email format." })
      .describe("User's email address. Must be unique in the system.")
      .meta({
        example: "johndoe@email.com"
      }),

    password: z.string({ error: "The provided value must be a string." })
      .describe("User's account password.")
      .meta({
        example: "your_very_strong_password"
      }),
  }),
  response: {
    200: z.object({
      token: z.string(),
    }).describe("Authentication successful. Returns a valid JWT token."),

    400: z.object({
      statusCode: z.number(),
      code: z.string(),
      error: z.string(),
      message: z.string(),
    }).describe("Invalid request payload. Validation failed for one or more fields."),

    401: z.object({
      error: z.string()
    }).describe("Authentication failed. Email or password is incorrect."),
  }
}