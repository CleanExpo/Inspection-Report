import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadPhoto } from '../../../utils/storage';
import type { PhotoUploadResponse } from '../../../types/photo';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PhotoUploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST requests are allowed'
    });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const jobNumber = fields.jobNumber?.[0];
    if (!jobNumber) {
      return res.status(400).json({
        success: false,
        message: 'Job number is required',
        error: 'Missing job number'
      });
    }

    const file = files.photo?.[0];
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided',
        error: 'Missing photo file'
      });
    }

    // Convert the temporary file to a File object
    const photoFile = new File(
      [await require('fs').promises.readFile(file.filepath)],
      file.originalFilename || 'photo.jpg',
      { type: file.mimetype || 'image/jpeg' }
    );

    // Upload to Google Cloud Storage
    const result = await uploadPhoto(photoFile, jobNumber);

    // Clean up temporary file
    await require('fs').promises.unlink(file.filepath);

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error handling photo upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
