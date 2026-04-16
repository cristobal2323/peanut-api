-- CreateEnum
CREATE TYPE "SightingStatus" AS ENUM ('ACTIVE', 'FOUND', 'CLOSED');

-- AlterTable
ALTER TABLE "Sighting" ADD COLUMN     "status" "SightingStatus" NOT NULL DEFAULT 'ACTIVE';
