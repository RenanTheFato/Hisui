import { z } from "zod";
import dayjs from "dayjs";

const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  code: z.string(),
  error: z.string(),
  message: z.string(),
}).describe("Input validation failed due to incorrect or missing data.")

const unauthorizedErrorSchema = z.object({
  error: z.string(),
}).describe("Unauthorized. Missing or invalid user ID.")

const notFoundErrorSchema = z.object({
  error: z.string(),
}).describe("No news found with the provided filters.")

const internalErrorSchema = z.object({
  error: z.string(),
}).describe("Unexpected internal server error.")


export const searchNewsSchema = {
  tags: ["news"],
  summary: "Search news with filters and pagination",
  description: "Allows authenticated users to search for news based on multiple filters such as title, author, publisher, and date range.",
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    title: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter news by title (case-insensitive).")
      .meta({ example: "Artificial Intelligence" }),

    author: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter news by author name (case-insensitive).")
      .meta({ example: "John Doe" }),

    publisher_name: z.string({ error: "The value entered isn't a string." })
      .optional()
      .describe("Filter news by publisher name (case-insensitive).")
      .meta({ example: "Tech Times" }),

    published_at: z.string({ message: "The value entered isn't a string." })
      .refine((val) =>
        dayjs(val, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).isValid(),
        { message: "The 'published_at' date must be in format YYYY/MM/DD HH:mm or YYYY/MM/DD" }
      )
      .optional()
      .describe("Exact publication date to search for (format: YYYY/MM/DD HH:mm or YYYY/MM/DD).")
      .meta({ example: "2024/11/07" }),

    published_gte: z.string({ message: "The value entered isn't a string." })
      .refine((val) =>
        dayjs(val, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).isValid(),
        { message: "The 'published_gte' date must be in format YYYY/MM/DD HH:mm or YYYY/MM/DD" }
      )
      .optional()
      .describe("Minimum publication date (greater than or equal).")
      .meta({ example: "2024/10/01" }),

    published_lte: z.string({ message: "The value entered isn't a string." })
      .refine((val) =>
        dayjs(val, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).isValid(),
        { message: "The 'published_lte' date must be in format YYYY/MM/DD HH:mm or YYYY/MM/DD" }
      )
      .optional()
      .describe("Maximum publication date (less than or equal).")
      .meta({ example: "2024/11/07" }),

    order: z.enum(["asc", "desc"], { error: "The order must be 'asc' or 'desc'." })
      .default("desc")
      .optional()
      .describe("Sort order for publication date (ascending or descending).")
      .meta({ example: "desc" }),

    page: z.coerce.number({ error: "The page must be a number." })
      .min(1, { error: "The page must be at least 1." })
      .default(1)
      .describe("Page number for pagination (minimum 1).")
      .meta({ example: 1 }),

    limit: z.coerce.number({ error: "The limit must be a number." })
      .min(1, { error: "The limit must be at least 1." })
      .max(100, { error: "The limit cannot exceed 100." })
      .default(20)
      .describe("Number of results per page (1–100).")
      .meta({ example: 20 }),
  }),
  response: {
    200: z.object({
      page: z.number().describe("Current page number."),
      limit: z.number().describe("Results per page."),
      total: z.number().describe("Total number of results."),
      totalPages: z.number().describe("Total pages available."),
      news: z.array(
        z.object({
          id: z.string().uuid().describe("Unique ID of the news item."),
          title: z.string().describe("News title."),
          author: z.string().nullable().describe("Author of the news."),
          publisher_name: z.string().nullable().describe("Publisher name."),
          published_at: z.string().describe("Publication date."),
          content: z.string().nullable().describe("Main content or excerpt of the news."),
          created_at: z.string().describe("Creation date in the database."),
          updated_at: z.string().describe("Last update date in the database."),
        })
      ).describe("List of news matching the filters."),
    }).describe("News list successfully retrieved."),

    400: validationErrorSchema.describe("Bad Request — Validation failure."),

    401: unauthorizedErrorSchema.describe("Unauthorized — Missing or invalid user ID."),

    404: notFoundErrorSchema.describe("Not Found — No news matched the provided filters."),
    
    500: internalErrorSchema.describe("Internal Server Error — Unexpected failure during news search."),
  },
}