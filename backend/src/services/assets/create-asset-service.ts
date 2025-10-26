import { prisma } from "../../config/prisma.js";
import { Assets } from "../../models/asset-model.js";

export class CreateAssetService{
  async execute({ name, ticker, type, sector, company_name, country, exchange }: Omit<Assets, 'id' | 'created_at' | 'updated_at'>){

    const isAssetAlreadyExists = await prisma.assets.findFirst({
      where: {
        ticker,
      }
    })

    if (isAssetAlreadyExists) {
      throw new Error(`The asset ${ticker} has been already registered`)
    }

    await prisma.assets.create({
      data: {
        name,
        ticker,
        type,
        sector,
        company_name,
        country,
        exchange
      }
    })
  }
}