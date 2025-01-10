"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestData = exports.headers = exports.endpoints = exports.scenarios = exports.defaultConfig = exports.BASE_URL = void 0;
exports.BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
exports.defaultConfig = {
    vus: 10,
    duration: '30s',
    rampUpTime: '10s',
    rampDownTime: '5s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        iteration_duration: ['p(95)<1000'] // 95% of iterations should complete within 1s
    },
    tags: {
        testType: 'api-load-test'
    }
};
exports.scenarios = {
    smoke: {
        ...exports.defaultConfig,
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
    load: exports.defaultConfig,
    stress: {
        ...exports.defaultConfig,
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
        ...exports.defaultConfig,
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
exports.endpoints = {
    jobs: {
        list: `${exports.BASE_URL}/jobs`,
        create: `${exports.BASE_URL}/jobs`,
        get: (id) => `${exports.BASE_URL}/jobs/${id}`,
        update: (id) => `${exports.BASE_URL}/jobs/${id}`,
        delete: (id) => `${exports.BASE_URL}/jobs/${id}`
    },
    inspections: {
        list: `${exports.BASE_URL}/inspections`,
        create: `${exports.BASE_URL}/inspections`,
        get: (id) => `${exports.BASE_URL}/inspections/${id}`,
        update: (id) => `${exports.BASE_URL}/inspections/${id}`,
        delete: (id) => `${exports.BASE_URL}/inspections/${id}`
    },
    moisture: {
        readings: `${exports.BASE_URL}/moisture/readings`,
        analysis: `${exports.BASE_URL}/moisture/analysis`,
        history: (jobId) => `${exports.BASE_URL}/moisture/history/${jobId}`
    },
    sync: {
        status: `${exports.BASE_URL}/sync/status`,
        queue: `${exports.BASE_URL}/sync/queue`
    }
};
exports.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
// Helper function to generate random test data
function generateTestData() {
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
exports.generateTestData = generateTestData;
