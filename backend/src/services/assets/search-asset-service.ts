import { prisma } from "../../config/prisma.js";

interface SearchAssetParams {
  name?: string,
  ticker?: string,
  type?: string,
  sector?: string,
  company_name?: string,
  country?: string,
  exchange?: string,
  page: number,
  limit: number,
}

export class SearchAssetService {
  async execute(params: SearchAssetParams) {
    const { page, limit, ...filters } = params

    const whereClause: any = {}
    const skip = (page - 1) * limit

    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof typeof filters]

      if (!value) return

      switch (key) {
        case 'name':
          whereClause.name = {
            contains: value,
            mode: 'insensitive'
          }
          break

        case 'ticker':
          whereClause.ticker = {
            contains: value,
            mode: 'default'
          }
          break

        case 'type':
          whereClause.type = {
            equals: value,
            mode: 'insensitive'
          }
          break

        case 'sector':
          whereClause.sector = {
            equals: value,
            mode: 'insensitive'
          }
          break

        case 'company_name':
          whereClause.company_name = {
            contains: value,
            mode: 'insensitive'
          }
          break

        case 'country':
          whereClause.country = {
            equals: value,
            mode: 'insensitive'
          }
          break

        case 'exchange':
          whereClause.exchange = {
            equals: value,
            mode: 'insensitive'
          }
          break

        default:
          break
      }
    })

    const [assets, total] = await Promise.all([
      prisma.assets.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.assets.count({
        where: whereClause
      })
    ])

    if (assets.length === 0) {
      throw new Error("No assets found with the provided filters")
    }

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      assets
    }
  }
}