import { NextApiRequest, NextApiResponse } from 'next';
import { validateMetadata, validateEquipment, calculateConfidence } from '../app/utils/moistureValidation';
import { MaterialType, MoistureReading } from '../types/moisture';

interface ExtendedNextApiRequest extends NextApiRequest {
  moistureValidation?: {
    confidence: number;
  };
}

export function withMoistureValidation(handler: Function) {
  return async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;

    // Only validate POST and PUT requests
    if (!['POST', 'PUT'].includes(method || '')) {
      return handler(req, res);
    }

    try {
      // Validate reading data if present
      if (body.value !== undefined) {
        const reading: MoistureReading = {
          value: body.value,
          materialType: body.materialType,
          location: body.location,
          notes: body.notes,
          equipmentType: body.equipmentType
        };

        // Validate metadata (coordinates, value ranges, etc.)
        const metadataResult = validateMetadata(reading);
        if (!metadataResult.isValid) {
          return res.status(400).json({
            error: 'Invalid moisture reading data',
            details: metadataResult.errors
          });
        }

        // Validate equipment if specified
        if (reading.equipmentType) {
          const equipmentResult = validateEquipment(
            reading.equipmentType,
            reading.materialType
          );
          if (!equipmentResult.isValid) {
            return res.status(400).json({
              error: 'Equipment validation failed',
              details: equipmentResult.errors
            });
          }
        }

        // Calculate confidence score
        const confidence = calculateConfidence(
          reading,
          reading.equipmentType || 'unknown'
        );

        // Attach confidence to request for use in handler
        req.moistureValidation = {
          confidence
        };
      }

      // Validate map data if present
      if (body.layout !== undefined) {
        if (typeof body.layout !== 'string') {
          return res.status(400).json({
            error: 'Invalid map data',
            details: ['Layout must be a string']
          });
        }

        if (!body.name || typeof body.name !== 'string') {
          return res.status(400).json({
            error: 'Invalid map data',
            details: ['Name is required and must be a string']
          });
        }

        if (!body.jobId || typeof body.jobId !== 'string') {
          return res.status(400).json({
            error: 'Invalid map data',
            details: ['Job ID is required and must be a string']
          });
        }
      }

      // If all validation passes, proceed to handler
      return handler(req, res);
    } catch (error) {
      console.error('Moisture validation error:', error);
      return res.status(500).json({
        error: 'Validation error',
        details: [(error as Error).message]
      });
    }
  };
}
