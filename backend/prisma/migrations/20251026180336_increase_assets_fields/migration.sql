/*
  Warnings:

  - Added the required column `market` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."assets" ADD COLUMN     "market" TEXT NOT NULL;
