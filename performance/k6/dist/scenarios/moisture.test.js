"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teardown = exports.setup = exports.options = void 0;
const http_1 = __importDefault(require("k6/http"));
const k6_1 = require("k6");
const metrics_1 = require("k6/metrics");
// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';
const endpoints = {
    moisture: {
        readings: `${BASE_URL}/moisture/readings`,
        analysis: `${BASE_URL}/moisture/analysis`,
        history: (jobId) => `${BASE_URL}/moisture/history/${jobId}`
    },
    jobs: {
        create: `${BASE_URL}/jobs`,
        delete: (id) => `${BASE_URL}/jobs/${id}`
    }
};
const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
// Test configuration
exports.options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        iteration_duration: ['p(95)<1000'],
        'moisture_reading_submission': ['p(95)<300'],
        'moisture_analysis_request': ['p(95)<1000'],
        'moisture_history_request': ['p(95)<500']
    }
};
// Custom metrics
const readingSubmissionTrend = new metrics_1.Trend('moisture_reading_submission');
const analysisRequestTrend = new metrics_1.Trend('moisture_analysis_request');
const historyRequestTrend = new metrics_1.Trend('moisture_history_request');
const errorRate = new metrics_1.Rate('errors');
// Test data storage
const jobIds = new Set();
const readingIds = new Set();
// Helper function to generate test data
function generateTestData() {
    return {
        job: {
            title: `Test Job ${Date.now()}`,
            description: 'Load test job',
            status: 'PENDING',
            priority: 'NORMAL'
        },
        reading: {
            value: Math.random() * 100,
            location: 'Test Location',
            timestamp: new Date().toISOString()
        }
    };
}
// Test lifecycle hooks
function setup() {
    console.log('Setting up moisture load test...');
    // Create a test job for moisture readings
    const jobData = generateTestData().job;
    const createRes = http_1.default.post(endpoints.jobs.create, JSON.stringify(jobData), { headers });
    if (createRes.status === 201) {
        const jobId = createRes.json('id');
        jobIds.add(jobId);
        return { jobId };
    }
    throw new Error('Failed to create test job');
}
exports.setup = setup;
function teardown() {
    console.log('Cleaning up moisture load test...');
    // Clean up test data
    jobIds.forEach(jobId => {
        http_1.default.del(endpoints.jobs.delete(jobId), { headers });
    });
}
exports.teardown = teardown;
function default_1(data) {
    // Submit moisture reading
    const readingData = {
        ...generateTestData().reading,
        jobId: data.jobId
    };
    const submitRes = http_1.default.post(endpoints.moisture.readings, JSON.stringify(readingData), { headers });
    readingSubmissionTrend.add(submitRes.timings.duration);
    const success = (0, k6_1.check)(submitRes, {
        'reading submitted successfully': (r) => r.status === 201,
        'reading has valid id': (r) => r.json('id') !== undefined,
    });
    if (!success) {
        errorRate.add(1);
        console.error(`Failed to submit reading: ${submitRes.status} ${submitRes.body}`);
        return;
    }
    const readingId = submitRes.json('id');
    readingIds.add(readingId);
    (0, k6_1.sleep)(1);
    // Request moisture analysis
    const analysisRes = http_1.default.get(`${endpoints.moisture.analysis}?jobId=${data.jobId}`, { headers });
    analysisRequestTrend.add(analysisRes.timings.duration);
    (0, k6_1.check)(analysisRes, {
        'analysis returned successfully': (r) => r.status === 200,
        'analysis contains data': (r) => r.json('data') !== undefined,
    });
    (0, k6_1.sleep)(1);
    // Request moisture history
    const historyRes = http_1.default.get(endpoints.moisture.history(data.jobId), { headers });
    historyRequestTrend.add(historyRes.timings.duration);
    (0, k6_1.check)(historyRes, {
        'history returned successfully': (r) => r.status === 200,
        'history contains readings': (r) => Array.isArray(r.json('readings')),
        'history includes metadata': (r) => r.json('metadata') !== undefined,
    });
    // Simulate real-world usage pattern with variable delays
    (0, k6_1.sleep)(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
exports.default = default_1;
