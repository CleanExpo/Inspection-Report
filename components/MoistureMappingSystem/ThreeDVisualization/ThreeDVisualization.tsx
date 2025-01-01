'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ThreeDVisualizationProps, SceneConfig, ViewControls, MoistureReading } from './types';
import { createPointGeometry, createPointMaterial, findNearestPoint } from './pointUtils';

const defaultConfig: SceneConfig = {
  width: 800,
  height: 600,
  fov: 75,
  near: 0.1,
  far: 1000,
  cameraPosition: [10, 10, 10]
};

const defaultControls: ViewControls = {
  autoRotate: false,
  enableZoom: true,
  enablePan: true,
  maxDistance: 50,
  minDistance: 5
};

export const ThreeDVisualization: React.FC<ThreeDVisualizationProps> = ({
  readings,
  width = defaultConfig.width,
  height = defaultConfig.height,
  onPointSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Initialize scene, camera, and renderer
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      defaultConfig.fov,
      width / height,
      defaultConfig.near,
      defaultConfig.far
    );
    camera.position.set(...defaultConfig.cameraPosition);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    Object.assign(controls, defaultControls);
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [width, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;

      const camera = cameraRef.current;
      const renderer = rendererRef.current;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  // Update points when readings change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove existing points
    const existingPoints = sceneRef.current.children.find(
      child => child instanceof THREE.Points
    );
    if (existingPoints) {
      sceneRef.current.remove(existingPoints);
    }

    // Create new points
    const geometry = createPointGeometry(readings);
    const material = createPointMaterial();
    const points = new THREE.Points(geometry, material);
    sceneRef.current.add(points);
  }, [readings]);

  // Handle point selection
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current || !onPointSelect) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);

      const points = sceneRef.current!.children.find(
        child => child instanceof THREE.Points
      ) as THREE.Points;

      if (points) {
        const intersects = raycaster.intersectObject(points);
        if (intersects.length > 0 && typeof intersects[0].index === 'number') {
          const index = intersects[0].index;
          if (index >= 0 && index < readings.length) {
            const selectedReading = readings[index];
            onPointSelect(selectedReading);
          }
        }
      }
    };

    containerRef.current.addEventListener('click', handleClick);
    return () => containerRef.current?.removeEventListener('click', handleClick);
  }, [width, height, readings, onPointSelect]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width, 
        height,
        position: 'relative',
        overflow: 'hidden'
      }} 
    />
  );
};
