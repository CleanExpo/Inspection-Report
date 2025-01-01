import { imageAnalysisService, ImageAnalysisService } from '@/services/imageAnalysisService';
import * as tf from '@tensorflow/tfjs';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  browser: {
    fromPixels: jest.fn().mockReturnValue({
      expandDims: jest.fn().mockReturnValue({
        dispose: jest.fn(),
      }),
      dispose: jest.fn(),
    }),
  },
  loadGraphModel: jest.fn().mockResolvedValue({
    executeAsync: jest.fn().mockResolvedValue([
      { array: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]) },
      { array: jest.fn().mockResolvedValue([[0.8, 0.6, 0.4]]) },
      { array: jest.fn().mockResolvedValue([[0, 1, 2]]) },
    ]),
  }),
  div: jest.fn().mockReturnValue({
    expandDims: jest.fn().mockReturnValue({
      dispose: jest.fn(),
    }),
    dispose: jest.fn(),
  }),
  image: {
    resizeBilinear: jest.fn().mockReturnValue({
      expandDims: jest.fn().mockReturnValue({
        dispose: jest.fn(),
      }),
      dispose: jest.fn(),
    }),
  },
}));

describe('ImageAnalysisService', () => {
  // Mock image data
  const mockImageData: ImageData = {
    data: new Uint8ClampedArray(100 * 100 * 4),
    height: 100,
    width: 100,
    colorSpace: 'srgb',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image Analysis', () => {
    it('analyzes images and detects objects', async () => {
      const result = await imageAnalysisService.analyzeImage(mockImageData);
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('roomFeatures');
      expect(result).toHaveProperty('dimensions');
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('detects items with high confidence', async () => {
      const result = await imageAnalysisService.analyzeImage(mockImageData);
      
      result.items.forEach(item => {
        expect(item).toHaveProperty('confidence');
        expect(item.confidence).toBeGreaterThan(0.5);
      });
    });

    it('provides item dimensions and positions', async () => {
      const result = await imageAnalysisService.analyzeImage(mockImageData);
      
      result.items.forEach(item => {
        expect(item).toHaveProperty('dimensions');
        expect(item).toHaveProperty('position');
        expect(item.dimensions).toHaveProperty('width');
        expect(item.dimensions).toHaveProperty('height');
        expect(item.position).toHaveProperty('x');
        expect(item.position).toHaveProperty('y');
      });
    });
  });

  describe('Item Classification', () => {
    it('classifies items with confidence scores', async () => {
      const result = await imageAnalysisService.classifyItem(mockImageData);
      
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Room Integration', () => {
    const mockItems = [
      {
        id: 'item-1',
        type: 'dehumidifier',
        label: 'dehumidifier',
        confidence: 0.9,
        boundingBox: {
          x: 10,
          y: 10,
          width: 50,
          height: 100,
        },
        position: {
          x: 35,
          y: 60,
        },
        dimensions: {
          width: 50,
          height: 100,
        },
      },
    ];

    it('integrates items into room dimensions', async () => {
      const roomDimensions = { width: 500, height: 300 };
      const result = await imageAnalysisService.integrateItemsIntoRoom(
        mockItems,
        roomDimensions
      );
      
      expect(result).toHaveLength(mockItems.length);
      result.forEach(item => {
        expect(item.position.x).toBeLessThanOrEqual(roomDimensions.width);
        expect(item.position.y).toBeLessThanOrEqual(roomDimensions.height);
      });
    });

    it('estimates item dimensions', async () => {
      const dimensions = await imageAnalysisService.estimateItemDimensions(mockItems[0]);
      
      expect(dimensions).toHaveProperty('width');
      expect(dimensions).toHaveProperty('height');
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
    });

    it('uses reference object for dimension estimation', async () => {
      const referenceObject = {
        type: 'door',
        knownDimensions: { width: 0.9, height: 2.1 },
      };
      
      const dimensions = await imageAnalysisService.estimateItemDimensions(
        mockItems[0],
        referenceObject
      );
      
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid image data', async () => {
      const invalidImageData = {
        ...mockImageData,
        width: -1, // Invalid width
      };

      await expect(imageAnalysisService.analyzeImage(invalidImageData))
        .rejects
        .toThrow();
    });

    it('handles model initialization failures', async () => {
      // Mock loadGraphModel to fail
      (tf.loadGraphModel as jest.Mock).mockRejectedValueOnce(new Error('Model load failed'));

      const service = ImageAnalysisService.getInstance();
      await expect(service['initializeModels']()).resolves.not.toThrow();
    });

    it('handles classification failures gracefully', async () => {
      // Mock tensor operations to fail
      (tf.browser.fromPixels as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Tensor operation failed');
      });

      await expect(imageAnalysisService.classifyItem(mockImageData))
        .rejects
        .toThrow('Failed to classify item');
    });
  });

  describe('Performance', () => {
    it('disposes tensors after use', async () => {
      const disposeSpy = jest.fn();
      (tf.browser.fromPixels as jest.Mock).mockReturnValue({
        expandDims: jest.fn().mockReturnValue({
          dispose: disposeSpy,
        }),
        dispose: disposeSpy,
      });

      await imageAnalysisService.analyzeImage(mockImageData);
      expect(disposeSpy).toHaveBeenCalled();
    });
  });
});
