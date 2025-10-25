/*
  Warnings:

  - You are about to drop the `Assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_asset_ticker_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AssetsToPortfolio" DROP CONSTRAINT "_AssetsToPortfolio_A_fkey";

-- DropTable
DROP TABLE "public"."Assets";

-- DropTable
DROP TABLE "public"."Order";

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order" (
    "id" TEXT NOT NULL,
    "action" "public"."Action" NOT NULL,
    "order_price" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(16,8) NOT NULL,
    "order_execution_date" TIMESTAMP(3) NOT NULL,
    "asset_ticker" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_ticker_key" ON "public"."assets"("ticker");

-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_asset_ticker_fkey" FOREIGN KEY ("asset_ticker") REFERENCES "public"."assets"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "public"."portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssetsToPortfolio" ADD CONSTRAINT "_AssetsToPortfolio_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
