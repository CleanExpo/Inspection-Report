'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';

interface MoistureReading {
  locationX: number;
  locationY: number;
  dataPoints: {
    value: number;
    unit: string;
  }[];
}

interface FloorPlan {
  id: string;
  level: number;
  scale: number;
  readings: MoistureReading[];
  width: number;
  height: number;
}

interface ThreeDVisualizationProps {
  floorPlans: FloorPlan[];
  levelSpacing?: number; // Vertical spacing between levels in meters
}

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControlsImpl;
}

export default function ThreeDVisualization({
  floorPlans,
  levelSpacing = 3 // Default 3 meters between floors
}: ThreeDVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneRefs>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControlsImpl(camera, renderer.domElement);
    controls.enableDamping = true;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Store references
    sceneRef.current = { scene, camera, renderer, controls };

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Clean up
    return () => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update visualization when floor plans change
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;

    // Clear existing visualization
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
        if (object.parent) {
          object.parent.remove(object);
        }
      }
    });

    // Create visualization for each floor
    floorPlans.forEach((floorPlan, index) => {
      const y = index * levelSpacing;

      // Create floor plane
      const geometry = new THREE.PlaneGeometry(
        floorPlan.width * floorPlan.scale,
        floorPlan.height * floorPlan.scale
      );
      const material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      scene.add(plane);

      // Add moisture readings
      floorPlan.readings.forEach(reading => {
        const value = reading.dataPoints[0]?.value || 0;
        const normalizedValue = Math.min(value / 30, 1); // Normalize to 0-1 range

        // Create point geometry
        const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const pointMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(
            (1 - normalizedValue) * 0.3, // Red to blue
            1,
            0.5
          )
        });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);

        // Position point
        const x = (reading.locationX / 100 - 0.5) * floorPlan.width * floorPlan.scale;
        const z = (reading.locationY / 100 - 0.5) * floorPlan.height * floorPlan.scale;
        point.position.set(x, y + 0.1, z);

        scene.add(point);

        // Add vertical line for value visualization
        const lineHeight = normalizedValue * levelSpacing * 0.8;
        const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, lineHeight);
        const lineMaterial = pointMaterial.clone();
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(x, y + lineHeight / 2, z);
        scene.add(line);
      });
    });
  }, [floorPlans, levelSpacing]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene, camera, renderer, controls } = sceneRef.current;

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || !sceneRef.current) return;

    const handleResize = () => {
      const { camera, renderer } = sceneRef.current!;
      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] rounded-lg overflow-hidden"
    />
  );
}
