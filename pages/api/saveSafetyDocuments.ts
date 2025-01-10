import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public/safety-docs');
    await fs.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB for safety documents
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const jobId = Array.isArray(fields.jobId) ? fields.jobId[0] : fields.jobId;
    const documentType = Array.isArray(fields.documentType) ? fields.documentType[0] : fields.documentType;

    if (!jobId || !documentType) {
      return res.status(400).json({ error: 'Job ID and document type are required' });
    }

    const uploadedFiles = Array.isArray(files.documents) ? files.documents : [files.documents];
    const savedDocuments = await Promise.all(
      uploadedFiles
        .filter((file): file is formidable.File => file !== undefined)
        .map(async (file) => {
          const filePath = `/safety-docs/${path.basename(file.filepath)}`;
          
          // Save document reference in database
          const document = await prisma.authorityForm.create({
            data: {
              jobId: jobId as string,
              formType: documentType as string,
              status: 'SUBMITTED',
              data: {
                filePath,
                originalName: file.originalFilename,
                mimeType: file.mimetype,
                size: file.size
              },
              submittedAt: new Date()
            }
          });

          return {
            id: document.id,
            filePath,
            originalName: file.originalFilename,
            type: documentType
          };
        })
    );

    return res.status(200).json({
      message: 'Safety documents uploaded successfully',
      documents: savedDocuments
    });
  } catch (error) {
    console.error('Safety document upload error:', error);
    return res.status(500).json({ error: 'Failed to upload safety documents' });
  }
}
