/*
  Warnings:

  - You are about to drop the column `asset_ticker` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "crypto_order";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "stock_order";

-- DropIndex
DROP INDEX "public"."orders_asset_type_asset_ticker_action_idx";

-- DropIndex
DROP INDEX "public"."orders_order_execution_date_idx";

-- DropIndex
DROP INDEX "public"."orders_portfolio_id_asset_ticker_idx";

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "asset_ticker",
ADD COLUMN     "crypto_ticker" TEXT,
ADD COLUMN     "stock_ticker" TEXT;

-- CreateIndex
CREATE INDEX "orders_portfolio_id_idx" ON "public"."orders"("portfolio_id");

-- CreateIndex
CREATE INDEX "orders_stock_ticker_idx" ON "public"."orders"("stock_ticker");

-- CreateIndex
CREATE INDEX "orders_crypto_ticker_idx" ON "public"."orders"("crypto_ticker");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_stock_ticker_fkey" FOREIGN KEY ("stock_ticker") REFERENCES "public"."stocks"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_crypto_ticker_fkey" FOREIGN KEY ("crypto_ticker") REFERENCES "public"."cryptos"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;
