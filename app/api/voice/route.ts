import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Configure the route options using the new metadata export
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const VOICE_COMMANDS = {
  ADD_NOTE: {
    patterns: ['add note', 'make note', 'note that', 'write down'],
    action: 'addNote',
    parameters: ['text']
  },
  ADD_DAMAGE: {
    patterns: ['add damage', 'record damage', 'damage noted'],
    action: 'addDamage',
    parameters: ['location', 'description']
  },
  UPDATE_STATUS: {
    patterns: ['update status', 'change status', 'set status'],
    action: 'updateStatus',
    parameters: ['status']
  },
  ADD_EQUIPMENT: {
    patterns: ['add equipment', 'record equipment', 'equipment used'],
    action: 'addEquipment',
    parameters: ['equipment']
  },
  START_INSPECTION: {
    patterns: ['start inspection', 'begin inspection', 'commence inspection'],
    action: 'startInspection',
    parameters: ['jobNumber', 'templateId']
  },
  END_INSPECTION: {
    patterns: ['end inspection', 'finish inspection', 'complete inspection'],
    action: 'endInspection',
    parameters: ['id']
  }
} as const;

export async function POST(request: Request) {
  try {
    const { command, inspectionId, templateId } = await request.json();

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Process voice command
    const matchedCommand = findMatchingCommand(command);
    if (!matchedCommand) {
      return NextResponse.json(
        { error: 'Command not recognized' },
        { status: 400 }
      );
    }

    // Execute command action
    const result = await executeCommand(matchedCommand, command, inspectionId, templateId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing voice command:', error);
    return NextResponse.json(
      { error: 'Failed to process voice command' },
      { status: 500 }
    );
  }
}

function findMatchingCommand(command: string): keyof typeof VOICE_COMMANDS | null {
  const normalizedCommand = command.toLowerCase().trim();

  for (const [key, value] of Object.entries(VOICE_COMMANDS)) {
    if (value.patterns.some(pattern => normalizedCommand.includes(pattern))) {
      return key as keyof typeof VOICE_COMMANDS;
    }
  }

  return null;
}

async function executeCommand(
  commandKey: keyof typeof VOICE_COMMANDS,
  rawCommand: string,
  inspectionId?: string,
  templateId?: string
) {
  const command = VOICE_COMMANDS[commandKey];
  const parameters: Record<string, string> = {};

  // Extract parameters from command text
  command.parameters.forEach(param => {
    const value = extractParameter(rawCommand, param);
    if (value) {
      parameters[param] = value;
    }
  });

  switch (commandKey) {
    case 'START_INSPECTION': {
      const jobNumber = parameters.jobNumber;
      if (!jobNumber || !templateId) {
        throw new Error('Job number and template ID are required to start inspection');
      }

      // Create a new inspection
      const inspection = await prisma.inspection.create({
        data: {
          jobNumber,
          templateId,
          status: 'in_progress',
          autoPopulatedFields: JSON.stringify({}),
          requiredInputFields: JSON.stringify([])
        }
      });

      return {
        action: command.action,
        inspectionId: inspection.id,
        status: 'success',
        message: `Started inspection for job ${jobNumber}`
      };
    }

    case 'END_INSPECTION': {
      if (!inspectionId) {
        throw new Error('Inspection ID is required to end inspection');
      }

      // Update inspection status
      const inspection = await prisma.inspection.update({
        where: { id: inspectionId },
        data: { status: 'completed' }
      });

      return {
        action: command.action,
        inspectionId: inspection.id,
        status: 'success',
        message: 'Inspection completed'
      };
    }

    case 'ADD_NOTE': {
      if (!inspectionId) {
        throw new Error('Inspection ID is required to add note');
      }

      const text = parameters.text;
      if (!text) {
        throw new Error('Note text is required');
      }

      // First verify the inspection exists
      const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId }
      });

      if (!inspection) {
        throw new Error('Inspection not found');
      }

      // Create the note
      const note = await prisma.inspectionNote.create({
        data: {
          inspectionId,
          content: text,
          type: 'voice'
        }
      });

      return {
        action: command.action,
        noteId: note.id,
        status: 'success',
        message: 'Note added'
      };
    }

    case 'ADD_DAMAGE': {
      if (!inspectionId) {
        throw new Error('Inspection ID is required to add damage');
      }

      const location = parameters.location;
      const description = parameters.description;
      if (!location || !description) {
        throw new Error('Location and description are required');
      }

      // First verify the inspection exists
      const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId }
      });

      if (!inspection) {
        throw new Error('Inspection not found');
      }

      // Create the damage record
      const damage = await prisma.inspectionDamage.create({
        data: {
          inspectionId,
          location,
          description,
          recordedBy: 'voice'
        }
      });

      return {
        action: command.action,
        damageId: damage.id,
        status: 'success',
        message: 'Damage recorded'
      };
    }

    case 'UPDATE_STATUS': {
      if (!inspectionId) {
        throw new Error('Inspection ID is required to update status');
      }

      const status = parameters.status;
      if (!status) {
        throw new Error('Status is required');
      }

      // Update inspection status
      const inspection = await prisma.inspection.update({
        where: { id: inspectionId },
        data: { status }
      });

      return {
        action: command.action,
        status: 'success',
        message: `Status updated to ${status}`
      };
    }

    case 'ADD_EQUIPMENT': {
      if (!inspectionId) {
        throw new Error('Inspection ID is required to add equipment');
      }

      const equipmentName = parameters.equipment;
      if (!equipmentName) {
        throw new Error('Equipment details are required');
      }

      // First verify the inspection exists
      const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId }
      });

      if (!inspection) {
        throw new Error('Inspection not found');
      }

      // Create the equipment record
      const equipment = await prisma.inspectionEquipment.create({
        data: {
          inspectionId,
          name: equipmentName,
          recordedBy: 'voice'
        }
      });

      return {
        action: command.action,
        equipmentId: equipment.id,
        status: 'success',
        message: 'Equipment recorded'
      };
    }

    default:
      throw new Error('Unsupported command');
  }
}

function extractParameter(command: string, parameter: string): string | null {
  // Simple parameter extraction - could be made more sophisticated
  const words = command.split(' ');
  const paramIndex = words.findIndex(word => 
    word.toLowerCase().includes(parameter.toLowerCase())
  );

  if (paramIndex === -1 || paramIndex === words.length - 1) {
    return null;
  }

  return words[paramIndex + 1];
}
