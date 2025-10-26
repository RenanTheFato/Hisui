/*
  Warnings:

  - Added the required column `companyName` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_currency` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."assets" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "sector" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."order" ADD COLUMN     "order_currency" TEXT NOT NULL;
