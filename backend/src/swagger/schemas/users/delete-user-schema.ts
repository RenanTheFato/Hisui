import { z } from "zod/v4";

export const deleteUserSchema = {
  tags: ["user"],
  summary: "Delete a user by ID",
  description: "Removes a registered user from the system using their unique identifier (ID). Requires authentication.",
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    204: z.object({}).describe("Deleted successful, no content on response."),
    
    400: z.object({
      error: z.string(),
    }).describe("Invalid or missing user ID, or an error occurred while attempting to delete the user."),
  },
}