export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface Boundary {
  points: Point2D[];  // Clockwise ordered points forming a polygon
  height: number;     // Height of the room/wall
}

export interface Door {
  start: Point2D;
  end: Point2D;
  isOpen?: boolean;
  type?: 'hinged' | 'sliding' | 'pocket' | 'unknown';
}

export interface Window {
  start: Point2D;
  end: Point2D;
  height: number;
  sillHeight: number;
}

export interface Room {
  id: string;
  name?: string;
  number?: string;
  boundary: Boundary;
  doors: Door[];
  windows: Window[];
  floorLevel: number;
  ceiling: number;
  metadata?: {
    type?: string;
    area?: number;
    tags?: string[];
    [key: string]: any;
  };
}

export interface Floor {
  level: number;
  rooms: Room[];
  elevation: number;  // meters above ground level
  metadata?: {
    name?: string;
    totalArea?: number;
    [key: string]: any;
  };
}

export interface Building {
  id: string;
  name?: string;
  location: {
    latitude: number;
    longitude: number;
    elevation: number;  // ground level elevation
  };
  floors: Floor[];
  metadata?: {
    address?: string;
    constructionYear?: number;
    totalArea?: number;
    [key: string]: any;
  };
}

export interface Transition {
  type: 'door' | 'hallway' | 'stairs' | 'elevator';
  from: {
    roomId: string;
    floorLevel: number;
  };
  to: {
    roomId: string;
    floorLevel: number;
  };
  points: Point3D[];  // Path or connection points
}

export interface BuildingMap {
  building: Building;
  transitions: Transition[];
  timestamp: number;
  version: string;
  metadata?: {
    creator?: string;
    device?: string;
    accuracy?: number;
    [key: string]: any;
  };
}
