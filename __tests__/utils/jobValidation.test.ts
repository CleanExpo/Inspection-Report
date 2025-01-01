import { 
    validateJobNumber, 
    generateJobNumber, 
    validateJobStatus,
    validateJobPriority,
    validateJobCategory,
    JobStatus,
    JobPriority,
    JobCategory,
    JobValidationError 
} from '../../app/utils/jobValidation';

describe('Job Validation Utilities', () => {
    describe('validateJobNumber', () => {
        it('should accept valid job numbers', () => {
            const validNumbers = [
                '2024-0101-001',
                '2024-0131-999',
                '2024-1231-123'
            ];

            validNumbers.forEach(num => {
                expect(() => validateJobNumber(num)).not.toThrow();
            });
        });

        it('should reject invalid formats', () => {
            const invalidFormats = [
                '202-0101-001',  // Wrong year format
                '2024-001-001',  // Wrong month/day format
                '2024-0101-01',  // Wrong sequence format
                '2024-0101_001', // Wrong separator
                'YYYY-MMDD-XXX', // Non-numeric
                ''               // Empty string
            ];

            invalidFormats.forEach(num => {
                expect(() => validateJobNumber(num)).toThrow(JobValidationError);
            });
        });

        it('should reject invalid dates', () => {
            const invalidDates = [
                '2024-0000-001', // Invalid month/day
                '2024-1300-001', // Month > 12
                '2024-0132-001', // Day > 31
                '2024-0229-001', // Non-leap year February
                '1999-0101-001', // Year < 2000
                '2050-0101-001'  // Year too far in future
            ];

            invalidDates.forEach(num => {
                expect(() => validateJobNumber(num)).toThrow(JobValidationError);
            });
        });

        it('should reject invalid sequence numbers', () => {
            const invalidSequences = [
                '2024-0101-000', // Zero sequence
                '2024-0101-1000' // Sequence > 999
            ];

            invalidSequences.forEach(num => {
                expect(() => validateJobNumber(num)).toThrow(JobValidationError);
            });
        });
    });

    describe('generateJobNumber', () => {
        it('should generate valid job numbers', () => {
            const jobNumber = generateJobNumber();
            expect(() => validateJobNumber(jobNumber)).not.toThrow();
        });

        it('should use provided sequence number', () => {
            const sequence = 42;
            const jobNumber = generateJobNumber(sequence);
            expect(jobNumber).toMatch(/-042$/);
        });

        it('should pad sequence numbers with zeros', () => {
            const sequence = 5;
            const jobNumber = generateJobNumber(sequence);
            expect(jobNumber).toMatch(/-005$/);
        });

        it('should reject invalid sequence numbers', () => {
            expect(() => generateJobNumber(0)).toThrow(JobValidationError);
            expect(() => generateJobNumber(1000)).toThrow(JobValidationError);
            expect(() => generateJobNumber(-1)).toThrow(JobValidationError);
        });

        it('should use current date', () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            
            const jobNumber = generateJobNumber();
            expect(jobNumber).toMatch(new RegExp(`^${year}-${month}${day}-`));
        });
    });

    describe('validateJobStatus', () => {
        it('should accept valid job statuses', () => {
            Object.values(JobStatus).forEach(status => {
                expect(() => validateJobStatus(status)).not.toThrow();
            });
        });

        it('should reject invalid job statuses', () => {
            const invalidStatuses = [
                'INVALID_STATUS',
                'pending',
                'in_progress',
                '',
                'NEW'
            ];

            invalidStatuses.forEach(status => {
                expect(() => validateJobStatus(status)).toThrow(JobValidationError);
            });
        });
    });

    describe('validateJobPriority', () => {
        it('should accept valid job priorities', () => {
            Object.values(JobPriority).forEach(priority => {
                expect(() => validateJobPriority(priority)).not.toThrow();
            });
        });

        it('should reject invalid job priorities', () => {
            const invalidPriorities = [
                'INVALID_PRIORITY',
                'low',
                'medium',
                '',
                'CRITICAL'
            ];

            invalidPriorities.forEach(priority => {
                expect(() => validateJobPriority(priority)).toThrow(JobValidationError);
            });
        });
    });

    describe('validateJobCategory', () => {
        it('should accept valid job categories', () => {
            Object.values(JobCategory).forEach(category => {
                expect(() => validateJobCategory(category)).not.toThrow();
            });
        });

        it('should reject invalid job categories', () => {
            const invalidCategories = [
                'INVALID_CATEGORY',
                'inspection',
                'remediation',
                '',
                'OTHER'
            ];

            invalidCategories.forEach(category => {
                expect(() => validateJobCategory(category)).toThrow(JobValidationError);
            });
        });
    });
});
