import { z } from 'zod';

// Job validation schema
const jobSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    clientId: z.string().uuid(),
    technicianId: z.string().uuid().optional(),
    scheduledDate: z.string().datetime().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    location: z.object({
        address: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string()
    }).optional(),
    notes: z.string().optional()
});

export type JobInput = z.infer<typeof jobSchema>;

export async function validateJobData(data: any, isUpdate = false): Promise<{ 
    success: boolean; 
    errors?: string[];
}> {
    try {
        const schema = isUpdate ? jobSchema.partial() : jobSchema;
        await schema.parseAsync(data);
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.errors.map(err => err.message)
            };
        }
        return {
            success: false,
            errors: ['Invalid input data']
        };
    }
}

export function sanitizeJobInput(data: any): JobInput {
    return {
        title: data.title?.trim(),
        description: data.description?.trim(),
        clientId: data.clientId,
        technicianId: data.technicianId,
        scheduledDate: data.scheduledDate,
        priority: data.priority,
        location: data.location ? {
            address: data.location.address?.trim(),
            city: data.location.city?.trim(),
            state: data.location.state?.trim(),
            zipCode: data.location.zipCode?.trim()
        } : undefined,
        notes: data.notes?.trim()
    };
}

// Date validation
export function validateDate(date: string): boolean {
    const dateObj = new Date(date);
    return dateObj.toString() !== 'Invalid Date';
}

// Generic input sanitization
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
