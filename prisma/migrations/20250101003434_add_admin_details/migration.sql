-- CreateTable
CREATE TABLE "AdminDetails" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "otherPhone" TEXT,
    "timeOnSite" TEXT,
    "timeOffSite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminDetails_email_idx" ON "AdminDetails"("email");
