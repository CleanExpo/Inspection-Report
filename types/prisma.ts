import { PrismaClient } from '@prisma/client';

export type ClientWithInspections = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string | null;
  abn?: string | null;
  preferredContact?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  inspections: Array<{
    id: string;
    jobNumber: string;
    status: string;
    createdAt: Date;
  }>;
};

export type PrismaClientTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const ClientInclude = {
  inspections: {
    select: {
      id: true,
      jobNumber: true,
      status: true,
      createdAt: true,
    },
  },
} as const;

export type ClientCreateData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  abn?: string;
  preferredContact?: string;
  notes?: string;
};

export type ClientUpdateData = Partial<ClientCreateData>;
