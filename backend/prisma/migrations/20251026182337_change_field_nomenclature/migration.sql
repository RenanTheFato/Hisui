/*
  Warnings:

  - You are about to drop the column `companyName` on the `assets` table. All the data in the column will be lost.
  - Added the required column `company_name` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."assets" DROP COLUMN "companyName",
ADD COLUMN     "company_name" TEXT NOT NULL;
