# Tutorial Guide - Part 2: Advanced Features & Integration

## Advanced Features Implementation

### 1. Moisture Mapping Integration

```typescript
// components/MoistureMappingTutorial.tsx
import { useState } from 'react';
import { MoistureMap, MoistureReadings } from '@inspection/components';

export function MoistureMappingTutorial() {
  const [readings, setReadings] = useState<MoistureReading[]>([]);

  const handleReadingCapture = (reading: MoistureReading) => {
    setReadings(prev => [...prev, {
      ...reading,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="moisture-mapping-container">
      <MoistureMap
        readings={readings}
        onReadingCapture={handleReadingCapture}
        gridSize={20}
        showLegend
      />
      
      <MoistureReadings
        data={readings}
        onDelete={(id) => {
          setReadings(prev => 
            prev.filter(reading => reading.id !== id)
          );
        }}
      />
    </div>
  );
}
```

### 2. Voice Notes Implementation

```typescript
// components/VoiceNotesTutorial.tsx
import { VoiceRecorder, VoicePlayer } from '@inspection/components';

export function VoiceNotesTutorial() {
  const [recordings, setRecordings] = useState<VoiceNote[]>([]);

  const handleRecording = async (audioBlob: Blob) => {
    const recording: VoiceNote = {
      id: Date.now().toString(),
      blob: audioBlob,
      timestamp: new Date().toISOString(),
      duration: await getAudioDuration(audioBlob)
    };
    
    setRecordings(prev => [...prev, recording]);
  };

  return (
    <div className="voice-notes-container">
      <VoiceRecorder
        onRecordingComplete={handleRecording}
        maxDuration={60} // 60 seconds
        format="audio/webm"
      />
      
      <div className="recordings-list">
        {recordings.map(recording => (
          <div key={recording.id} className="recording-item">
            <VoicePlayer
              src={URL.createObjectURL(recording.blob)}
              duration={recording.duration}
            />
            <span className="timestamp">
              {new Date(recording.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Report Generation Integration

```typescript
// components/ReportGenerationTutorial.tsx
import { ReportTemplate, ReportPreview } from '@inspection/components';

interface ReportData {
  inspectionDetails: any;
  moistureReadings: MoistureReading[];
  photos: string[];
  voiceNotes: VoiceNote[];
}

export function ReportGenerationTutorial() {
  const [reportData, setReportData] = useState<ReportData>({
    inspectionDetails: {},
    moistureReadings: [],
    photos: [],
    voiceNotes: []
  });

  const handleGenerate = async () => {
    try {
      const report = await generateReport(reportData);
      // Handle report generation success
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  return (
    <div className="report-generation">
      <ReportTemplate
        data={reportData}
        onChange={setReportData}
        sections={[
          'details',
          'moisture',
          'photos',
          'voice-notes'
        ]}
      />
      
      <ReportPreview
        data={reportData}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
```

## Integration with Backend Services

### 1. API Integration Setup

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000
});

api.interceptors.request.use(config => {
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const inspectionApi = {
  // Inspection endpoints
  createInspection: async (data: any) => {
    const response = await api.post('/inspections', data);
    return response.data;
  },
  
  uploadPhotos: async (inspectionId: string, photos: File[]) => {
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('photos', photo);
    });
    
    const response = await api.post(
      `/inspections/${inspectionId}/photos`,
      formData
    );
    return response.data;
  },
  
  uploadVoiceNote: async (inspectionId: string, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await api.post(
      `/inspections/${inspectionId}/voice-notes`,
      formData
    );
    return response.data;
  }
};
```

### 2. Data Synchronization

```typescript
// utils/sync.ts
export class SyncManager {
  private syncQueue: any[] = [];
  private isSyncing = false;

  async queueSync(data: any) {
    this.syncQueue.push(data);
    await this.processSyncQueue();
  }

  private async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;
    
    this.isSyncing = true;
    
    try {
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue[0];
        await this.syncItem(item);
        this.syncQueue.shift();
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: any) {
    // Implement sync logic here
    await inspectionApi.createInspection(item);
  }
}

export const syncManager = new SyncManager();
```

## Advanced Usage Examples

### 1. Offline Support Implementation

```typescript
// utils/offlineStorage.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface InspectionDB extends DBSchema {
  inspections: {
    key: string;
    value: any;
    indexes: { 'by-date': Date };
  };
  sync_queue: {
    key: string;
    value: any;
  };
}

class OfflineStorage {
  private db: IDBPDatabase<InspectionDB> | null = null;

  async initialize() {
    this.db = await openDB<InspectionDB>('inspections-db', 1, {
      upgrade(db) {
        db.createObjectStore('inspections', {
          keyPath: 'id'
        }).createIndex('by-date', 'createdAt');
        
        db.createObjectStore('sync_queue', {
          keyPath: 'id'
        });
      }
    });
  }

  async saveInspection(data: any) {
    if (!this.db) await this.initialize();
    
    const id = Date.now().toString();
    await this.db!.put('inspections', {
      ...data,
      id,
      createdAt: new Date()
    });
    
    // Queue for sync
    await this.db!.put('sync_queue', {
      id,
      type: 'inspection',
      data
    });
    
    return id;
  }
}

export const offlineStorage = new OfflineStorage();
```

## Best Practices

1. **Data Management**
   - Implement proper offline storage
   - Handle synchronization conflicts
   - Maintain data integrity

2. **API Integration**
   - Handle network errors gracefully
   - Implement retry mechanisms
   - Use proper authentication

3. **Performance**
   - Optimize large data sets
   - Implement proper caching
   - Handle resource limitations

4. **User Experience**
   - Provide progress feedback
   - Handle offline/online transitions
   - Implement error recovery

## Next Steps

1. Implement authentication
2. Add real-time updates
3. Enhance offline capabilities
4. Implement advanced reporting
