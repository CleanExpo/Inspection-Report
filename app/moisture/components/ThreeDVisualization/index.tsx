'use client';

import { useEffect, useRef, useCallback } from 'react';
import { SceneManager, type SceneRefs } from './setup';
import { ControlManager } from './controls';
import { PointsManager } from './points';
import type { ThreeDVisualizationProps } from './types';
import * as THREE from 'three';

export default function ThreeDVisualization({
  backgroundColor = 0xf0f0f0,
  fov = 75,
  floorPlans = [],
  controlSettings = {}
}: ThreeDVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager>();
  const controlManagerRef = useRef<ControlManager>();
  const pointsManagerRef = useRef<PointsManager>();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const animationFrameRef = useRef<number>();

  // Initialize scene, controls, and points
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene manager
    sceneManagerRef.current = new SceneManager(containerRef.current, {
      backgroundColor,
      fov
    });

    // Setup lighting
    sceneManagerRef.current.setupLighting();

    // Get scene references
    const sceneRefs = sceneManagerRef.current.getRefs();
    const { scene, camera, renderer } = sceneRefs;

    // Setup control manager
    controlManagerRef.current = new ControlManager(camera, renderer.domElement, {
      minDistance: controlSettings.minDistance ?? 5,
      maxDistance: controlSettings.maxDistance ?? 100,
      rotationSpeed: controlSettings.rotationSpeed ?? 1.0,
      zoomSpeed: controlSettings.zoomSpeed ?? 1.0,
      enableDamping: controlSettings.enableDamping ?? true
    });

    // Setup points manager
    pointsManagerRef.current = new PointsManager(scene);

    // Add points from floor plans
    floorPlans.forEach((floorPlan) => {
      floorPlan.readings.forEach((reading) => {
        pointsManagerRef.current?.addPoint(reading, floorPlan.level);
      });
    });

    // Start animation loop
    startAnimationLoop(sceneRefs);

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Add mouse event listeners
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      stopAnimationLoop();
      controlManagerRef.current?.dispose();
      pointsManagerRef.current?.clear();
      sceneManagerRef.current?.dispose();
    };
  }, [backgroundColor, fov, controlSettings, floorPlans]);

  // Animation loop
  const startAnimationLoop = (sceneRefs: SceneRefs) => {
    const { scene, camera, renderer } = sceneRefs;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controlManagerRef.current?.update();
      checkIntersections(scene, camera);
      renderer.render(scene, camera);
    };

    animate();
  };

  const stopAnimationLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleResize = () => {
    sceneManagerRef.current?.handleResize();
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  const handleClick = useCallback(() => {
    const hoveredPoint = pointsManagerRef.current?.getHoveredPoint();
    if (hoveredPoint) {
      pointsManagerRef.current?.setSelected(hoveredPoint.id);
    } else {
      pointsManagerRef.current?.setSelected(null);
    }
  }, []);

  const checkIntersections = (scene: THREE.Scene, camera: THREE.Camera) => {
    if (!pointsManagerRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(pointsManagerRef.current.getPoints().values()).map(p => p.mesh)
    );

    if (intersects.length > 0) {
      const point = Array.from(pointsManagerRef.current.getPoints().values()).find(
        p => p.mesh === intersects[0].object
      );
      if (point) {
        pointsManagerRef.current.setHovered(point.id);
      }
    } else {
      pointsManagerRef.current.setHovered(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] rounded-lg overflow-hidden"
      data-testid="three-d-visualization"
    />
  );
}
