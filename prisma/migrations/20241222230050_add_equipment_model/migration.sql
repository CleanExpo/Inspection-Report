-- CreateEnum
CREATE TYPE "MoistureUnit" AS ENUM ('WME', 'REL', 'PCT');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('MOISTURE_METER', 'THERMAL_CAMERA', 'HYGROMETER');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED');

-- CreateTable
CREATE TABLE "MoistureReading" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "locationX" DOUBLE PRECISION NOT NULL,
    "locationY" DOUBLE PRECISION NOT NULL,
    "room" VARCHAR(50) NOT NULL,
    "floor" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoistureReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingDataPoint" (
    "id" TEXT NOT NULL,
    "readingId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" "MoistureUnit" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "depth" DOUBLE PRECISION,

    CONSTRAINT "ReadingDataPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "calibrationDate" TIMESTAMP(3) NOT NULL,
    "nextCalibrationDue" TIMESTAMP(3) NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoistureReading_jobId_idx" ON "MoistureReading"("jobId");

-- CreateIndex
CREATE INDEX "MoistureReading_room_idx" ON "MoistureReading"("room");

-- CreateIndex
CREATE INDEX "MoistureReading_floor_idx" ON "MoistureReading"("floor");

-- CreateIndex
CREATE INDEX "ReadingDataPoint_readingId_idx" ON "ReadingDataPoint"("readingId");

-- CreateIndex
CREATE INDEX "ReadingDataPoint_timestamp_idx" ON "ReadingDataPoint"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "Equipment_serialNumber_idx" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");

-- CreateIndex
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");

-- AddForeignKey
ALTER TABLE "ReadingDataPoint" ADD CONSTRAINT "ReadingDataPoint_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "MoistureReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;
