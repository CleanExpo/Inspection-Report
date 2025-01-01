/*
  Warnings:

  - You are about to drop the column `equipment` on the `MoistureReading` table. All the data in the column will be lost.
  - Added the required column `equipmentId` to the `MoistureReading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MoistureReading" DROP COLUMN "equipment",
ADD COLUMN     "equipmentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "calibrationDate" TIMESTAMP(3) NOT NULL,
    "nextCalibrationDue" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "MoistureReading_equipmentId_idx" ON "MoistureReading"("equipmentId");

-- AddForeignKey
ALTER TABLE "MoistureReading" ADD CONSTRAINT "MoistureReading_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
