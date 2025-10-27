import { prisma } from "../../../config/prisma.js";
import { Crypto } from "../../../models/crypto-model.js";

export class PatchCryptoService {
  async execute({ id, ticker, ...data }: Partial<Omit<Crypto, 'created_at' | 'updated_at'>>) {

    const isCryptoExists = await prisma.cryptos.findFirst({
      where: {
        id,
      }
    })

    if (!isCryptoExists) {
      throw new Error(`The crypto doesn't exists`)
    }

    if (ticker) {
      const checkIfCryptoTickerIsInUse = await prisma.cryptos.findFirst({
        where: {
          ticker,
          NOT: {
            id
          }
        }
      })
      if (checkIfCryptoTickerIsInUse) {
        throw new Error(`The new ticker: ${ticker} is already in use`)
      }
    }

    await prisma.cryptos.update({
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