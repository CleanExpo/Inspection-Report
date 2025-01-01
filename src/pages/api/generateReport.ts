import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client';
import { generatePDF } from '../../utils/pdfGenerator';
import { sendReportEmail } from '../../utils/emailService';

const prisma = new PrismaClient();

interface ReportData {
  jobNumber: string;
  inspectionDate: string;
  clientName: string;
  propertyAddress: string;
  damageType: string;
  description: string;
  recommendations: string;
  inspectorName: string;
  propertyImage: string;
  claimImage: string;
  clientEmail?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const reportData = req.body as ReportData;

  // Validate required fields
  if (!reportData.propertyImage || !reportData.claimImage) {
    return res.status(400).json({ error: "Property and claim images are required." });
  }

  if (!reportData.jobNumber || !reportData.inspectionDate || !reportData.clientName || !reportData.propertyAddress) {
    return res.status(400).json({ error: "Basic inspection details are required." });
  }

  try {
    // Create report record in database
    const report = await prisma.report.create({
      data: {
        jobNumber: reportData.jobNumber,
        inspectionDate: new Date(reportData.inspectionDate),
        clientName: reportData.clientName,
        propertyAddress: reportData.propertyAddress,
        damageType: reportData.damageType,
        description: reportData.description,
        recommendations: reportData.recommendations,
        inspectorName: reportData.inspectorName,
        propertyImage: reportData.propertyImage,
        claimImage: reportData.claimImage,
        status: 'processing'
      }
    });

    // Generate PDF
    const pdfUrl = await generatePDF({
      id: report.id,
      ...reportData
    });

    // Update report with PDF URL
    const updatedReport = await prisma.report.update({
      where: { id: report.id },
      data: {
        pdfUrl,
        status: 'completed'
      }
    });

    // Send email if client email is provided
    if (reportData.clientEmail) {
      const emailSent = await sendReportEmail({
        to: reportData.clientEmail,
        jobNumber: reportData.jobNumber,
        clientName: reportData.clientName,
        inspectorName: reportData.inspectorName,
        pdfUrl
      });

      if (emailSent) {
        await prisma.report.update({
          where: { id: report.id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
            status: 'emailed'
          }
        });
      }
    }

    // Return success response with report data
    res.status(200).json({
      message: "Report generated successfully.",
      reportId: report.id,
      reportData: updatedReport,
      pdfUrl,
      generatedAt: new Date().toISOString(),
      status: 'completed'
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      error: "Failed to generate report.",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default handler;
