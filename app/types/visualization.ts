import { Point } from './moisture';

export enum RenderMode {
  WIREFRAME = 'WIREFRAME',
  SOLID = 'SOLID',
  TEXTURED = 'TEXTURED',
  XRAY = 'XRAY'
}

export enum CameraType {
  PERSPECTIVE = 'PERSPECTIVE',
  ORTHOGRAPHIC = 'ORTHOGRAPHIC'
}

export enum LightType {
  AMBIENT = 'AMBIENT',
  DIRECTIONAL = 'DIRECTIONAL',
  POINT = 'POINT',
  SPOT = 'SPOT'
}

export enum MaterialType {
  BASIC = 'BASIC',
  PHONG = 'PHONG',
  PBR = 'PBR',
  CUSTOM = 'CUSTOM'
}

export interface Camera {
  id: string;
  type: CameraType;
  position: Point3D;
  target: Point3D;
  up: Point3D;
  fov: number;
  near: number;
  far: number;
  zoom: number;
  aspect: number;
  controls: {
    enabled: boolean;
    autoRotate: boolean;
    dampingFactor: number;
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
  };
}

export interface Light {
  id: string;
  type: LightType;
  color: string;
  intensity: number;
  position?: Point3D;
  direction?: Point3D;
  castShadow: boolean;
  shadowMapSize?: {
    width: number;
    height: number;
  };
}

export interface Material {
  id: string;
  type: MaterialType;
  color: string;
  opacity: number;
  transparent: boolean;
  wireframe: boolean;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  map?: string;
  normalMap?: string;
  aoMap?: string;
  side: 'FRONT' | 'BACK' | 'DOUBLE';
}

export interface Point3D extends Point {
  z: number;
}

export interface Model {
  id: string;
  name: string;
  geometry: {
    vertices: Point3D[];
    faces: number[][];
    normals: Point3D[];
    uvs: Point[];
  };
  material: Material;
  position: Point3D;
  rotation: Point3D;
  scale: Point3D;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  userData?: Record<string, any>;
}

export interface Scene {
  id: string;
  name: string;
  models: Model[];
  lights: Light[];
  cameras: Camera[];
  activeCamera: string;
  background: string;
  fog?: {
    color: string;
    near: number;
    far: number;
  };
  environment?: string;
  postProcessing: {
    enabled: boolean;
    effects: {
      bloom?: {
        strength: number;
        radius: number;
        threshold: number;
      };
      ssao?: {
        radius: number;
        intensity: number;
        bias: number;
      };
      dof?: {
        focus: number;
        aperture: number;
        maxBlur: number;
      };
    };
  };
}

export interface Interaction {
  type: 'SELECT' | 'MOVE' | 'ROTATE' | 'SCALE';
  modelId: string;
  point: Point3D;
  normal?: Point3D;
  face?: number;
  distance?: number;
  timestamp: number;
}

export interface Animation {
  id: string;
  modelId: string;
  property: 'position' | 'rotation' | 'scale' | 'opacity';
  keyframes: {
    time: number;
    value: number | Point3D;
    easing: 'LINEAR' | 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_OUT';
  }[];
  duration: number;
  loop: boolean;
  playing: boolean;
}

export interface RenderStats {
  fps: number;
  triangles: number;
  drawCalls: number;
  geometries: number;
  textures: number;
  shaders: number;
  frameTime: number;
  memoryUsage: {
    geometries: number;
    textures: number;
    shaders: number;
    total: number;
  };
}

export interface ViewConfig {
  renderMode: RenderMode;
  showGrid: boolean;
  showAxes: boolean;
  showBoundingBox: boolean;
  showShadows: boolean;
  antialiasing: boolean;
  toneMapped: boolean;
  exposure: number;
  gamma: number;
}

export interface ReportView {
  id: string;
  name: string;
  type: '2D' | '3D' | 'CHART' | 'TABLE';
  data: {
    source: string;
    filter?: string;
    aggregation?: string;
    groupBy?: string[];
    sortBy?: string;
    limit?: number;
  };
  visualization: {
    type: string;
    options: Record<string, any>;
    interactions?: {
      zoom?: boolean;
      pan?: boolean;
      select?: boolean;
      tooltip?: boolean;
    };
  };
  export: {
    formats: ('PNG' | 'SVG' | 'PDF' | 'CSV')[];
    resolution?: number;
    quality?: number;
  };
}

export interface VisualizationState {
  scene: Scene;
  view: ViewConfig;
  interactions: Interaction[];
  animations: Animation[];
  stats: RenderStats;
  reports: ReportView[];
}

export interface VisualizationUpdate {
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'TRANSFORM';
  target: {
    type: 'MODEL' | 'LIGHT' | 'CAMERA' | 'MATERIAL' | 'ANIMATION';
    id: string;
  };
  changes: Record<string, any>;
  timestamp: number;
}

export interface VisualizationSnapshot {
  id: string;
  timestamp: number;
  scene: Scene;
  camera: {
    position: Point3D;
    target: Point3D;
    zoom: number;
  };
  stats: RenderStats;
}

export interface VisualizationExport {
  type: 'IMAGE' | 'VIDEO' | 'MODEL' | 'DATA';
  format: string;
  quality: number;
  dimensions?: {
    width: number;
    height: number;
  };
  camera?: string;
  range?: {
    start: number;
    end: number;
  };
  options?: Record<string, any>;
}
