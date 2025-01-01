import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { includeStandards } = req.body;

  if (typeof includeStandards === "undefined") {
    return res.status(400).json({ error: "Include standards flag is required." });
  }

  try {
    // Mock logic to save data (replace with actual database or service logic)
    console.log("Syncing standards:", includeStandards);
    res.status(200).json({ message: "Standards synced successfully." });
  } catch (error) {
    console.error("Error syncing standards:", error);
    res.status(500).json({ error: "Failed to sync standards." });
  }
};

export default handler;
