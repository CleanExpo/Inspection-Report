import { NextResponse } from 'next/server';
import { ClientUpdateRequest, ClientUpdateResponse } from '../../../types/api';
import { validateClientData } from '../../../utils/clientValidation';
import { ClientService, ClientServiceError } from '../../../services/clientService';

/**
 * PUT /api/clients/:clientId
 * Updates client information
 */
export async function PUT(
    request: Request,
    { params }: { params: { clientId: string } }
) {
    try {
        // Parse request body
        const body = await request.json();
        
        // Basic request validation
        if (!body.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No update data provided',
                    errors: [{ field: 'data', message: 'Required field missing' }]
                } as ClientUpdateResponse,
                { status: 400 }
            );
        }

        // Validate and sanitize the update data
        try {
            validateClientData(body.data);
        } catch (error) {
            if (error instanceof Error) {
                // Extract field name from error message if possible
                const fieldMatch = error.message.match(/^([a-zA-Z]+):/);
                const field = fieldMatch ? fieldMatch[1].toLowerCase() : 'general';
                
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation failed',
                        errors: [{
                            field,
                            message: error.message
                        }]
                    } as ClientUpdateResponse,
                    { status: 400 }
                );
            }
        }

        // Update client in database
        try {
            const updatedClient = await ClientService.updateClient(params.clientId, body.data);
            
            return NextResponse.json({
                success: true,
                message: 'Client updated successfully',
                data: updatedClient
            } as ClientUpdateResponse);
            
        } catch (error) {
            if (error instanceof ClientServiceError) {
                return NextResponse.json({
                    success: false,
                    message: error.message,
                    errors: [{ field: 'general', message: error.message }]
                } as ClientUpdateResponse,
                { status: 400 });
            }
            throw error; // Re-throw other errors to be caught by outer catch block
        }

    } catch (error) {
        console.error('Client update error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                errors: [{ field: 'general', message: 'Failed to process request' }]
            } as ClientUpdateResponse,
            { status: 500 }
        );
    }
}
