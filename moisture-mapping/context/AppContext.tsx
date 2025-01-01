import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  AppState, 
  AppAction, 
  AppContextType, 
  initialState,
  MediaItem,
  FieldNote,
  Report,
  Technician,
  Notification
} from '../types/shared';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage keys
const STORAGE_KEY = 'moisture-mapping-state';
const LAST_SYNC_KEY = 'moisture-mapping-last-sync';

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_REPORT':
      return {
        ...state,
        reports: [...state.reports, action.payload]
      };

    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(report =>
          report.id === action.payload.id ? action.payload : report
        )
      };

    case 'DELETE_REPORT':
      return {
        ...state,
        reports: state.reports.filter(report => report.id !== action.payload),
        activeReport: state.activeReport === action.payload ? null : state.activeReport
      };

    case 'SET_ACTIVE_REPORT':
      return {
        ...state,
        activeReport: action.payload
      };

    case 'UPDATE_TECHNICIAN':
      return {
        ...state,
        technicians: state.technicians.map(tech =>
          tech.id === action.payload.id ? action.payload : tech
        )
      };

    case 'SET_ACTIVE_TECHNICIAN':
      return {
        ...state,
        activeTechnician: action.payload
      };

    case 'ADD_MEDIA_ITEM':
      return {
        ...state,
        mediaItems: [...state.mediaItems, action.payload]
      };

    case 'UPDATE_MEDIA_ITEM':
      return {
        ...state,
        mediaItems: state.mediaItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };

    case 'DELETE_MEDIA_ITEM':
      return {
        ...state,
        mediaItems: state.mediaItems.filter(item => item.id !== action.payload)
      };

    case 'ADD_FIELD_NOTE':
      return {
        ...state,
        fieldNotes: [...state.fieldNotes, action.payload]
      };

    case 'UPDATE_FIELD_NOTE':
      return {
        ...state,
        fieldNotes: state.fieldNotes.map(note =>
          note.id === action.payload.id ? action.payload : note
        )
      };

    case 'DELETE_FIELD_NOTE':
      return {
        ...state,
        fieldNotes: state.fieldNotes.filter(note => note.id !== action.payload)
      };

    case 'ADD_MOISTURE_READING':
      return {
        ...state,
        moistureReadings: [...state.moistureReadings, action.payload]
      };

    case 'UPDATE_MOISTURE_READING':
      return {
        ...state,
        moistureReadings: state.moistureReadings.map(reading =>
          reading.id === action.payload.id ? action.payload : reading
        )
      };

    case 'DELETE_MOISTURE_READING':
      return {
        ...state,
        moistureReadings: state.moistureReadings.filter(reading => 
          reading.id !== action.payload
        )
      };

    case 'ADD_LIDAR_SCAN':
      return {
        ...state,
        lidarScans: [...state.lidarScans, action.payload]
      };

    case 'UPDATE_LIDAR_SCAN':
      return {
        ...state,
        lidarScans: state.lidarScans.map(scan =>
          scan.id === action.payload.id ? action.payload : scan
        )
      };

    case 'DELETE_LIDAR_SCAN':
      return {
        ...state,
        lidarScans: state.lidarScans.filter(scan => scan.id !== action.payload)
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.filter(notification => !notification.read)
      };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load initial state from local storage
  const [state, dispatch] = useReducer(appReducer, loadInitialState());

  // Save state changes to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  }, [state]);

  // Sync with server periodically
  useEffect(() => {
    const syncInterval = setInterval(syncWithServer, 30000); // Sync every 30 seconds
    return () => clearInterval(syncInterval);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for using the app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Helper functions
function loadInitialState(): AppState {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state from local storage:', error);
  }
  return initialState;
}

async function syncWithServer() {
  try {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    
    // Fetch any updates since last sync
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastSync,
        state: localStorage.getItem(STORAGE_KEY)
      })
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }

    // Update last sync timestamp
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error syncing with server:', error);
    // Could dispatch a notification here to inform user of sync failure
  }
}

// Utility functions for components
export function getActiveReport(state: AppState): Report | null {
  return state.activeReport
    ? state.reports.find(r => r.id === state.activeReport) ?? null
    : null;
}

export function getActiveTechnician(state: AppState): Technician | null {
  return state.activeTechnician
    ? state.technicians.find(t => t.id === state.activeTechnician) ?? null
    : null;
}

export function getReportMedia(state: AppState, reportId: string): MediaItem[] {
  const report = state.reports.find(r => r.id === reportId);
  return report ? report.mediaItems : [];
}

export function getReportNotes(state: AppState, reportId: string): FieldNote[] {
  const report = state.reports.find(r => r.id === reportId);
  return report ? report.notes : [];
}

export function getUnreadNotifications(state: AppState): Notification[] {
  return state.notifications.filter(n => !n.read);
}

export function createNotification(
  type: Notification['type'],
  message: string,
  targetId?: string,
  targetType?: Notification['targetType']
): Notification {
  return {
    id: `notification-${Date.now()}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    targetId,
    targetType
  };
}
