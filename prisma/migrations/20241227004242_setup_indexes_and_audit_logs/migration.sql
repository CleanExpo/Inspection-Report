-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER,
    "requestBody" TEXT,
    "responseBody" TEXT,
    "metadata" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "DataPoint_createdAt_idx" ON "DataPoint"("createdAt");

-- CreateIndex
CREATE INDEX "MoistureReading_jobId_idx" ON "MoistureReading"("jobId");

-- CreateIndex
CREATE INDEX "MoistureReading_createdAt_idx" ON "MoistureReading"("createdAt");

-- CreateIndex
CREATE INDEX "MoistureReading_room_floor_idx" ON "MoistureReading"("room", "floor");
