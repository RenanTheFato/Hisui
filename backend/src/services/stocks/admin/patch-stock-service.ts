import { prisma } from "../../../config/prisma.js";
import { Stock } from "../../../models/stock-model.js";

export class PatchStockService {
  async execute({ id, ticker, ...data }: Partial<Omit<Stock, 'created_at' | 'updated_at'>>) {

    const isStockExists = await prisma.stocks.findFirst({
      where: {
        id,
      }
    })

    if (!isStockExists) {
      throw new Error(`The stock doesn't exists`)
    }

    if (ticker) {
      const checkIfStockTickerIsInUse = await prisma.stocks.findFirst({
        where: {
          ticker,
          NOT: {
            id
          }
        }
      })
      if (checkIfStockTickerIsInUse) {
        throw new Error(`The new ticker: ${ticker} is already in use`)
      }
    }

    await prisma.stocks.update({
      where: {
        id
      },
      data: {
        ...data,
        ...ticker && { ticker },
      }

    })
  }
}