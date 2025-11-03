import { FastifyReply, FastifyRequest } from "fastify";
import { SearchNewsService } from "../../services/news/search-news-service.js";
import { z } from "zod";
import dayjs from "dayjs";

export class SearchNewsController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const userId = req.user.id as string

    if (!userId) {
      return rep.status(401).send({ error: "The user id is missing" })
    }

    const searchNewsValidate = z.object({
      title: z.string({ error: "The value entered isn't a string." }).optional(),

      author: z.string({ error: "The value entered isn't a string." }).optional(),

      publisher_name: z.string({ error: "The value entered isn't a string." }).optional(),

      published_at: z.string({ message: "The value entered isn't a string." })
        .refine((val) => dayjs(val, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).isValid(), { message: "The 'published_at' date must be in format YYYY/MM/DD HH:mm or YYYY/MM/DD" })
        .optional(),

      published_gte: z.string({ message: "The value entered isn't a string." })
        .refine((val) => dayjs(val, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).isValid(), { message: "The 'published_gte' date must be in format YYYY/MM/DD HH:mm or YYYY/MM/DD" })
        .optional(),

      published_lte: z.string({ message: "The value entered isn't a string." })
        .refine((val) => dayjs(val, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).isValid(), { message: "The 'published_lte' date must be in format YYYY/MM/DD HH:mm or YYYY/MM/DD" })
        .optional(),

      order: z.enum(['asc', 'desc'] as const, { error: "The order must be 'asc' or 'desc' " })
        .default("desc")
        .optional(),

      page: z.coerce.number({ error: "The page must be a number." })
        .min(1, { error: "The page must be at least 1." })
        .default(1),

      limit: z.coerce.number({ error: "The limit must be a number." })
        .min(1, { error: "The limit must be at least 1." })
        .max(100, { error: "The limit cannot exceed 100." })
        .default(20),
    })

    let queryParams = req.query as z.infer<typeof searchNewsValidate>

    try {
      queryParams = searchNewsValidate.parse(req.query)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/"),
        }))

        return rep.status(400).send({ message: "Validation Error Occurred", errors })
      }
    }

    try {
      const searchNewsService = new SearchNewsService()

      const publishedAt = queryParams.published_at ? dayjs(queryParams.published_at, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).toDate() : undefined

      const publishedGte = queryParams.published_gte ? dayjs(queryParams.published_gte, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).toDate() : undefined

      const publishedLte = queryParams.published_lte ? dayjs(queryParams.published_lte, ["YYYY/MM/DD HH:mm", "YYYY/MM/DD"], true).toDate() : undefined

      const result = await searchNewsService.execute({ ...queryParams, published_at: publishedAt, published_gte: publishedGte, published_lte: publishedLte })

      return rep.status(200).send(result)
    } catch (error: any) {
      switch (error.message) {
        case "No news found with the provided filters":
          return rep.status(404).send({ error: error.message })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
  }
}