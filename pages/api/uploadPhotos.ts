import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../lib/prisma';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/photos');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  }
});

// Helper to handle multer upload
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

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
    // Handle file upload
    await runMiddleware(req, res, upload.array('photos', 10));

    const files = (req as any).files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { jobId, category } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Save photo references in database
    const savedPhotos = await Promise.all(files.map(async (file: Express.Multer.File) => {
      const relativePath = `/photos/${path.basename(file.path)}`;
      
      const photo = await prisma.moistureReading.create({
        data: {
          jobId,
          location: category || 'general',
          type: 'PHOTO',
          value: 0, // Not applicable for photos
          notes: relativePath
        }
      });

      return {
        id: photo.id,
        url: relativePath,
        category: category || 'general'
      };
    }));

    return res.status(200).json({
      message: 'Photos uploaded successfully',
      photos: savedPhotos
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    if (error instanceof Error && error.message === 'Invalid file type') {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    return res.status(500).json({ error: 'Failed to upload photos' });
  }
}
