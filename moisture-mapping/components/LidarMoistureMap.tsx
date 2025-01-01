import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Add as ZoomInIcon,
  Remove as ZoomOutIcon,
  PanTool as PanIcon,
  WaterDrop as MoistureIcon
} from '@mui/icons-material';
import * as THREE from 'three';
import { LidarMoistureMapProps } from '../types/components';
import { MoistureReading, getMoistureColor } from '../types/moisture';

export default function LidarMoistureMap({
  readings,
  onMoistureReading
}: LidarMoistureMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<'pan' | 'moisture'>('moisture');
  const [scale, setScale] = useState(1);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 5, 5);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Add grid helper
      const gridHelper = new THREE.GridHelper(10, 10);
      scene.add(gridHelper);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

      // Update moisture readings visualization
      updateMoistureVisualization(readings);

    } catch (err) {
      console.error('Error initializing 3D scene:', err);
      setError('Failed to initialize 3D visualization');
    }

    // Cleanup
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update visualization when readings change
  useEffect(() => {
    updateMoistureVisualization(readings);
  }, [readings]);

  const updateMoistureVisualization = (readings: MoistureReading[]) => {
    if (!sceneRef.current) return;

    // Remove existing moisture markers
    const existingMarkers = sceneRef.current.children.filter(
      child => child.userData.type === 'moisture-marker'
    );
    existingMarkers.forEach(marker => sceneRef.current!.remove(marker));

    // Add new moisture markers
    readings.forEach(reading => {
      const geometry = new THREE.SphereGeometry(0.1);
      const material = new THREE.MeshBasicMaterial({
        color: getMoistureColor(reading.value, reading.materialType),
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      // Position based on reading location (this would need proper coordinate mapping)
      const [x, y, z] = reading.location.split(',').map(Number);
      sphere.position.set(x || 0, y || 0, z || 0);
      
      sphere.userData = { type: 'moisture-marker', reading };
      sceneRef.current!.add(sphere);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (tool !== 'moisture' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Create new moisture reading at clicked position
    const reading: MoistureReading = {
      id: `reading-${Date.now()}`,
      value: 0, // This would be set by a moisture meter reading
      location: `${x},0,${y}`,
      materialType: 'Unknown',
      timestamp: new Date().toISOString(),
      device: {
        id: 'manual',
        name: 'Delmhorst',
        model: 'Manual Entry'
      },
      readingType: {
        id: 'wme',
        name: 'WME',
        unit: '%'
      },
      readingMethod: {
        id: 'manual',
        name: 'Pin'
      },
      inspectionDay: 1
    };

    onMoistureReading(reading);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Tooltip title="Pan">
          <IconButton
            color={tool === 'pan' ? 'primary' : 'default'}
            onClick={() => setTool('pan')}
          >
            <PanIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Moisture Reading">
          <IconButton
            color={tool === 'moisture' ? 'primary' : 'default'}
            onClick={() => setTool('moisture')}
          >
            <MoistureIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom In">
          <IconButton onClick={() => setScale(prev => prev * 1.1)}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={() => setScale(prev => prev / 1.1)}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box
        ref={containerRef}
        onClick={handleCanvasClick}
        sx={{
          width: '100%',
          height: 500,
          position: 'relative',
          cursor: tool === 'pan' ? 'grab' : 'crosshair'
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}
