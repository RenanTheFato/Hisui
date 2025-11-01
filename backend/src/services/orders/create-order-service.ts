import { Action, AssetType } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { sendOrderConfirmationEmail } from "../../packages/order-mail-package.js";

interface CreateOrder {
  portfolioId: string,
  userId: string,
  ticker: string,
  type: AssetType,
  action: Action,
  order_price: number,
  order_currency: string,
  amount: number,
  order_execution_date: Date,
  fees: number | null | undefined,
  tax_amount: number | null | undefined
}

export class CreateOrderService {
  async execute({ portfolioId, userId, ticker, type, action, order_price, order_currency, amount, order_execution_date, fees, tax_amount }: CreateOrder) {

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
      throw new Error("You are not allowed to modify this portfolio")
    }

    switch (type) {
      case "STOCK":
        const stock = await prisma.stocks.findUnique({
          where: { ticker }
        })
        if (!stock) {
          throw new Error(`The stock ${ticker} doesn't exist in the database`)
        }
        break

      case "CRYPTO":
        const crypto = await prisma.cryptos.findUnique({
          where: { ticker }
        })
        if (!crypto) {
          throw new Error(`The crypto ${ticker} doesn't exist in the database`)
        }
        break

      default:
        throw new Error(`Invalid asset type: ${type}`)
    }

    const order = await prisma.$transaction(async (tx) => {
      if (action === "SELL") {
        const hasAsset = await tx.orders.findFirst({
          where: {
            portfolio_id: portfolio.id,
            asset_type: type,
            action: "BUY",
            ...(type === "STOCK") ? { stock_ticker: ticker } : { crypto_ticker: ticker }
          }
        })

        if (!hasAsset) {
          throw new Error(`You don't own ${ticker} in this portfolio to can be sell it`)
        }
      }

      const newOrder = await tx.orders.create({
        data: {
          portfolio_id: portfolio.id,
          user_id: userId,
          asset_type: type,
          action,
          order_price,
          order_currency,
          amount,
          order_execution_date,
          fees,
          tax_amount,
          ...(type === "STOCK") ? { stock_ticker: ticker } : { crypto_ticker: ticker }
        }
      })
      return newOrder
    })
    
    const user = await prisma.users.findUnique({
      where: { 
        id: userId 
      },
      select: {
        email: true,
        username: true
      }
    })

    if (user && user.email) {
      sendOrderConfirmationEmail({
        email: user.email,
        username: user.username,
        ticker,
        type,
        action,
        order_price,
        order_currency,
        amount,
        order_execution_date,
        fees,
        tax_amount,
        orderId: order.id
      }).catch(error => {
        console.error('Failed to send order confirmation email:', error)
      })
    }

    return order
  }
}