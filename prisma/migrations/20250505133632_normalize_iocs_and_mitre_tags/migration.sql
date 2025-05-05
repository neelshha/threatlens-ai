-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled Threat Report',
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ioc" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "Ioc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MitreTag" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "MitreTag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ioc" ADD CONSTRAINT "Ioc_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MitreTag" ADD CONSTRAINT "MitreTag_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
