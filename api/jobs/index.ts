import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../app/lib/prisma';
import { JobStatus, JobPriority, UserRole, Job, JobWithRelations } from '../../types/prisma';
import { validateJobData, sanitizeJobInput } from '../../utils/validation';
import { handleError, assertUser, assertAuthenticated, assertResourceExists } from '../../utils';
import { JobsResponse, JobResponse, ErrorResponse } from '../../types/api';
import type { Prisma } from '@prisma/client';

// Define sort order type since it's not available from Prisma
type SortOrder = 'asc' | 'desc';

// Auth middleware types
type AuthMiddleware = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const authenticate: AuthMiddleware = (handler) => async (req, res) => {
    // Add user to request
    (req as AuthenticatedRequest).user = {
        id: '1',  // This should be replaced with actual auth logic
        role: UserRole.ADMIN,
        email: 'admin@example.com'
    };
    return handler(req as AuthenticatedRequest, res);
};

interface AuthenticatedRequest extends NextApiRequest {
    user: {
        id: string;
        role: UserRole;
        email: string;
    };
}

type JobInclude = {
    client?: boolean;
    assignedTechnician?: boolean;
    readings?: boolean;
    photos?: boolean;
    notes?: boolean;
};

type JobFindUniqueArgs = {
    where: { id: string };
    include?: JobInclude;
};

export default authenticate(async function handler(
    req: AuthenticatedRequest,
    res: NextApiResponse<JobResponse | JobsResponse | ErrorResponse>
) {
    assertAuthenticated(!!req.user);

    try {
        switch (req.method) {
            case 'GET':
                return await handleGetJobs(req, res);
            case 'POST':
                return await handleCreateJob(req, res);
            case 'PUT':
                return await handleUpdateJob(req, res);
            case 'DELETE':
                return await handleDeleteJob(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        return handleError(error, res);
    }
});

async function handleGetJobs(
    req: AuthenticatedRequest,
    res: NextApiResponse<JobsResponse>
) {
    const { 
        userId, 
        status, 
        priority,
        startDate,
        endDate,
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    // Build filter conditions
    const where: Record<string, any> = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status as JobStatus;
    if (priority) where.priority = priority as JobPriority;
    if (startDate || endDate) {
        where.scheduledDate = {};
        if (startDate) where.scheduledDate.gte = new Date(startDate as string);
        if (endDate) where.scheduledDate.lte = new Date(endDate as string);
    }

    // Get total count for pagination
    const total = await prisma.job.count({ where });

    // Get jobs with pagination and sorting
    const jobs = await prisma.job.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
            [sortBy as string]: sortOrder as SortOrder
        },
        include: {
            client: true,
            assignedTechnician: true,
            readings: true,
            photos: true
        }
    });

    return res.status(200).json({
        data: { jobs },
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total,
            pages: Math.ceil(total / pageSize)
        }
    });
}

async function handleCreateJob(
    req: AuthenticatedRequest,
    res: NextApiResponse<JobResponse | ErrorResponse>
) {
    // Validate user has permission to create jobs
    assertUser(
        req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.MANAGER,
        'Only admins and managers can create jobs'
    );

    // Validate and sanitize input
    const sanitizedData = sanitizeJobInput(req.body);
    const validationResult = await validateJobData(sanitizedData);
    
    if (!validationResult.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: validationResult.errors
        });
    }

    // Create job with relations
    const job = await prisma.job.create({
        data: {
            ...sanitizedData,
            status: JobStatus.PENDING,
            createdBy: { connect: { id: req.user.id } },
            client: { connect: { id: sanitizedData.clientId } },
            ...(sanitizedData.technicianId && {
                assignedTechnician: { connect: { id: sanitizedData.technicianId } }
            })
        },
        include: {
            client: true,
            assignedTechnician: true
        }
    });

    return res.status(201).json({ data: { job } });
}

