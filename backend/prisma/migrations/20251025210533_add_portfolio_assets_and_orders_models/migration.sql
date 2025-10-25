-- CreateEnum
CREATE TYPE "public"."Action" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "public"."portfolio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
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

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AssetsToPortfolio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssetsToPortfolio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assets_ticker_key" ON "public"."Assets"("ticker");

-- CreateIndex
CREATE INDEX "_AssetsToPortfolio_B_index" ON "public"."_AssetsToPortfolio"("B");

-- AddForeignKey
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_asset_ticker_fkey" FOREIGN KEY ("asset_ticker") REFERENCES "public"."Assets"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "public"."portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssetsToPortfolio" ADD CONSTRAINT "_AssetsToPortfolio_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssetsToPortfolio" ADD CONSTRAINT "_AssetsToPortfolio_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
