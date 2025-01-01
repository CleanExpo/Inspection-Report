/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `DataPoint` table. All the data in the column will be lost.
  - You are about to drop the `Annotation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Equipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FloorPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Annotation" DROP CONSTRAINT "Annotation_floorPlanId_fkey";

-- DropForeignKey
ALTER TABLE "DataPoint" DROP CONSTRAINT "DataPoint_moistureReadingId_fkey";

-- DropForeignKey
ALTER TABLE "MoistureReading" DROP CONSTRAINT "MoistureReading_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "MoistureReading" DROP CONSTRAINT "MoistureReading_floorPlanId_fkey";

-- DropIndex
DROP INDEX "DataPoint_moistureReadingId_idx";

-- DropIndex
DROP INDEX "MoistureReading_equipmentId_idx";

-- DropIndex
DROP INDEX "MoistureReading_floorPlanId_idx";

-- DropIndex
DROP INDEX "MoistureReading_jobId_idx";

-- AlterTable
ALTER TABLE "DataPoint" DROP COLUMN "updatedAt",
ADD COLUMN     "depth" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MoistureReading" ADD COLUMN     "humidity" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pressure" DOUBLE PRECISION,
ADD COLUMN     "temperature" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Annotation";

-- DropTable
DROP TABLE "Equipment";

-- DropTable
DROP TABLE "FloorPlan";

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "claimedBy" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimType" TEXT NOT NULL,
    "claimReference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimReference_key" ON "Claim"("claimReference");

-- CreateIndex
CREATE INDEX "Claim_reportId_status_idx" ON "Claim"("reportId", "status");

-- CreateIndex
CREATE INDEX "Claim_claimReference_idx" ON "Claim"("claimReference");

-- AddForeignKey
ALTER TABLE "DataPoint" ADD CONSTRAINT "DataPoint_moistureReadingId_fkey" FOREIGN KEY ("moistureReadingId") REFERENCES "MoistureReading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
