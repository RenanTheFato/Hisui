import { prisma } from "../../../config/prisma.js";
import { Crypto } from "../../../models/crypto-model.js";

export class CreateCryptoService{
  async execute({ name, ticker, blockchain, protocol }: Omit<Crypto, 'id' | 'created_at' | 'updated_at'>){

    const isCryptoAlreadyExists = await prisma.cryptos.findFirst({
      where: {
        ticker,
      }
    })

    if (isCryptoAlreadyExists) {
      throw new Error(`The crypto ${ticker} has been already registered`)
    }

    await prisma.cryptos.create({
      data: {
        name,
        ticker,
        blockchain,
        protocol,
      }
    })
  }
}