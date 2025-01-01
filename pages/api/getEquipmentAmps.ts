import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const equipmentAmps = [
    { name: "Air Movers - Low", amps: 1 },
    { name: "Air Movers - High", amps: 1.5 },
    { name: "LGR Dehumidifiers", amps: 3.4 },
    { name: "Desiccant Dehumidifiers", amps: 8.5 },
    { name: "Air Scrubber (AFD's)", amps: 1.5 },
    { name: "Heat Box", amps: 6.5 },
  ];

  res.status(200).json(equipmentAmps);
};

export default handler;
