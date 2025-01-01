import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

interface MulterRequest extends Request {
  files: Express.Multer.File[];
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      // Generate unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.'));
    }
  },
});

// Wrap multer middleware in a promise
const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (...args: any[]) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

interface PhotoData {
  filename: string;
  path: string;
  annotation: string;
  jobNumber: string;
}

const handler = async (req: NextApiRequest & MulterRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Handle file upload
    await runMiddleware(req, res, upload.array('photos'));

    // Get job number and annotations from the request
    const jobNumber = req.body.jobNumber as string;
    const annotations = JSON.parse((req.body.annotations as string) || '[]');

    // Save file information and annotations
    const photoData: PhotoData[] = req.files.map((file, index) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      annotation: annotations[index] || '',
      jobNumber,
    }));

    // Log the upload data
    console.log('Upload successful:', {
      jobNumber,
      photos: photoData,
    });

    res.status(200).json({
      message: "Photos uploaded successfully",
      data: photoData,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to upload photos",
    });
  }
};

export default handler;
