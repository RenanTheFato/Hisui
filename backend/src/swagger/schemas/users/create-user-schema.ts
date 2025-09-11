import { z } from "zod/v4";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.");

const serviceErrorSchema = z.object({
  error: z.string(),
}).describe("A business logic error occurred during user creation.");

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.");

export const createUserSchema = {
  tags: ["user"],
  summary: "Create a new user account",
  description: "Registers a new user by validating the provided credentials, hashing the password, and storing the user in the system.",
  body: z.object({
    email: z.email({ message: "The value has entered isn't a email or the email is invalid." })
      .min(2, { message: "The email must have at least 2 characters." })
      .describe("User email address (must be unique in the system).")
      .meta({
        example: "johndoe@email.com"
      }),
    
    password: z.string()
      .min(8, { message: "Password must contain at least 8 characters." })
      .max(128, { message: "Password cannot exceed 128 characters." })
      .refine((password) => /[A-Z]/.test(password), { message: "Password must contain at least one uppercase letter." })
      .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number." })
      .refine((password) => /[@#$*&]/.test(password), { message: "Password must contain at least one special character ('@', '#', '$', '*', '&')." })
      .describe("User password with security constraints.")
      .meta({
        example: "your_very_strong_password"
      }),
    
    username: z.string()
      .min(2, { message: "The username must have at least 2 characters." })
      .max(128, { message: "The username cannot exceed 128 characters." })
      .describe("The display name of the user.")
      .meta({
        example: "John Doe"
      }),
  }),
  response: {
    201: z.object({
      message: z.string().describe("Success message."),
    }).describe("User account created successfully."),
    
    400: z.union([validationErrorSchema, serviceErrorSchema])
      .describe("Bad Request — Validation failure or business rule violation."),
    
    500: internalErrorSchema
      .describe("Internal Server Error — Unexpected failure during user creation."),
  }
};
