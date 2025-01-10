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
    jobs: {
        list: `${BASE_URL}/jobs`,
        create: `${BASE_URL}/jobs`,
        get: (id) => `${BASE_URL}/jobs/${id}`,
        update: (id) => `${BASE_URL}/jobs/${id}`,
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
        iteration_duration: ['p(95)<1000']
    }
};
// Custom metrics
const jobCreationTrend = new metrics_1.Trend('job_creation_duration');
const jobUpdateTrend = new metrics_1.Trend('job_update_duration');
const jobListTrend = new metrics_1.Trend('job_list_duration');
const errorRate = new metrics_1.Rate('errors');
// Test data storage
const createdJobs = new Set();
// Helper function to generate test data
function generateTestData() {
    return {
        title: `Test Job ${Date.now()}`,
        description: 'Load test job',
        status: 'PENDING',
        priority: 'NORMAL'
    };
}
// Test lifecycle hooks
function setup() {
    console.log('Setting up job load test...');
}
exports.setup = setup;
function teardown() {
    console.log('Cleaning up job load test...');
    // Clean up created test jobs
    createdJobs.forEach(jobId => {
        http_1.default.del(endpoints.jobs.delete(jobId), { headers });
    });
}
exports.teardown = teardown;
function default_1() {
    // Create Job
    const jobData = generateTestData();
    const createRes = http_1.default.post(endpoints.jobs.create, JSON.stringify(jobData), { headers });
    jobCreationTrend.add(createRes.timings.duration);
    const success = (0, k6_1.check)(createRes, {
        'job created successfully': (r) => r.status === 201,
        'job has valid id': (r) => r.json('id') !== undefined,
    });
    if (!success) {
        errorRate.add(1);
        console.error(`Failed to create job: ${createRes.status} ${createRes.body}`);
        return;
    }
    const jobId = createRes.json('id');
    createdJobs.add(jobId);
    (0, k6_1.sleep)(1); // Brief pause between operations
    // Update Job
    const updateData = {
        ...jobData,
        status: 'IN_PROGRESS',
        description: 'Updated during load test'
    };
    const updateRes = http_1.default.put(endpoints.jobs.update(jobId), JSON.stringify(updateData), { headers });
    jobUpdateTrend.add(updateRes.timings.duration);
    (0, k6_1.check)(updateRes, {
        'job updated successfully': (r) => r.status === 200,
        'job status updated': (r) => r.json('status') === 'IN_PROGRESS',
    });
    (0, k6_1.sleep)(1);
    // List Jobs with Pagination
    const page = Math.floor(Math.random() * 5); // Random page between 0-4
    const listRes = http_1.default.get(`${endpoints.jobs.list}?page=${page}&limit=10`, { headers });
    jobListTrend.add(listRes.timings.duration);
    (0, k6_1.check)(listRes, {
        'job list returned successfully': (r) => r.status === 200,
        'job list contains items': (r) => r.json('items') !== undefined,
    });
    (0, k6_1.sleep)(2); // Longer pause before next iteration
}
exports.default = default_1;
