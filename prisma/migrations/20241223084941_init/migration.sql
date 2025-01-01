/*
  Warnings:

  - You are about to drop the column `equipmentId` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `humidity` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `pressure` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the `Equipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReadingDataPoint` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Annotation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `equipment` to the `MoistureReading` table without a default value. This is not possible if the table is not empty.
  - Made the column `floorPlanId` on table `MoistureReading` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MoistureReading" DROP CONSTRAINT "MoistureReading_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "MoistureReading" DROP CONSTRAINT "MoistureReading_floorPlanId_fkey";

-- DropForeignKey
ALTER TABLE "ReadingDataPoint" DROP CONSTRAINT "ReadingDataPoint_readingId_fkey";

-- DropIndex
DROP INDEX "FloorPlan_jobId_level_key";

-- DropIndex
DROP INDEX "MoistureReading_equipmentId_idx";

-- DropIndex
DROP INDEX "MoistureReading_floor_idx";

-- DropIndex
DROP INDEX "MoistureReading_room_idx";

-- AlterTable
ALTER TABLE "Annotation" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FloorPlan" ALTER COLUMN "width" SET DEFAULT 0,
ALTER COLUMN "width" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "height" SET DEFAULT 0,
ALTER COLUMN "height" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "scale" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "MoistureReading" DROP COLUMN "equipmentId",
DROP COLUMN "humidity",
DROP COLUMN "notes",
DROP COLUMN "pressure",
DROP COLUMN "temperature",
ADD COLUMN     "equipment" TEXT NOT NULL,
ALTER COLUMN "room" SET DATA TYPE TEXT,
ALTER COLUMN "floor" SET DATA TYPE TEXT,
ALTER COLUMN "floorPlanId" SET NOT NULL;

-- DropTable
DROP TABLE "Equipment";

-- DropTable
DROP TABLE "ReadingDataPoint";

-- DropEnum
DROP TYPE "AnnotationType";

-- DropEnum
DROP TYPE "EquipmentStatus";

-- DropEnum
DROP TYPE "EquipmentType";

-- DropEnum
DROP TYPE "MoistureUnit";

-- CreateTable
CREATE TABLE "DataPoint" (
    "id" TEXT NOT NULL,
    "moistureReadingId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataPoint_moistureReadingId_idx" ON "DataPoint"("moistureReadingId");

-- AddForeignKey
ALTER TABLE "MoistureReading" ADD CONSTRAINT "MoistureReading_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "FloorPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPoint" ADD CONSTRAINT "DataPoint_moistureReadingId_fkey" FOREIGN KEY ("moistureReadingId") REFERENCES "MoistureReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;
