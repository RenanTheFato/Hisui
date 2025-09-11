import { z } from "zod/v4";

export const verifyEmailSchema = {
  tags: ["user", "email"],
  summary: "Verify user email",
  description: "Validates the verification token sent to the user's email address. If valid, activates the user's account.",
  querystring: z.object({
    token: z.string()
      .min(1, { message: "Token is required" })
      .describe("Verification token received via email.")
      .meta({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }),
  }),
  response: {
    200: z.string()
      .describe("Returns an HTML page indicating successful email verification."),

    400: z.string()
      .describe("Returns an HTML page indicating that the verification token is invalid or expired."),

    500: z.string()
      .describe("Returns an HTML page indicating an unexpected server error."),
  },
}
