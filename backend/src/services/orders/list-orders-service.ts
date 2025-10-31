import { Action, AssetType, Orders } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

interface ListOrdersParams {
  ticker?: string,
  type?: AssetType,
  action?: Action,
  order_price?: number,
  order_currency?: string,
  amount?: number,
  portfolio_id?: string,
  page: number,
  limit: number,
}

export class ListOrdersService {
  async execute(params: ListOrdersParams, { user_id: userId }: Pick<Orders, 'user_id'>) {
    const { page, limit, ...filters } = params

    const whereClause: any = {}
    const skip = (page - 1) * limit

    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof typeof filters]

      if (!value) return

      switch (key) {
        case 'ticker':
          whereClause.OR = [
            {
              stock_ticker: {
                contains: value,
                mode: 'insensitive'
              }
            },
            {
              crypto_ticker: {
                contains: value,
                mode: 'insensitive'
              }
            }
          ]
          break

        case 'type':
          whereClause.asset_type = value
          break

        case 'action':
          whereClause.action = value
          break

        case 'order_price':
          whereClause.order_price = value
          break

        case 'order_currency':
          whereClause.order_currency = {
            contains: value,
            mode: 'insensitive'
          }
          break

        case 'amount':
          whereClause.amount = value
          break

        case 'portfolio_id':
          whereClause.portfolio_id = value
          break

        default:
          break
      }
    })

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: {
          user_id: userId,
          ...whereClause,
        },
        include: {
          portfolio: {
            select: {
              name: true
            }
          }
        },
        omit: {
          portfolio_id: true
        },
        skip,
        take: limit,
        orderBy: {
          order_price: 'asc'
        }
      }),
      prisma.orders.count({
        where: {
          user_id: userId,
          ...whereClause
        }
      })
    ])

    if (orders.length === 0) {
      throw new Error("No orders found with the provided filters")
    }

    const formattedOrders = orders.map(order => ({
      ...order,
      portfolio_name: order.portfolio.name || null,
      portfolio: undefined
    }))

    const cryptoOrders = formattedOrders.filter(order => order.asset_type === "CRYPTO")
    const stockOrders = formattedOrders.filter(order => order.asset_type === "STOCK")
    
    const aggroupFormattedOrders: { crypto?: typeof cryptoOrders, stock?: typeof stockOrders } = {}
    
    if (cryptoOrders.length > 0) {
      aggroupFormattedOrders.crypto = cryptoOrders
    }
    
    if (stockOrders.length > 0) {
      aggroupFormattedOrders.stock = stockOrders
    }

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders: aggroupFormattedOrders
    }
  }
}