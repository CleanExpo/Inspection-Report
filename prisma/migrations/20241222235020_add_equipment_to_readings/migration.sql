/*
  Warnings:

  - Added the required column `equipmentId` to the `MoistureReading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MoistureReading" ADD COLUMN     "equipmentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "MoistureReading_equipmentId_idx" ON "MoistureReading"("equipmentId");

-- AddForeignKey
ALTER TABLE "MoistureReading" ADD CONSTRAINT "MoistureReading_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
