import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';
const endpoints = {
    jobs: {
        list: `${BASE_URL}/jobs`,
        create: `${BASE_URL}/jobs`,
        get: (id: string) => `${BASE_URL}/jobs/${id}`,
        update: (id: string) => `${BASE_URL}/jobs/${id}`,
        delete: (id: string) => `${BASE_URL}/jobs/${id}`
    }
};

const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

// Test configuration
export const options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        iteration_duration: ['p(95)<1000']
    }
};

// Custom metrics
const jobCreationTrend = new Trend('job_creation_duration');
const jobUpdateTrend = new Trend('job_update_duration');
const jobListTrend = new Trend('job_list_duration');
const errorRate = new Rate('errors');

// Test data storage
const createdJobs = new Set<string>();

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
export function setup() {
    console.log('Setting up job load test...');
}

export function teardown() {
    console.log('Cleaning up job load test...');
    // Clean up created test jobs
    createdJobs.forEach(jobId => {
        http.del(endpoints.jobs.delete(jobId), { headers });
    });
}

export default function () {
    // Create Job
    const jobData = generateTestData();
    const createRes = http.post(endpoints.jobs.create, JSON.stringify(jobData), { headers });
    
    jobCreationTrend.add(createRes.timings.duration);
    const success = check(createRes, {
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

    sleep(1); // Brief pause between operations

    // Update Job
    const updateData = {
        ...jobData,
        status: 'IN_PROGRESS',
        description: 'Updated during load test'
    };
    
    const updateRes = http.put(
        endpoints.jobs.update(jobId),
        JSON.stringify(updateData),
        { headers }
    );
    
    jobUpdateTrend.add(updateRes.timings.duration);
    check(updateRes, {
        'job updated successfully': (r) => r.status === 200,
        'job status updated': (r) => r.json('status') === 'IN_PROGRESS',
    });

    sleep(1);

    // List Jobs with Pagination
    const page = Math.floor(Math.random() * 5); // Random page between 0-4
    const listRes = http.get(
        `${endpoints.jobs.list}?page=${page}&limit=10`,
        { headers }
    );
    
    jobListTrend.add(listRes.timings.duration);
    check(listRes, {
        'job list returned successfully': (r) => r.status === 200,
        'job list contains items': (r) => r.json('items') !== undefined,
    });

    sleep(2); // Longer pause before next iteration
}
