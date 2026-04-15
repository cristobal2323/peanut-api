/*
  Warnings:

  - You are about to drop the column `ageYears` on the `Dog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dog" DROP COLUMN "ageYears",
ADD COLUMN     "birthDate" DATE;
