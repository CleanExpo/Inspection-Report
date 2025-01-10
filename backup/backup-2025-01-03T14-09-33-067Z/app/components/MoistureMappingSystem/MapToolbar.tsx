import React from 'react';

export type DrawingMode = 'wall' | 'door' | 'window' | 'reading';

interface MapToolbarProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  readOnly?: boolean;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  mode,
  onModeChange,
  onUndo,
  canUndo = false,
  readOnly = false,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex gap-1">
        <button
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'wall'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onModeChange('wall')}
          disabled={readOnly}
          title="Draw Walls"
        >
          <WallIcon className="w-5 h-5" />
        </button>
        <button
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'door'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onModeChange('door')}
          disabled={readOnly}
          title="Place Doors"
        >
          <DoorIcon className="w-5 h-5" />
        </button>
        <button
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'window'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onModeChange('window')}
          disabled={readOnly}
          title="Place Windows"
        >
          <WindowIcon className="w-5 h-5" />
        </button>
        <button
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'reading'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onModeChange('reading')}
          disabled={readOnly}
          title="Add Moisture Reading"
        >
          <ReadingIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      <button
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onUndo}
        disabled={!canUndo || readOnly}
        title="Undo"
      >
        <UndoIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

const WallIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

const DoorIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M16 4v16" />
  </svg>
);

const WindowIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const ReadingIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="8" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const UndoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 7v6h6" />
    <path d="M3 13c0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9s-4.03 9-9 9c-2.49 0-4.74-1.01-6.36-2.64" />
  </svg>
);
