/*
  Warnings:

  - You are about to drop the column `market` on the `assets` table. All the data in the column will be lost.
  - Added the required column `exchange` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."assets" DROP COLUMN "market",
ADD COLUMN     "exchange" TEXT NOT NULL;
