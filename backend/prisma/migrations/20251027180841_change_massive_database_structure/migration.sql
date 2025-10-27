/*
  Warnings:

  - You are about to drop the column `userId` on the `portfolio` table. All the data in the column will be lost.
  - You are about to drop the `_AssetsToPortfolio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AssetType" AS ENUM ('STOCK', 'CRYPTO');

-- DropForeignKey
ALTER TABLE "public"."_AssetsToPortfolio" DROP CONSTRAINT "_AssetsToPortfolio_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AssetsToPortfolio" DROP CONSTRAINT "_AssetsToPortfolio_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."order" DROP CONSTRAINT "order_asset_ticker_fkey";

-- DropForeignKey
ALTER TABLE "public"."order" DROP CONSTRAINT "order_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."order" DROP CONSTRAINT "order_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."portfolio" DROP CONSTRAINT "portfolio_userId_fkey";

-- AlterTable
ALTER TABLE "public"."portfolio" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_AssetsToPortfolio";

-- DropTable
DROP TABLE "public"."assets";

-- DropTable
DROP TABLE "public"."order";

-- CreateTable
CREATE TABLE "public"."stocks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cryptos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "protocol" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cryptos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "action" "public"."Action" NOT NULL,
    "order_price" DECIMAL(10,2) NOT NULL,
    "order_currency" TEXT NOT NULL,
    "amount" DECIMAL(16,8) NOT NULL,
    "order_execution_date" TIMESTAMP(3) NOT NULL,
    "tax_amount" DECIMAL(10,2),
    "fees" DECIMAL(10,2),
    "asset_type" "public"."AssetType" NOT NULL,
    "asset_ticker" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stocks_ticker_key" ON "public"."stocks"("ticker");

-- CreateIndex
CREATE INDEX "stocks_ticker_idx" ON "public"."stocks"("ticker");

-- CreateIndex
CREATE INDEX "stocks_sector_idx" ON "public"."stocks"("sector");

-- CreateIndex
CREATE UNIQUE INDEX "cryptos_ticker_key" ON "public"."cryptos"("ticker");

-- CreateIndex
CREATE INDEX "cryptos_ticker_idx" ON "public"."cryptos"("ticker");

-- CreateIndex
CREATE INDEX "cryptos_blockchain_idx" ON "public"."cryptos"("blockchain");

-- CreateIndex
CREATE INDEX "orders_user_id_action_order_execution_date_idx" ON "public"."orders"("user_id", "action", "order_execution_date");

-- CreateIndex
CREATE INDEX "orders_portfolio_id_asset_ticker_idx" ON "public"."orders"("portfolio_id", "asset_ticker");

-- CreateIndex
CREATE INDEX "orders_asset_type_asset_ticker_action_idx" ON "public"."orders"("asset_type", "asset_ticker", "action");

-- CreateIndex
CREATE INDEX "orders_order_execution_date_idx" ON "public"."orders"("order_execution_date");

-- CreateIndex
CREATE INDEX "portfolio_user_id_idx" ON "public"."portfolio"("user_id");

-- AddForeignKey
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "stock_order" FOREIGN KEY ("asset_ticker") REFERENCES "public"."stocks"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "crypto_order" FOREIGN KEY ("asset_ticker") REFERENCES "public"."cryptos"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
