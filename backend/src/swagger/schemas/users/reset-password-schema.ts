import { z } from "zod/v4";

export const resetPasswordSchema = {
  tags: ["user", "password"],
  summary: "Reset user password",
  description: "Allows an authenticated user to change their account password by providing the old password and a new valid password.",
  security: [{ bearerAuth: [] }],
  body: z.object({
    old_password: z.string({ message: "The provided value must be a string." })
      .describe("The current password of the user.")
      .meta({
        example: "oldPassword123!"
      }),

    new_password: z.string({ message: "The provided value must be a string." })
      .min(8, { message: "The password doesn't meet the minimum number of characters (8)." })
      .max(128, { message: "The password has exceeded the character limit (128)." })
      .refine((password) => /[A-Z]/.test(password), { message: "Password must contain at least one uppercase letter." })
      .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number." })
      .refine((password) => /[@#$*&]/.test(password), { message: "Password must contain at least one of these special characters ('@' '#' '$' '*' '&')." })
      .describe("The new password. Must follow security rules (uppercase, number, special character).")
      .meta({
        example: "NewPassword456*"
      }),
  }),
  response: {
    200: z.object({
      message: z.string().describe("Password reset successful."),
    }).describe("Password updated successfully."),

    400: z.object({
      message: z.string(),
      errors: z.array(z.object({
        code: z.string(),
        message: z.string(),
        path: z.string(),
      })).optional(),
    }).describe("Validation error or user not found."),

    401: z.object({
      error: z.string(),
    }).describe("The entered password and the current password do not match."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}
