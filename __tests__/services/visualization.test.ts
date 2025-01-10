import { visualizationService, VisualizationError } from '../../app/services/visualizationService';
import {
  RenderMode,
  CameraType,
  LightType,
  MaterialType,
  Model,
  Light,
  Animation,
  ReportView
} from '../../app/types/visualization';

describe('Visualization Service', () => {
  describe('initializeScene', () => {
    it('should initialize scene with default settings', async () => {
      const scene = await visualizationService.initializeScene();

      expect(scene.id).toBeDefined();
      expect(scene.models).toHaveLength(0);
      expect(scene.lights).toHaveLength(2); // Ambient and directional lights
      expect(scene.cameras).toHaveLength(1);
      expect(scene.activeCamera).toBe('main-camera');
    });

    it('should override default settings with provided config', async () => {
      const config = {
        name: 'Custom Scene',
        background: '#ffffff'
      };

      const scene = await visualizationService.initializeScene(config);

      expect(scene.name).toBe('Custom Scene');
      expect(scene.background).toBe('#ffffff');
    });
  });

  describe('addModel', () => {
    it('should add model to scene', async () => {
      const modelData: Omit<Model, 'id'> = {
        name: 'Test Model',
        geometry: {
          vertices: [{ x: 0, y: 0, z: 0 }],
          faces: [[0, 1, 2]],
          normals: [{ x: 0, y: 1, z: 0 }],
          uvs: [{ x: 0, y: 0 }]
        },
        material: {
          id: 'mat-1',
          type: MaterialType.BASIC,
          color: '#ffffff',
          opacity: 1,
          transparent: false,
          wireframe: false,
          side: 'FRONT'
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        castShadow: true,
        receiveShadow: true
      };

      const model = await visualizationService.addModel(modelData);

      expect(model.id).toBeDefined();
      expect(model.name).toBe('Test Model');
      expect(model.geometry.vertices).toHaveLength(1);
    });
  });

  describe('updateLighting', () => {
    it('should update scene lighting', async () => {
      const lights: Light[] = [
        {
          id: 'light-1',
          type: LightType.POINT,
          color: '#ffffff',
          intensity: 1,
          position: { x: 0, y: 5, z: 0 },
          castShadow: true
        }
      ];

      await visualizationService.updateLighting(lights);

      const snapshot = visualizationService.takeSnapshot();
      expect(snapshot.scene.lights).toHaveLength(1);
      expect(snapshot.scene.lights[0].type).toBe(LightType.POINT);
    });
  });

  describe('handleInteraction', () => {
    it('should handle model movement', async () => {
      // First add a model
      const model = await visualizationService.addModel({
        name: 'Test Model',
        geometry: {
          vertices: [{ x: 0, y: 0, z: 0 }],
          faces: [[0, 1, 2]],
          normals: [{ x: 0, y: 1, z: 0 }],
          uvs: [{ x: 0, y: 0 }]
        },
        material: {
          id: 'mat-1',
          type: MaterialType.BASIC,
          color: '#ffffff',
          opacity: 1,
          transparent: false,
          wireframe: false,
          side: 'FRONT'
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        castShadow: true,
        receiveShadow: true
      });

      await visualizationService.handleInteraction({
        type: 'MOVE',
        modelId: model.id,
        point: { x: 1, y: 1, z: 1 },
        timestamp: Date.now()
      });

      const snapshot = visualizationService.takeSnapshot();
      const updatedModel = snapshot.scene.models.find(m => m.id === model.id);
      expect(updatedModel?.position).toEqual({ x: 1, y: 1, z: 1 });
    });

    it('should reject interaction with non-existent model', async () => {
      await expect(visualizationService.handleInteraction({
        type: 'MOVE',
        modelId: 'non-existent',
        point: { x: 0, y: 0, z: 0 },
        timestamp: Date.now()
      })).rejects.toThrow(VisualizationError);
    });
  });

  describe('createAnimation', () => {
    it('should create model animation', async () => {
      const model = await visualizationService.addModel({
        name: 'Animated Model',
        geometry: {
          vertices: [{ x: 0, y: 0, z: 0 }],
          faces: [[0, 1, 2]],
          normals: [{ x: 0, y: 1, z: 0 }],
          uvs: [{ x: 0, y: 0 }]
        },
        material: {
          id: 'mat-1',
          type: MaterialType.BASIC,
          color: '#ffffff',
          opacity: 1,
          transparent: false,
          wireframe: false,
          side: 'FRONT'
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        castShadow: true,
        receiveShadow: true
      });

      const animation = await visualizationService.createAnimation({
        modelId: model.id,
        property: 'position',
        keyframes: [
          {
            time: 0,
            value: { x: 0, y: 0, z: 0 },
            easing: 'LINEAR'
          },
          {
            time: 1000,
            value: { x: 5, y: 0, z: 0 },
            easing: 'LINEAR'
          }
        ],
        duration: 1000,
        loop: true,
        playing: true
      });

      expect(animation.id).toBeDefined();
      expect(animation.modelId).toBe(model.id);
      expect(animation.keyframes).toHaveLength(2);
    });
  });

  describe('createReport', () => {
    it('should create visualization report', async () => {
      const reportData: Omit<ReportView, 'id'> = {
        name: 'Test Report',
        type: '3D',
        data: {
          source: 'scene',
          filter: 'type=model'
        },
        visualization: {
          type: 'scene-view',
          options: {
            camera: 'main-camera'
          }
        },
        export: {
          formats: ['PNG', 'PDF']
        }
      };

      const report = await visualizationService.createReport(reportData);

      expect(report.id).toBeDefined();
      expect(report.name).toBe('Test Report');
      expect(report.type).toBe('3D');
    });
  });

  describe('takeSnapshot', () => {
    it('should capture current visualization state', () => {
      const snapshot = visualizationService.takeSnapshot();

      expect(snapshot.id).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.scene).toBeDefined();
      expect(snapshot.camera).toBeDefined();
      expect(snapshot.stats).toBeDefined();
    });

    it('should throw error if no active camera', async () => {
      await visualizationService.initializeScene({
        cameras: [],
        activeCamera: ''
      });

      expect(() => visualizationService.takeSnapshot()).toThrow(VisualizationError);
    });
  });

  describe('export', () => {
    it('should export visualization data', async () => {
      const blob = await visualizationService.export({
        type: 'IMAGE',
        format: 'PNG',
        quality: 1,
        dimensions: {
          width: 1920,
          height: 1080
        }
      });

      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('cleanup', () => {
    it('should dispose resources', () => {
      visualizationService.dispose();

      // Verify render loop is stopped
      const snapshot = visualizationService.takeSnapshot();
      expect(snapshot.stats.fps).toBe(0);
    });
  });
});
