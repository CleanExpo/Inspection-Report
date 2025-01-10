export const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

export interface LoadTestConfig {
  vus: number;           // Virtual Users
  duration: string;      // Test duration (e.g., '30s', '1m', '1h')
  rampUpTime?: string;   // Time to ramp up to target VUs
  rampDownTime?: string; // Time to ramp down from target VUs
  thresholds: {
    http_req_duration: string[];    // Response time thresholds
    http_req_failed: string[];      // Error rate thresholds
    iteration_duration: string[];    // Iteration duration thresholds
  };
  tags?: Record<string, string>;    // Custom tags for metrics
}

export const defaultConfig: LoadTestConfig = {
  vus: 10,
  duration: '30s',
  rampUpTime: '10s',
  rampDownTime: '5s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should complete within 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% error rate
    iteration_duration: ['p(95)<1000'] // 95% of iterations should complete within 1s
  },
  tags: {
    testType: 'api-load-test'
  }
};

export const scenarios = {
  smoke: {
    ...defaultConfig,
    vus: 1,
    duration: '1m',
    thresholds: {
      http_req_duration: ['p(95)<200'],
      http_req_failed: ['rate=0'],
      iteration_duration: ['p(95)<500']
    },
    tags: {
      testType: 'smoke-test'
    }
  },
  load: defaultConfig,
  stress: {
    ...defaultConfig,
    vus: 50,
    duration: '5m',
    rampUpTime: '30s',
    rampDownTime: '30s',
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.05'],
      iteration_duration: ['p(95)<2000']
    },
    tags: {
      testType: 'stress-test'
    }
  },
  soak: {
    ...defaultConfig,
    vus: 5,
    duration: '1h',
    rampUpTime: '1m',
    rampDownTime: '1m',
    thresholds: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      http_req_failed: ['rate<0.01'],
      iteration_duration: ['p(95)<1000', 'p(99)<2000']
    },
    tags: {
      testType: 'soak-test'
    }
  }
};

export const endpoints = {
  jobs: {
    list: `${BASE_URL}/jobs`,
    create: `${BASE_URL}/jobs`,
    get: (id: string) => `${BASE_URL}/jobs/${id}`,
    update: (id: string) => `${BASE_URL}/jobs/${id}`,
    delete: (id: string) => `${BASE_URL}/jobs/${id}`
  },
  inspections: {
    list: `${BASE_URL}/inspections`,
    create: `${BASE_URL}/inspections`,
    get: (id: string) => `${BASE_URL}/inspections/${id}`,
    update: (id: string) => `${BASE_URL}/inspections/${id}`,
    delete: (id: string) => `${BASE_URL}/inspections/${id}`
  },
  moisture: {
    readings: `${BASE_URL}/moisture/readings`,
    analysis: `${BASE_URL}/moisture/analysis`,
    history: (jobId: string) => `${BASE_URL}/moisture/history/${jobId}`
  },
  sync: {
    status: `${BASE_URL}/sync/status`,
    queue: `${BASE_URL}/sync/queue`
  }
};

export const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Helper function to generate random test data
export function generateTestData() {
  return {
    job: {
      title: `Test Job ${Date.now()}`,
      description: 'Load test job',
      status: 'PENDING',
      priority: 'NORMAL'
    },
    inspection: {
      type: 'MOISTURE_MAPPING',
      status: 'PENDING',
      notes: 'Load test inspection'
    },
    moisture: {
      value: Math.random() * 100,
      location: 'Test Location',
      timestamp: new Date().toISOString()
    }
  };
}
