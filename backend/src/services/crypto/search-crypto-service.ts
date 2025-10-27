import { prisma } from "../../config/prisma.js";

interface SearchCryptoParams {
  name?: string,
  ticker?: string,
  blockchain?: string,
  protocol?: string,
  page: number,
  limit: number,
}

export class SearchCryptoService {
  async execute(params: SearchCryptoParams) {
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

        case 'blockchain':
          whereClause.blockchain = {
            contains: value,
            mode: 'insensitive'
          }
          break

        case 'protocol':
          whereClause.protocol = {
            contains: value,
            mode: 'insensitive'
          }
          break

        default:
          break
      }
    })

    const [cryptos, total] = await Promise.all([
      prisma.cryptos.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.cryptos.count({
        where: whereClause
      })
    ])

    if (cryptos.length === 0) {
      throw new Error("No crypto found with the provided filters")
    }

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      cryptos
    }
  }
}