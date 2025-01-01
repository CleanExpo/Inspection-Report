import * as tf from '@tensorflow/tfjs';
import { Point } from '@/types/moisture';

interface DetectedItem {
  id: string;
  type: string;
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  position: Point;
  dimensions: {
    width: number;
    height: number;
  };
}

interface ImageAnalysisResult {
  items: DetectedItem[];
  roomFeatures: {
    walls: Point[][];
    doors: Point[][];
    windows: Point[][];
  };
  dimensions: {
    width: number;
    height: number;
    scale: number;
  };
}

export class ImageAnalysisService {
  private static instance: ImageAnalysisService;
  private objectDetectionModel: any; // COCO-SSD model
  private roomFeatureModel: any; // Custom room feature model
  private itemClassifier: any; // Custom item classifier

  private readonly ITEM_CLASSES = [
    'dehumidifier',
    'fan',
    'air-mover',
    'furniture',
    'appliance',
    'door',
    'window',
    'wall',
    'corner',
  ];

  private constructor() {
    this.initializeModels();
  }

  static getInstance(): ImageAnalysisService {
    if (!ImageAnalysisService.instance) {
      ImageAnalysisService.instance = new ImageAnalysisService();
    }
    return ImageAnalysisService.instance;
  }

  private async initializeModels() {
    try {
      // Load pre-trained COCO-SSD model for general object detection
      this.objectDetectionModel = await tf.loadGraphModel(
        'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1'
      );

      // Load custom room feature detection model
      // this.roomFeatureModel = await tf.loadLayersModel('path/to/room-feature-model');

      // Load custom item classifier
      // this.itemClassifier = await tf.loadLayersModel('path/to/item-classifier');

      console.log('Image analysis models initialized');
    } catch (error) {
      console.error('Failed to initialize image analysis models:', error);
    }
  }

