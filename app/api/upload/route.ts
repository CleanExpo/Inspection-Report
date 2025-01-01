import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

// Load environment variables
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GOOGLE_STORAGE_BUCKET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileContent } = body;

    if (!fileName || !fileContent) {
      return NextResponse.json(
        { error: "File name and content are required." },
        { status: 400 }
      );
    }

    const bucket = storage.bucket(bucketName!);
    const file = bucket.file(fileName);

    // Save file to Google Cloud Storage
    await file.save(Buffer.from(fileContent, "base64"), {
      metadata: {
        contentType: "application/octet-stream",
      },
    });

    return NextResponse.json({ message: "File uploaded successfully." });
  } catch (error) {
    console.error("Error uploading to Google Cloud Storage:", error);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
