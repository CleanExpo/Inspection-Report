import { ClientService, ClientServiceError } from '../../app/services/clientService';
import { prisma } from '../../app/lib/prisma';
import { ClientFormData } from '../../app/types/client';
import { PrismaClient } from '@prisma/client';

// Create mock type
type MockPrismaClient = {
    clients: {
        update: jest.Mock;
        count: jest.Mock;
    };
} & Omit<PrismaClient, 'clients'>;

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
    prisma: {
        clients: {
            update: jest.fn(),
            count: jest.fn()
        }
    }
}));

// Type assertion for mocked prisma
const mockedPrisma = prisma as unknown as MockPrismaClient;

describe('ClientService', () => {
    const mockClientId = '123';
    const mockUpdateData: Partial<ClientFormData> = {
        name: 'John Doe',
        email: 'john@example.com'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('updateClient', () => {
        it('should update client successfully', async () => {
            const mockClient = {
                id: mockClientId,
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234-5678',
                company: null,
                address: null,
                status: 'active',
                lastInspection: null,
                totalInspections: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockedPrisma.clients.update.mockResolvedValue(mockClient);

            const result = await ClientService.updateClient(mockClientId, mockUpdateData);
            
            expect(result).toEqual(mockClient);
            expect(mockedPrisma.clients.update).toHaveBeenCalledWith({
                where: { id: mockClientId },
                data: expect.objectContaining(mockUpdateData)
            });
        });

        it('should handle optional fields correctly', async () => {
            const mockUpdateDataWithOptionals: Partial<ClientFormData> = {
                name: 'John Doe',
                email: 'john@example.com',
                company: 'ACME Corp',
                address: '123 Main St'
            };

            const mockClient = {
                id: mockClientId,
                ...mockUpdateDataWithOptionals,
                phone: '1234-5678',
                status: 'active',
                lastInspection: null,
                totalInspections: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockedPrisma.clients.update.mockResolvedValue(mockClient);

            const result = await ClientService.updateClient(mockClientId, mockUpdateDataWithOptionals);
            
            expect(result).toEqual(mockClient);
            expect(mockedPrisma.clients.update).toHaveBeenCalledWith({
                where: { id: mockClientId },
                data: expect.objectContaining(mockUpdateDataWithOptionals)
            });
        });

        it('should throw error when client not found', async () => {
            mockedPrisma.clients.update.mockResolvedValue(null);

            await expect(
                ClientService.updateClient(mockClientId, mockUpdateData)
            ).rejects.toThrow(ClientServiceError);
        });

        it('should handle database errors', async () => {
            mockedPrisma.clients.update.mockRejectedValue(new Error('DB Error'));

            await expect(
                ClientService.updateClient(mockClientId, mockUpdateData)
            ).rejects.toThrow('Failed to update client');
        });
    });

    describe('exists', () => {
        it('should return true when client exists', async () => {
            mockedPrisma.clients.count.mockResolvedValue(1);

            const result = await ClientService.exists(mockClientId);
            
            expect(result).toBe(true);
            expect(mockedPrisma.clients.count).toHaveBeenCalledWith({
                where: { id: mockClientId }
            });
        });

        it('should return false when client does not exist', async () => {
            mockedPrisma.clients.count.mockResolvedValue(0);

            const result = await ClientService.exists(mockClientId);
            
            expect(result).toBe(false);
        });

        it('should handle database errors', async () => {
            mockedPrisma.clients.count.mockRejectedValue(new Error('DB Error'));

            await expect(
                ClientService.exists(mockClientId)
            ).rejects.toThrow(ClientServiceError);
        });
    });
});
