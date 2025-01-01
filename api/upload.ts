import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { ImageUploadResponse } from '../types/inspection';

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ImageUploadResponse>
) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Method not allowed'
    });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to process upload',
          error: err.message
        });
      }

      const file = files.image?.[0];
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
          error: 'No image file provided'
        });
      }

      // Generate public URL for the uploaded file
      const fileName = file.newFilename;
      const publicUrl = `/uploads/${fileName}`;

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        url: publicUrl
      });
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export default handler;
