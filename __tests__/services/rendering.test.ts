import { renderingService, RenderingError } from '../../app/services/renderingService';
import {
  RenderLayerType,
  InteractionMode,
  RenderElement,
  RenderAnimation,
  RenderInteraction,
  ViewportState
} from '../../app/types/rendering';

describe('Rendering Service', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
  });

  describe('addElements', () => {
    it('should add elements to a layer', async () => {
      const elements: RenderElement[] = [
        {
          id: 'element-1',
          type: 'rectangle',
          bounds: {
            x: 100,
            y: 100,
            width: 200,
            height: 150
          },
          style: {
            color: '#000000',
            opacity: 1
          },
          data: {},
          visible: true,
          interactive: true
        }
      ];

      await renderingService.addElements(
        elements,
        RenderLayerType.CONTENT
      );

      const snapshot = renderingService.takeSnapshot();
      const layer = snapshot.layers.find(l => l.type === RenderLayerType.CONTENT);

      expect(layer).toBeDefined();
      expect(layer?.elements).toHaveLength(1);
      expect(layer?.elements[0].id).toBe('element-1');
    });

    it('should reject adding elements to non-existent layer', async () => {
      const elements: RenderElement[] = [
        {
          id: 'element-1',
          type: 'rectangle',
          bounds: {
            x: 100,
            y: 100,
            width: 200,
            height: 150
          },
          style: {
            color: '#000000',
            opacity: 1
          },
          data: {},
          visible: true,
          interactive: true
        }
      ];

      await expect(renderingService.addElements(
        elements,
        'NON_EXISTENT' as RenderLayerType
      )).rejects.toThrow(RenderingError);
    });
  });

  describe('updateElements', () => {
    it('should update existing elements', async () => {
      const element: RenderElement = {
        id: 'element-1',
        type: 'rectangle',
        bounds: {
          x: 100,
          y: 100,
          width: 200,
          height: 150
        },
        style: {
          color: '#000000',
          opacity: 1
        },
        data: {},
        visible: true,
        interactive: true
      };

      await renderingService.addElements(
        [element],
        RenderLayerType.CONTENT
      );

      const updatedElement = {
        ...element,
        bounds: {
          x: 150,
          y: 150,
          width: 250,
          height: 200
        }
      };

      await renderingService.updateElements(
        [updatedElement],
        RenderLayerType.CONTENT
      );

      const snapshot = renderingService.takeSnapshot();
      const layer = snapshot.layers.find(l => l.type === RenderLayerType.CONTENT);
      const updated = layer?.elements.find(e => e.id === 'element-1');

      expect(updated).toBeDefined();
      expect(updated?.bounds).toEqual(updatedElement.bounds);
    });
  });

  describe('removeElements', () => {
    it('should remove elements from a layer', async () => {
      const element: RenderElement = {
        id: 'element-1',
        type: 'rectangle',
        bounds: {
          x: 100,
          y: 100,
          width: 200,
          height: 150
        },
        style: {
          color: '#000000',
          opacity: 1
        },
        data: {},
        visible: true,
        interactive: true
      };

      await renderingService.addElements(
        [element],
        RenderLayerType.CONTENT
      );

      await renderingService.removeElements(
        ['element-1'],
        RenderLayerType.CONTENT
      );

      const snapshot = renderingService.takeSnapshot();
      const layer = snapshot.layers.find(l => l.type === RenderLayerType.CONTENT);

      expect(layer?.elements).toHaveLength(0);
    });
  });

  describe('updateViewport', () => {
    it('should update viewport state', () => {
      const viewportUpdate: Partial<ViewportState> = {
        scale: 2,
        offset: { x: 100, y: 100 }
      };

      renderingService.updateViewport(viewportUpdate);

      const snapshot = renderingService.takeSnapshot();
      expect(snapshot.viewport.scale).toBe(2);
      expect(snapshot.viewport.offset).toEqual({ x: 100, y: 100 });
    });
  });

  describe('animate', () => {
    it('should create and track animation', () => {
      const animation: Omit<RenderAnimation, 'id' | 'status' | 'startTime'> = {
        element: 'element-1',
        property: 'opacity',
        startValue: 1,
        endValue: 0,
        duration: 1000,
        easing: 'linear'
      };

      const animationId = renderingService.animate(animation);
      const snapshot = renderingService.takeSnapshot();
      const trackedAnimation = snapshot.animations.find(a => a.id === animationId);

      expect(trackedAnimation).toBeDefined();
      expect(trackedAnimation?.status).toBe('RUNNING');
    });
  });

  describe('startInteraction', () => {
    it('should create and track interaction', () => {
      const interaction: Omit<RenderInteraction, 'id'> = {
        type: 'DRAG',
        element: 'element-1',
        startPoint: { x: 100, y: 100 },
        currentPoint: { x: 100, y: 100 },
        startState: {},
        modifiers: {
          snap: false,
          constrain: false,
          fromCenter: false
        }
      };

      const interactionId = renderingService.startInteraction(interaction);
      const snapshot = renderingService.takeSnapshot();
      const trackedInteraction = snapshot.interactions.find(i => i.id === interactionId);

      expect(trackedInteraction).toBeDefined();
      expect(trackedInteraction?.type).toBe('DRAG');
    });
  });

  describe('takeSnapshot', () => {
    it('should capture current rendering state', () => {
      const snapshot = renderingService.takeSnapshot();

      expect(snapshot.id).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.viewport).toBeDefined();
      expect(snapshot.layers).toBeDefined();
      expect(snapshot.interactions).toBeDefined();
      expect(snapshot.animations).toBeDefined();
      expect(snapshot.stats).toBeDefined();
    });
  });
});
