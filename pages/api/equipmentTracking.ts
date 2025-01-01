import { NextApiRequest, NextApiResponse } from "next";

interface Equipment {
  id: string;
  name: string;
  serialNumber?: string;
  status: 'in-use' | 'available' | 'maintenance';
  assignedDate?: string;
  returnDate?: string;
  notes?: string;
}

interface EquipmentTrackingRequest {
  jobNumber: string;
  equipmentList: Equipment[];
}

interface EquipmentTrackingResponse {
  message?: string;
  error?: string;
}

const validateEquipment = (equipment: Equipment): string[] => {
  const errors: string[] = [];

  if (!equipment.id) {
    errors.push("Equipment ID is required");
  }
  if (!equipment.name) {
    errors.push("Equipment name is required");
  }
  if (!equipment.status) {
    errors.push("Equipment status is required");
  }
  if (equipment.status === 'in-use' && !equipment.assignedDate) {
    errors.push("Assigned date is required for in-use equipment");
  }

  return errors;
};

const handler = async (
  req: NextApiRequest, 
  res: NextApiResponse<EquipmentTrackingResponse>
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobNumber, equipmentList } = req.body as EquipmentTrackingRequest;

  if (!jobNumber || !equipmentList || equipmentList.length === 0) {
    return res.status(400).json({ 
      error: "Job number and equipment list are required" 
    });
  }

  // Validate each piece of equipment
  const validationErrors: string[] = [];
  equipmentList.forEach((equipment, index) => {
    const errors = validateEquipment(equipment);
    if (errors.length > 0) {
      validationErrors.push(
        `Equipment ${index + 1} (${equipment.name || 'Unknown'}): ${errors.join(', ')}`
      );
    }
  });

  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: `Validation failed: ${validationErrors.join('; ')}`
    });
  }

  try {
    // Here you would typically:
    // 1. Validate the job number exists
    // 2. Update equipment status in database
    // 3. Create tracking records
    // 4. Update job records
    
    console.log(`Equipment tracked for job ${jobNumber}:`, 
      equipmentList.map(equipment => ({
        id: equipment.id,
        name: equipment.name,
        status: equipment.status,
        assignedDate: equipment.assignedDate,
        returnDate: equipment.returnDate,
        notes: equipment.notes
      }))
    );

    res.status(200).json({ 
      message: "Equipment tracking updated successfully" 
    });
  } catch (error) {
    console.error("Error tracking equipment:", error);
    res.status(500).json({ 
      error: "Failed to track equipment" 
    });
  }
};

export default handler;
