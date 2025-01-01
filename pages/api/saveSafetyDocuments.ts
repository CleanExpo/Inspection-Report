import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    uploadDir: "./uploads",
    keepExtensions: true,
  });

  try {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ error: "Failed to save safety documents" });
      }

      console.log("Fields:", fields);
      console.log("Files:", files);

      // Example: Save uploaded files and signature to the database or file system
      await fs.mkdir("./uploads", { recursive: true });

      res.status(200).json({ message: "Safety documents saved successfully" });
    });
  } catch (error) {
    console.error("Error saving safety documents:", error);
    res.status(500).json({ error: "Failed to save safety documents" });
  }
};

export default handler;
