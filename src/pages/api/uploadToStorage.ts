import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucketName = process.env.GOOGLE_STORAGE_BUCKET;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, imageName } = req.body;

  if (!imageBase64 || !imageName) {
    return res.status(400).json({ error: "Image and image name are required." });
  }

  try {
    const bucket = storage.bucket(bucketName!);
    const fileName = `${uuidv4()}-${imageName}`;
    const file = bucket.file(fileName);

    // Convert Base64 to Buffer and save the image to Google Cloud Storage
    const buffer = Buffer.from(imageBase64.split(',')[1], "base64");
    await file.save(buffer, {
      metadata: { contentType: "image/jpeg" },
    });

    // Make the file publicly accessible
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    res.status(200).json({ imageUrl: publicUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image." });
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
