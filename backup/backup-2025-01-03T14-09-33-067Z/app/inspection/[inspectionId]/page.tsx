import { notFound } from 'next/navigation';
import prisma from '../../lib/prisma';

export default async function InspectionPage({
  params
}: {
  params: { inspectionId: string };
}) {
  const inspection = await prisma.inspectionReport.findUnique({
    where: { id: params.inspectionId },
    include: {
      client: true,
      photos: true,
      readings: true
    }
  });

  if (!inspection) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Inspection Details
      </h1>
      {/* Inspection details rendering */}
    </div>
  );
}
