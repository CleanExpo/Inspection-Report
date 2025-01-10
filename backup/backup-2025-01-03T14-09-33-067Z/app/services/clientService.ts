import { prisma } from '../lib/prisma';
import { Client, ClientFormData } from '../types/client';
import { Prisma } from '@prisma/client';

export class ClientServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClientServiceError';
    }
}

/**
 * Client Service
 * Handles database operations for client management
 */
export class ClientService {
    /**
     * Creates a new client
     * @param data Client creation data
     * @returns Created client data
     * @throws {ClientServiceError} If creation fails
     */
    static async createClient(data: ClientFormData): Promise<Client> {
        try {
            const client = await prisma.clients.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    company: data.company,
                    address: data.address,
                    status: data.status
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    company: true,
                    address: true,
                    status: true,
                    lastInspection: true,
                    totalInspections: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            return client;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ClientServiceError('Email already exists');
                }
            }
            console.error('Database error:', error);
            throw new ClientServiceError('Failed to create client');
        }
    }

    /**
     * Retrieves a client by ID
     * @param clientId Client identifier
     * @returns Client data
     * @throws {ClientServiceError} If client not found
     */
    static async getClient(clientId: string): Promise<Client> {
        try {
            const client = await prisma.clients.findUnique({
                where: { id: clientId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    company: true,
                    address: true,
                    status: true,
                    lastInspection: true,
                    totalInspections: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!client) {
                throw new ClientServiceError('Client not found');
            }

            return client;
        } catch (error) {
            if (error instanceof ClientServiceError) {
                throw error;
            }
            console.error('Database error:', error);
            throw new ClientServiceError('Failed to retrieve client');
        }
    }

    /**
     * Lists clients with pagination
     * @param page Page number (1-based)
     * @param limit Items per page
     * @returns Paginated list of clients
     */
    static async listClients(page: number = 1, limit: number = 10): Promise<{ clients: Client[]; total: number }> {
        try {
            const skip = (page - 1) * limit;
            const [clients, total] = await Promise.all([
                prisma.clients.findMany({
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        company: true,
                        address: true,
                        status: true,
                        lastInspection: true,
                        totalInspections: true,
                        createdAt: true,
                        updatedAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.clients.count()
            ]);

            return { clients, total };
        } catch (error) {
            console.error('Database error:', error);
            throw new ClientServiceError('Failed to list clients');
        }
    }

    /**
     * Deletes a client
     * @param clientId Client identifier
     * @throws {ClientServiceError} If client not found or deletion fails
     */
    static async deleteClient(clientId: string): Promise<void> {
        try {
            await prisma.clients.delete({
                where: { id: clientId }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new ClientServiceError('Client not found');
                }
            }
            console.error('Database error:', error);
            throw new ClientServiceError('Failed to delete client');
        }
    }

    /**
     * Updates a client's information
     * @param clientId Client identifier
     * @param data Update data
     * @returns Updated client data
     * @throws {ClientServiceError} If client not found or update fails
     */
    static async updateClient(clientId: string, data: Partial<ClientFormData>): Promise<Client> {
        try {
            // Prepare update data with type safety
            const updateData = {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
                ...(data.phone && { phone: data.phone }),
                ...(data.company && { company: data.company }),
                ...(data.address && { address: data.address }),
                ...(data.status && { status: data.status })
            };

            const client = await prisma.clients.update({
                where: { id: clientId },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    company: true,
                    address: true,
                    status: true,
                    lastInspection: true,
                    totalInspections: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!client) {
                throw new ClientServiceError('Client not found');
            }

            return client;
        } catch (error) {
            if (error instanceof ClientServiceError) {
                throw error;
            }
            
            // Handle Prisma-specific errors
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new ClientServiceError('Client not found');
                }
                if (error.code === 'P2002') {
                    throw new ClientServiceError('Email already exists');
                }
            }
            
            // Log the actual error but throw a sanitized version
            console.error('Database error:', error);
            throw new ClientServiceError('Failed to update client');
        }
    }

    /**
     * Checks if a client exists
     * @param clientId Client identifier
     * @returns True if client exists
     */
    static async exists(clientId: string): Promise<boolean> {
        try {
            const count = await prisma.clients.count({
                where: { id: clientId }
            });
            return count > 0;
        } catch (error) {
            console.error('Database error:', error);
            throw new ClientServiceError('Failed to check client existence');
        }
    }
}
