-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEARBY_LOST_REPORT';

-- AlterTable
ALTER TABLE "DeviceToken" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "NotificationSettings" ADD COLUMN     "nearbyEnabled" BOOLEAN NOT NULL DEFAULT true;
