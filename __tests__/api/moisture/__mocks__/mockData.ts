import { MoistureUnitSchema } from '../../../../api/moisture/types/schemas';

export const mockReadings = [
  {
    id: 'reading1',
    jobId: 'job1',
    locationX: 10.5,
    locationY: 20.75,
    room: 'living room',
    floor: '1',
    dataPoints: [
      { value: 15.5, unit: 'WME' as const, createdAt: new Date('2024-01-01T10:00:00Z') },
      { value: 16.2, unit: 'WME' as const, createdAt: new Date('2024-01-01T10:05:00Z') }
    ],
    equipment: {
      id: 'equip1',
      model: 'TestMeter',
      serialNumber: 'TM123'
    },
    floorPlan: {
      id: 'fp1'
    },
    environmentalData: {
      temperature: 21.5,
      humidity: 45.5,
      pressure: 1013.2
    },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:05:00Z')
  },
  {
    id: 'reading2',
    jobId: 'job1',
    locationX: 15.25,
    locationY: 25.5,
    room: 'kitchen',
    floor: '1',
    dataPoints: [
      { value: 17.8, unit: 'WME' as const, createdAt: new Date('2024-01-01T11:00:00Z') }
    ],
    equipment: {
      id: 'equip1',
      model: 'TestMeter',
      serialNumber: 'TM123'
    },
    floorPlan: {
      id: 'fp1'
    },
    environmentalData: {
      temperature: 22.0,
      humidity: 46.0,
      pressure: 1013.0
    },
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z')
  }
];

export const mockBatchOperations = {
  create: {
    operation: 'create' as const,
    data: {
      jobId: 'job1',
      locationX: 30.5,
      locationY: 40.25,
      room: 'bedroom',
      floor: '2',
      dataPoints: [
        { value: 18.5, unit: 'WME' as const }
      ],
      equipmentId: 'equip1',
      floorPlanId: 'fp1',
      temperature: 21.0,
      humidity: 45.0,
      pressure: 1013.0
    }
  },
  update: {
    operation: 'update' as const,
    id: 'reading1',
    data: {
      locationX: 31.0,
      locationY: 41.0,
      room: 'master bedroom',
      notes: 'Updated reading'
    }
  },
  delete: {
    operation: 'delete' as const,
    id: 'reading1'
  }
};

export const mockExportRequest = {
  options: {
    format: 'json' as const,
    includeMetadata: true,
    dateRange: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z'
    }
  },
  filters: {
    jobId: 'job1',
    room: 'living room',
    floor: '1'
  }
};

export const mockAnalyticsRequest = {
  jobId: 'job1',
  room: 'living room',
  floor: '1',
  timeframe: '24h' as const
};
