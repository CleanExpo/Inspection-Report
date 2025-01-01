import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { jobNumber } = req.query;

  if (!jobNumber) {
    return res.status(400).json({ error: "Job number is required" });
  }

  try {
    // Create SVG with gradient background and improved styling
    const createPhotoPlaceholder = (title: string, subtitle: string) => {
      const svg = `
        <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
            </linearGradient>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e4e7" stroke-width="1"/>
            </pattern>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.1"/>
            </filter>
          </defs>
          <rect width="800" height="400" fill="url(#bg)"/>
          <rect width="800" height="400" fill="url(#grid)"/>
          <rect width="800" height="400" fill="rgba(255,255,255,0.7)"/>
          <text x="400" y="160" font-family="Arial" font-size="36" font-weight="bold" text-anchor="middle" fill="#374151" filter="url(#shadow)">
            ${title}
          </text>
          <text x="400" y="220" font-family="Arial" font-size="24" text-anchor="middle" fill="#4b5563">
            ${subtitle}
          </text>
          <g transform="translate(350,260)">
            <rect x="0" y="0" width="100" height="50" rx="6" fill="#e5e7eb" filter="url(#shadow)"/>
            <text x="50" y="32" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#4b5563">PHOTO</text>
          </g>
        </svg>
      `;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    };

    // Simulate fetching consolidated data from the database
    const reportData = {
      administration: {
        jobNumber,
        clientName: "John Doe",
        siteAddress: "123 Main Street",
      },
      lossDetails: {
        causeOfLoss: "Pipe Burst",
        claimType: "Water",
        classification: "Class 2 (Moderate Damage)",
        category: "Category 1 (Clean Water)",
      },
      photos: [
        {
          url: createPhotoPlaceholder("Living Room Ceiling", "Water Damage Documentation"),
          annotation: "Water stains and bubbling paint visible on ceiling",
          location: "Living Room",
          timestamp: new Date().toISOString()
        },
        {
          url: createPhotoPlaceholder("Kitchen Floor", "Water Damage Assessment"),
          annotation: "Water pooling and laminate lifting observed",
          location: "Kitchen",
          timestamp: new Date().toISOString()
        }
      ],
      // Add other sections here as needed
    };

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ error: "Failed to fetch report data" });
  }
};

export default handler;
