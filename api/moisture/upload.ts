import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable body parsing, handle it manually with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper to parse form data
const parseForm = async (req: NextApiRequest): Promise<{
  fields: Fields;
  files: Files;
}> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filename: (_name: string, _ext: string, part: formidable.Part) => {
        const uniqueName = `${uuidv4()}${path.extname(part.originalFilename || '')}`;
        return uniqueName;
      },
    });

    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);
    const fileArray = files.file as File | File[] | undefined;
    if (!fileArray) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFiles = Array.isArray(fileArray) ? fileArray : [fileArray];

    const results = uploadedFiles.map(file => ({
      url: `/uploads/${path.basename(file.filepath)}`,
      filename: path.basename(file.filepath),
      originalName: file.originalFilename,
      size: file.size,
      type: file.mimetype
    }));

    return res.status(200).json({ files: results });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
