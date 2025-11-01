import { Action, AssetType } from "@prisma/client";
import { AssertType } from "vitest";

export interface Order {
  id: string,
  action: Action,
  order_price: number,
  order_currency: string,
  amount: number,
  order_execution_date: Date,
  tax_amount: number | null | undefined,
  fees: number | null | undefined,
  asset_type: AssetType
  stock_ticker: string | null | undefined,
  crypto_ticker: string | null | undefined,
  user_id: string,
  portfolio_id: string,
  created_at: Date,
  updated_at: Date,
}