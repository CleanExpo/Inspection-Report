import { PrismaClient } from '@prisma/client';
import { ClientData, ClientValidator } from '../utils/clientValidation';
import { DatabaseError, NotFoundError, ValidationError } from '../utils/errors';
import { ClientWithInspections, ClientInclude } from '../types/prisma';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export class ClientService {
  static async createClient(data: ClientData): Promise<ClientWithInspections> {
    try {
      // Validate client data
      const validation = ClientValidator.validateClient(data);
      if (!validation.isValid) {
        throw new ValidationError('Invalid client data', validation.errors);
      }

      // Sanitize client data
      const sanitizedData = ClientValidator.sanitizeClient(data);

      // Create client in database
      const client = await prisma.$transaction(async (tx) => {
        const created = await (tx as any).client.create({
          data: {
            name: sanitizedData.name,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            address: sanitizedData.address,
            company: sanitizedData.company,
            abn: sanitizedData.abn,
            preferredContact: sanitizedData.preferredContact,
            notes: sanitizedData.notes,
          },
          include: ClientInclude,
        });

        return created as ClientWithInspections;
      });

      return client;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      if ((error as any).code === 'P2002') {
        throw new ValidationError('Client already exists', {
          email: ['A client with this email already exists'],
        });
      }
      throw new DatabaseError('Failed to create client', (error as any).code);
    }
  }

  static async updateClient(id: string, data: Partial<ClientData>): Promise<ClientWithInspections> {
    try {
      // First check if client exists
      const existingClient = await (prisma as any).client.findUnique({
        where: { id },
        include: ClientInclude,
      }) as ClientWithInspections | null;

      if (!existingClient) {
        throw new NotFoundError(`Client not found with id: ${id}`);
      }

      // Merge existing data with updates for validation
      const mergedData = {
        ...existingClient,
        ...data,
      } as ClientData;

      // Validate merged data
      const validation = ClientValidator.validateClient(mergedData);
      if (!validation.isValid) {
        throw new ValidationError('Invalid client data', validation.errors);
      }

      // Sanitize the update data
      const sanitizedData = ClientValidator.sanitizeClient(mergedData);

      // Update client in database
      const updatedClient = await prisma.$transaction(async (tx) => {
        const updated = await (tx as any).client.update({
          where: { id },
          data: {
            name: sanitizedData.name,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            address: sanitizedData.address,
            company: sanitizedData.company,
            abn: sanitizedData.abn,
            preferredContact: sanitizedData.preferredContact,
            notes: sanitizedData.notes,
          },
          include: ClientInclude,
        });

        return updated as ClientWithInspections;
      });

      return updatedClient;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      if ((error as any).code === 'P2002') {
        throw new ValidationError('Client already exists', {
          email: ['A client with this email already exists'],
        });
      }
      throw new DatabaseError('Failed to update client', (error as any).code);
    }
  }

  static async getClient(id: string): Promise<ClientWithInspections> {
    try {
      const client = await (prisma as any).client.findUnique({
        where: { id },
        include: ClientInclude,
      }) as ClientWithInspections | null;

      if (!client) {
        throw new NotFoundError(`Client not found with id: ${id}`);
      }

      return client;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to retrieve client', (error as any).code);
    }
  }

  static async searchClients(query: string): Promise<ClientWithInspections[]> {
    try {
      const clients = await (prisma as any).client.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } },
            { company: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: ClientInclude,
        orderBy: {
          updatedAt: 'desc',
        },
      }) as ClientWithInspections[];

      return clients;
    } catch (error) {
      throw new DatabaseError('Failed to search clients', (error as any).code);
    }
  }

  static async deleteClient(id: string): Promise<void> {
    try {
      // Check if client exists
      const client = await (prisma as any).client.findUnique({
        where: { id },
        include: ClientInclude,
      }) as ClientWithInspections | null;

      if (!client) {
        throw new NotFoundError(`Client not found with id: ${id}`);
      }

      // Check if client has any inspections
      if (client.inspections.length > 0) {
        throw new ValidationError('Cannot delete client with existing inspections', {
          inspections: ['Client has associated inspections that must be deleted first'],
        });
      }

      // Delete client
      await (prisma as any).client.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete client', (error as any).code);
    }
  }

  static async getClientByEmail(email: string): Promise<ClientWithInspections> {
    try {
      const client = await (prisma as any).client.findUnique({
        where: { email: email.toLowerCase() },
        include: ClientInclude,
      }) as ClientWithInspections | null;

      if (!client) {
        throw new NotFoundError(`Client not found with email: ${email}`);
      }

      return client;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to retrieve client', (error as any).code);
    }
  }

  static async getClientByPhone(phone: string): Promise<ClientWithInspections> {
    try {
      const normalizedPhone = phone.replace(/[\s\-()]/g, '');
      const client = await (prisma as any).client.findFirst({
        where: { phone: normalizedPhone },
        include: ClientInclude,
      }) as ClientWithInspections | null;

      if (!client) {
        throw new NotFoundError(`Client not found with phone: ${phone}`);
      }

      return client;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to retrieve client', (error as any).code);
    }
  }
}
