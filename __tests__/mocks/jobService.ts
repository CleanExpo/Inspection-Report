import { jest } from '@jest/globals';
import type { JobService } from '../../app/services/jobService';

type ListJobsFunction = typeof JobService.listJobs;
export const mockListJobs: jest.MockedFunction<ListJobsFunction> = jest.fn();

jest.mock('../../app/services/jobService', () => ({
    JobService: {
        listJobs: mockListJobs
    }
}));
