import { Orders } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../config/prisma.js";

export class ViewPortfolioAssetsService {
  async execute({ user_id: userId, portfolio_id: portfolioId }: Pick<Orders, 'user_id' | 'portfolio_id'>) {

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId
      },
      select: {
        id: true,
        user_id: true
      }
    })

    if (!portfolio) {
      throw new Error("The portfolio doesn't exists")
    }

    if (portfolio.user_id !== userId) {
      throw new Error("You are not allowed to view this portfolio")
    }

    const stocks = await prisma.orders.findMany({
      where: {
        portfolio_id: portfolio.id,
        asset_type: "STOCK",
        stock_ticker: {
          not: null
        }
      },
      select: {
        stock_ticker: true,
        stock: {
          select: {
            name: true,
            ticker: true,
            company_name: true,
          }
        }
      },
      distinct: ["stock_ticker"]
    })

    const cryptos = await prisma.orders.findMany({
      where: {
        portfolio_id: portfolio.id,
        asset_type: "CRYPTO",
        crypto_ticker: {
          not: null
        }
      },
      select: {
        crypto_ticker: true,
        crypto: {
          select: {
            name: true,
            ticker: true,
            blockchain: true
          }
        }
      },
      distinct: ["crypto_ticker"]
    })

    return {
      stocks: stocks.filter(order => order.stock !== null).map(order => order.stock!),
      cryptos: cryptos.filter(order => order.crypto !== null).map(order => order.crypto!),
    }

  }
}