async function handleUpdateJob(
    req: AuthenticatedRequest,
    res: NextApiResponse<JobResponse | ErrorResponse>
) {
    const { id } = req.query;
    
    // Validate user has permission to update jobs
    const userRole = req.user?.role;
    assertUser(
        userRole === UserRole.ADMIN || 
        userRole === UserRole.MANAGER || 
        userRole === UserRole.TECHNICIAN,
        'Insufficient permissions to update jobs'
    );

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
        where: { id: id as string }
    });

    if (!existingJob) {
        return res.status(404).json({ message: 'Job not found' });
    }

    // Technicians can only update their assigned jobs
    if (userRole === UserRole.TECHNICIAN) {
        const assignedJob = await prisma.job.findUnique({
            where: { id: id as string },
            include: { assignedTechnician: true }
        });
        
        assertUser(
            assignedJob?.assignedTechnician?.id === req.user?.id,
            'Technicians can only update their assigned jobs'
        );
    }

    // Validate and sanitize input
    const sanitizedData = sanitizeJobInput(req.body);
    const validationResult = await validateJobData(sanitizedData, true);
    
    if (!validationResult.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: validationResult.errors
        });
    }

    // Update job
    const updatedJob = await prisma.job.update({
        where: { id: id as string },
        data: {
            ...sanitizedData,
            ...(sanitizedData.technicianId && {
                assignedTechnician: { connect: { id: sanitizedData.technicianId } }
            })
        },
        include: {
            client: true,
            assignedTechnician: true,
            readings: true,
            photos: true
        }
    });

    return res.status(200).json({ data: { job: updatedJob } });
}

async function handleDeleteJob(
    req: AuthenticatedRequest,
    res: NextApiResponse<ErrorResponse>
) {
    const { id } = req.query;

    // Validate user has permission to delete jobs
    assertUser(
        req.user?.role === UserRole.ADMIN,
        'Only administrators can delete jobs'
    );

    // Check if job exists
    const job = await prisma.job.findUnique({
        where: { id: id as string }
    });

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    // Delete job (related records will be deleted via cascading delete in schema)
    try {
        await prisma.job.delete({
            where: { id: id as string }
        });

        return res.status(204).json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete operation failed:', error);
        throw error;
    }
}

// Job status update endpoint
export async function updateJobStatus(
    req: AuthenticatedRequest,
    res: NextApiResponse<JobResponse | ErrorResponse>
) {
    const { id } = req.query;
    const { status } = req.body;

    // Validate user has permission to update job status
    const userRole = req.user?.role;
    assertUser(
        userRole === UserRole.ADMIN || 
        userRole === UserRole.MANAGER || 
        userRole === UserRole.TECHNICIAN,
        'Insufficient permissions to update job status'
    );

    // Validate status transition
    const job = await prisma.job.findUnique({
        where: { id: id as string },
        include: { assignedTechnician: true }
    });

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    // Technicians can only update their assigned jobs
    if (userRole === UserRole.TECHNICIAN) {
        assertUser(
            job.assignedTechnician?.id === req.user?.id,
            'Technicians can only update status of their assigned jobs'
        );
    }

    // Validate status transition
    if (!isValidStatusTransition(job.status, status)) {
        return res.status(400).json({
            message: `Invalid status transition from ${job.status} to ${status}`
        });
    }

    // Update job status
    const updatedJob = await prisma.job.update({
        where: { id: id as string },
        data: {
            status,
            ...(status === JobStatus.COMPLETED && {
                completedAt: new Date()
            })
        },
        include: {
            client: true,
            assignedTechnician: true
        }
    });

    return res.status(200).json({ data: { job: updatedJob } });
}

// Helper function to validate status transitions
function isValidStatusTransition(
    currentStatus: JobStatus,
    newStatus: JobStatus
): boolean {
    const validTransitions: Record<JobStatus, JobStatus[]> = {
        [JobStatus.PENDING]: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
        [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED, JobStatus.ON_HOLD],
        [JobStatus.ON_HOLD]: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
        [JobStatus.COMPLETED]: [JobStatus.IN_PROGRESS], // Allow reopening if needed
        [JobStatus.CANCELLED]: [JobStatus.PENDING] // Allow reactivating
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
}
