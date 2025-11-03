import { prisma } from "../../config/prisma.js";

interface SearchNewsParams {
  title?: string,
  author?: string,
  publisher_name?: string,
  published_at?: Date,
  published_gte?: Date,
  published_lte?: Date,
  order?: "asc" | "desc",
  page: number,
  limit: number,
}

export class SearchNewsService {
  async execute(params: SearchNewsParams) {
    const { page, limit, order = "desc", published_at, published_gte, published_lte, ...filters } = params

    const whereClause: any = {}
    const skip = (page - 1) * limit

    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof typeof filters]

      if (!value) return

      switch (key) {
        case "title":
          whereClause.title = {
            contains: value,
            mode: "insensitive",
          }
          break

        case "author":
          whereClause.author = {
            contains: value,
            mode: "insensitive",
          }
          break

        case "publisher_name":
          whereClause.publisher_name = {
            contains: value,
            mode: "insensitive",
          }
          break

        default:
          break
      }
    })

    if (published_at || published_gte || published_lte) {
      whereClause.published_at = {}

      if (published_at) {
        whereClause.published_at = published_at
      }

      if (published_gte) {
        whereClause.published_at.gte = published_gte
      }

      if (published_lte) {
        whereClause.published_at.lte = published_lte
      }
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          published_at: order,
        },
      }),
      prisma.news.count({
        where: whereClause,
      }),
    ])

    if (news.length === 0) {
      throw new Error("No news found with the provided filters")
    }

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      news,
    }
  }
}