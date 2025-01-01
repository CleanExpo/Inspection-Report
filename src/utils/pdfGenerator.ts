import PDFDocument from 'pdfkit';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';

interface ReportData {
  id: string;
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
}

export async function generatePDF(reportData: ReportData): Promise<string> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  // Collect PDF chunks
  doc.on('data', (chunk) => chunks.push(chunk));

  // Add company logo/header
  doc.fontSize(20).text('Inspection Report', { align: 'center' });
  doc.moveDown();

  // Add report details
  doc.fontSize(12);
  doc.text(`Job Number: ${reportData.jobNumber}`);
  doc.text(`Date: ${new Date(reportData.inspectionDate).toLocaleDateString()}`);
  doc.text(`Client: ${reportData.clientName}`);
  doc.text(`Property Address: ${reportData.propertyAddress}`);
  doc.moveDown();

  // Add damage details
  doc.fontSize(14).text('Damage Assessment', { underline: true });
  doc.fontSize(12);
  doc.text(`Type of Damage: ${reportData.damageType}`);
  doc.moveDown();
  doc.text('Description:', { underline: true });
  doc.text(reportData.description);
  doc.moveDown();

  // Add images
  try {
    // Property Image
    doc.addPage();
    doc.fontSize(14).text('Property Front', { align: 'center' });
    const propertyImageResponse = await fetch(reportData.propertyImage);
    const propertyImageBuffer = Buffer.from(await propertyImageResponse.arrayBuffer());
    doc.image(propertyImageBuffer, {
      fit: [500, 400],
      align: 'center',
      valign: 'center'
    });

    // Claim Image
    doc.addPage();
    doc.fontSize(14).text('Damage Documentation', { align: 'center' });
    const claimImageResponse = await fetch(reportData.claimImage);
    const claimImageBuffer = Buffer.from(await claimImageResponse.arrayBuffer());
    doc.image(claimImageBuffer, {
      fit: [500, 400],
      align: 'center',
      valign: 'center'
    });
  } catch (error) {
    console.error('Error adding images to PDF:', error);
  }

  // Add recommendations
  doc.addPage();
  doc.fontSize(14).text('Recommendations', { underline: true });
  doc.fontSize(12);
  doc.text(reportData.recommendations);
  doc.moveDown();

  // Add inspector signature
  doc.moveDown(2);
  doc.text(`Inspector: ${reportData.inspectorName}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);

  // Finalize PDF
  doc.end();

  // Convert chunks to buffer
  const pdfBuffer = Buffer.concat(chunks);

  // Upload to Google Cloud Storage
  const storage = new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET!);
  const fileName = `reports/${reportData.id}/${reportData.jobNumber}-report.pdf`;
  const file = bucket.file(fileName);

  // Create write stream and upload
  await new Promise((resolve, reject) => {
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: 'application/pdf',
      },
    });

    const readStream = new Readable();
    readStream.push(pdfBuffer);
    readStream.push(null);

    writeStream.on('error', reject);
    writeStream.on('finish', resolve);

    readStream.pipe(writeStream);
  });

  // Make the file publicly accessible
  await file.makePublic();

  // Return the public URL
  return `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET}/${fileName}`;
}
