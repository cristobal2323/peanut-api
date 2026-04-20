-- AlterTable
ALTER TABLE "NotificationSettings" ADD COLUMN     "matchesEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sightingsEnabled" BOOLEAN NOT NULL DEFAULT true;
