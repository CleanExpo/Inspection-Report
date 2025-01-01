/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentId` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `floorPlanId` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `humidity` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `pressure` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MoistureReading` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Claim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataPoint` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jobNumber` to the `MoistureReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `MoistureReading` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DataPoint" DROP CONSTRAINT "DataPoint_moistureReadingId_fkey";

-- DropIndex
DROP INDEX "MoistureReading_createdAt_idx";

-- DropIndex
DROP INDEX "MoistureReading_jobId_idx";

-- DropIndex
DROP INDEX "MoistureReading_room_floor_idx";

-- AlterTable
ALTER TABLE "MoistureReading" DROP COLUMN "createdAt",
DROP COLUMN "equipmentId",
DROP COLUMN "floor",
DROP COLUMN "floorPlanId",
DROP COLUMN "humidity",
DROP COLUMN "jobId",
DROP COLUMN "pressure",
DROP COLUMN "room",
DROP COLUMN "temperature",
DROP COLUMN "updatedAt",
ADD COLUMN     "inspectionDay" INTEGER,
ADD COLUMN     "jobNumber" TEXT NOT NULL,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Claim";

-- DropTable
DROP TABLE "DataPoint";

-- CreateTable
CREATE TABLE "MoistureData" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "clientName" TEXT,
    "jobAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT,
    "category" TEXT,
    "floorPlan" TEXT,
    "totalEquipmentPower" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoistureData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION,
    "operationalStatus" TEXT,
    "power" DOUBLE PRECISION,
    "mode" TEXT,
    "targetHumidity" DOUBLE PRECISION,
    "fanSpeed" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "locationX" DOUBLE PRECISION NOT NULL,
    "locationY" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT,

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoistureDataVersion" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoistureDataVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoSaveConfig" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "interval" INTEGER NOT NULL DEFAULT 5,
    "maxVersions" INTEGER NOT NULL DEFAULT 10,
    "includeDrafts" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoSaveConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MoistureData_jobNumber_key" ON "MoistureData"("jobNumber");

-- CreateIndex
CREATE INDEX "MoistureData_jobNumber_idx" ON "MoistureData"("jobNumber");

-- CreateIndex
CREATE INDEX "Equipment_jobNumber_idx" ON "Equipment"("jobNumber");

-- CreateIndex
CREATE INDEX "Annotation_jobNumber_idx" ON "Annotation"("jobNumber");

-- CreateIndex
CREATE INDEX "MoistureDataVersion_jobNumber_idx" ON "MoistureDataVersion"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AutoSaveConfig_jobNumber_key" ON "AutoSaveConfig"("jobNumber");

-- CreateIndex
CREATE INDEX "AutoSaveConfig_jobNumber_idx" ON "AutoSaveConfig"("jobNumber");

-- CreateIndex
CREATE INDEX "MoistureReading_jobNumber_idx" ON "MoistureReading"("jobNumber");

-- AddForeignKey
ALTER TABLE "MoistureReading" ADD CONSTRAINT "MoistureReading_jobNumber_fkey" FOREIGN KEY ("jobNumber") REFERENCES "MoistureData"("jobNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_jobNumber_fkey" FOREIGN KEY ("jobNumber") REFERENCES "MoistureData"("jobNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_jobNumber_fkey" FOREIGN KEY ("jobNumber") REFERENCES "MoistureData"("jobNumber") ON DELETE CASCADE ON UPDATE CASCADE;
