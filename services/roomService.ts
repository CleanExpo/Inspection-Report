import { Room, RoomInput, RoomDimensions } from '../types/room';

export const calculateRoomDimensions = (room: Room): RoomDimensions => {
  const floorArea = room.length * room.width;
  const wallArea = 2 * (room.length + room.width) * room.height;
  const volume = room.length * room.width * room.height;

  return {
    floorArea,
    wallArea,
    volume
  };
};

export const validateRoomInput = (room: RoomInput): string[] => {
  const errors: string[] = [];

  if (!room.name?.trim()) {
    errors.push("Room name is required");
  }

  if (!room.length || room.length <= 0) {
    errors.push("Valid length is required");
  }

  if (!room.width || room.width <= 0) {
    errors.push("Valid width is required");
  }

  if (!room.height || room.height <= 0) {
    errors.push("Valid height is required");
  }

  if (!room.flooring?.trim()) {
    errors.push("Flooring type is required");
  }

  if (!room.underlay?.trim()) {
    errors.push("Underlay type is required");
  }

  if (!room.subfloor?.trim()) {
    errors.push("Subfloor type is required");
  }

  return errors;
};

export const formatDimension = (value: number): string => {
  return `${value.toFixed(2)}m`;
};

export const formatArea = (value: number): string => {
  return `${value.toFixed(2)}m²`;
};

export const formatVolume = (value: number): string => {
  return `${value.toFixed(2)}m³`;
};

export const createRoom = (input: RoomInput): Room => {
  return {
    name: input.name || '',
    length: input.length || 0,
    width: input.width || 0,
    height: input.height || 0,
    flooring: input.flooring || '',
    underlay: input.underlay || '',
    subfloor: input.subfloor || '',
    affectedArea: input.affectedArea || false,
    installedEquipment: input.installedEquipment || []
  };
};
