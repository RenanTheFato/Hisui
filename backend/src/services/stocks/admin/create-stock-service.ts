import { prisma } from "../../../config/prisma.js";
import { Stock } from "../../../models/stock-model.js";

export class CreateStockService{
  async execute({ name, ticker, sector, company_name, country, exchange }: Omit<Stock, 'id' | 'created_at' | 'updated_at'>){

    const isStockAlreadyExists = await prisma.stocks.findFirst({
      where: {
        ticker,
      }
    })

    if (isStockAlreadyExists) {
      throw new Error(`The stock ${ticker} has been already registered`)
    }

    await prisma.stocks.create({
      data: {
        name,
        ticker,
        sector,
        company_name,
        country,
        exchange
      }
    })
  }
}