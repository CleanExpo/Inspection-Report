import {
  validateCoordinates,
  validateMetadata,
  validateEquipment,
  validateReadingConfidence,
  CoordinateValidationResult,
  MetadataValidationResult,
  EquipmentValidationResult,
  ReadingConfidenceResult
} from '../../app/utils/moistureValidation';
import { MaterialType } from '../../app/types/moisture';

describe('Moisture Validation Tests', () => {
  describe('validateCoordinates', () => {
    it('should validate coordinates within bounds', () => {
      const result = validateCoordinates({
        x: 50,
        y: 50
      }, {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for out of bounds coordinates', () => {
      const result = validateCoordinates({
        x: 150,
        y: 50
      }, {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('x coordinate');
    });

    it('should validate grid alignment', () => {
      const result = validateCoordinates({
        x: 50,
        y: 50
      }, {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100,
        gridSize: 10
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for misaligned coordinates', () => {
      const result = validateCoordinates({
        x: 55,
        y: 50
      }, {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100,
        gridSize: 10
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('grid alignment');
    });
  });

  describe('validateMetadata', () => {
    it('should validate valid metadata', () => {
      const result = validateMetadata({
        materialType: MaterialType.DRYWALL,
        value: 50,
        timestamp: new Date().toISOString()
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid material type', () => {
      const result = validateMetadata({
        materialType: 'INVALID' as MaterialType,
        value: 50,
        timestamp: new Date().toISOString()
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('material type');
    });

    it('should fail validation for out of range value', () => {
      const result = validateMetadata({
        materialType: MaterialType.DRYWALL,
        value: 150,
        timestamp: new Date().toISOString()
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('value');
    });

    it('should fail validation for invalid timestamp', () => {
      const result = validateMetadata({
        materialType: MaterialType.DRYWALL,
        value: 50,
        timestamp: 'invalid-date'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('timestamp');
    });
  });

  describe('validateEquipment', () => {
    it('should validate compatible equipment', () => {
      const result = validateEquipment({
        type: 'MOISTURE_METER',
        materialType: MaterialType.DRYWALL,
        calibrationDate: new Date().toISOString()
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for incompatible equipment', () => {
      const result = validateEquipment({
        type: 'THERMAL_CAMERA',
        materialType: MaterialType.DRYWALL,
        calibrationDate: new Date().toISOString()
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('equipment type');
    });

    it('should fail validation for expired calibration', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2);

      const result = validateEquipment({
        type: 'MOISTURE_METER',
        materialType: MaterialType.DRYWALL,
        calibrationDate: oldDate.toISOString()
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('calibration');
    });
  });

  describe('validateReadingConfidence', () => {
    it('should calculate high confidence for optimal conditions', () => {
      const result = validateReadingConfidence({
        value: 50,
        materialType: MaterialType.DRYWALL,
        equipmentType: 'MOISTURE_METER',
        calibrationAge: 0,
        environmentalConditions: {
          temperature: 20,
          humidity: 50
        }
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.factors).toHaveLength(0);
    });

    it('should calculate lower confidence for suboptimal conditions', () => {
      const result = validateReadingConfidence({
        value: 50,
        materialType: MaterialType.DRYWALL,
        equipmentType: 'MOISTURE_METER',
        calibrationAge: 300,
        environmentalConditions: {
          temperature: 35,
          humidity: 90
        }
      });

      expect(result.confidence).toBeLessThan(0.8);
      expect(result.factors).toHaveLength(2);
      expect(result.factors).toContain('high humidity');
    });

    it('should identify all confidence-reducing factors', () => {
      const result = validateReadingConfidence({
        value: 95,
        materialType: MaterialType.DRYWALL,
        equipmentType: 'MOISTURE_METER',
        calibrationAge: 300,
        environmentalConditions: {
          temperature: 35,
          humidity: 90
        }
      });

      expect(result.confidence).toBeLessThan(0.5);
      expect(result.factors).toHaveLength(3);
      expect(result.factors).toContain('extreme reading');
      expect(result.factors).toContain('high humidity');
      expect(result.factors).toContain('calibration age');
    });
  });
});
