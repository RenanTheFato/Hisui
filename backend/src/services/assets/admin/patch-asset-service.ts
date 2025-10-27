import { prisma } from "../../../config/prisma.js";
import { Assets } from "../../../models/asset-model.js";

export class PatchAssetService {
  async execute({ id, ticker, ...data }: Partial<Omit<Assets, 'created_at' | 'updated_at'>>) {

    const isAssetExists = await prisma.assets.findFirst({
      where: {
        id,
      }
    })

    if (!isAssetExists) {
      throw new Error(`The asset doesn't exists`)
    }

    if (ticker) {
      const checkIfAssetTickerIsInUse = await prisma.assets.findFirst({
        where: {
          ticker,
          NOT: {
            id
          }
        }
      })
      if (checkIfAssetTickerIsInUse) {
        throw new Error(`The new ticker: ${ticker} is already in use`)
      }
    }

    await prisma.assets.update({
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