  async analyzeImage(imageData: ImageData): Promise<ImageAnalysisResult> {
    try {
      // Convert image data to tensor
      const tensor = tf.browser.fromPixels(imageData);
      const normalizedTensor = tf.div(tensor, 255.0);
      const expandedTensor = normalizedTensor.expandDims(0);

      // Detect objects
      const detectedObjects = await this.detectObjects(expandedTensor);

      // Detect room features
      const roomFeatures = await this.detectRoomFeatures(expandedTensor);

      // Calculate room dimensions
      const dimensions = this.calculateDimensions(roomFeatures);

      // Clean up tensors
      tensor.dispose();
      normalizedTensor.dispose();
      expandedTensor.dispose();

      return {
        items: detectedObjects,
        roomFeatures,
        dimensions,
      };
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private async detectObjects(tensor: tf.Tensor4D): Promise<DetectedItem[]> {
    const predictions = await this.objectDetectionModel.executeAsync(tensor) as tf.Tensor[];
    const boxes = await predictions[0].array();
    const scores = await predictions[1].array();
    const classes = await predictions[2].array();

    const items: DetectedItem[] = [];
    const [imageHeight, imageWidth] = tensor.shape.slice(1, 3);

    for (let i = 0; i < scores[0].length; i++) {
      if (scores[0][i] > 0.5) { // Confidence threshold
        const bbox = boxes[0][i];
        const item: DetectedItem = {
          id: `item-${Date.now()}-${i}`,
          type: this.ITEM_CLASSES[classes[0][i]] || 'unknown',
          label: this.ITEM_CLASSES[classes[0][i]] || 'unknown',
          confidence: scores[0][i],
          boundingBox: {
            x: bbox[1] * imageWidth,
            y: bbox[0] * imageHeight,
            width: (bbox[3] - bbox[1]) * imageWidth,
            height: (bbox[2] - bbox[0]) * imageHeight,
          },
          position: {
            x: (bbox[1] + (bbox[3] - bbox[1]) / 2) * imageWidth,
            y: (bbox[0] + (bbox[2] - bbox[0]) / 2) * imageHeight,
          },
          dimensions: {
            width: (bbox[3] - bbox[1]) * imageWidth,
            height: (bbox[2] - bbox[0]) * imageHeight,
          },
        };
        items.push(item);
      }
    }

    // Clean up tensors
    predictions.forEach(p => p.dispose());

    return items;
  }

  private async detectRoomFeatures(tensor: tf.Tensor4D): Promise<{
    walls: Point[][];
    doors: Point[][];
    windows: Point[][];
  }> {
    // Placeholder implementation
    // In a real implementation, this would use a trained model to detect walls, doors, and windows
    return {
      walls: [],
      doors: [],
      windows: [],
    };
  }

  private calculateDimensions(roomFeatures: {
    walls: Point[][];
    doors: Point[][];
    windows: Point[][];
  }): {
    width: number;
    height: number;
    scale: number;
  } {
    // Placeholder implementation
    // In a real implementation, this would calculate actual room dimensions based on detected features
    return {
      width: 0,
      height: 0,
      scale: 1,
    };
  }

  async classifyItem(imageData: ImageData): Promise<{
    type: string;
    confidence: number;
  }> {
    try {
      // Convert image to tensor
      const tensor = tf.browser.fromPixels(imageData);
      const normalizedTensor = tf.div(tensor, 255.0);
      const resizedTensor = tf.image.resizeBilinear(normalizedTensor, [224, 224]);
      const expandedTensor = resizedTensor.expandDims(0);

      // Classify item
      const predictions = await this.itemClassifier.predict(expandedTensor).array();
      const maxIndex = predictions[0].indexOf(Math.max(...predictions[0]));

      // Clean up tensors
      tensor.dispose();
      normalizedTensor.dispose();
      resizedTensor.dispose();
      expandedTensor.dispose();

      return {
        type: this.ITEM_CLASSES[maxIndex],
        confidence: predictions[0][maxIndex],
      };
    } catch (error) {
      console.error('Item classification failed:', error);
      throw new Error('Failed to classify item');
    }
  }

  async integrateItemsIntoRoom(
    items: DetectedItem[],
    roomDimensions: { width: number; height: number }
  ): Promise<DetectedItem[]> {
    // Scale and position items within room dimensions
    return items.map(item => {
      const scaledItem = { ...item };
      
      // Scale position and dimensions based on room size
      const scaleX = roomDimensions.width / item.boundingBox.width;
      const scaleY = roomDimensions.height / item.boundingBox.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed

      scaledItem.dimensions = {
        width: item.dimensions.width * scale,
        height: item.dimensions.height * scale,
      };

      scaledItem.position = {
        x: (item.position.x / item.boundingBox.width) * roomDimensions.width,
        y: (item.position.y / item.boundingBox.height) * roomDimensions.height,
      };

      return scaledItem;
    });
  }

  async estimateItemDimensions(
    item: DetectedItem,
    referenceObject?: {
      type: string;
      knownDimensions: { width: number; height: number };
    }
  ): Promise<{ width: number; height: number }> {
    if (referenceObject) {
      // Use reference object to calculate actual dimensions
      const pixelToMeterRatio = referenceObject.knownDimensions.width / item.dimensions.width;
      return {
        width: item.dimensions.width * pixelToMeterRatio,
        height: item.dimensions.height * pixelToMeterRatio,
      };
    }

    // Use average dimensions for known item types
    const defaultDimensions = {
      dehumidifier: { width: 0.6, height: 0.9 },
      fan: { width: 0.5, height: 0.5 },
      'air-mover': { width: 0.4, height: 0.3 },
      furniture: { width: 1.0, height: 1.0 },
      appliance: { width: 0.6, height: 0.6 },
      door: { width: 0.9, height: 2.1 },
      window: { width: 1.2, height: 1.2 },
    };

    return defaultDimensions[item.type as keyof typeof defaultDimensions] || 
           { width: 1.0, height: 1.0 };
  }
}

export const imageAnalysisService = ImageAnalysisService.getInstance();
