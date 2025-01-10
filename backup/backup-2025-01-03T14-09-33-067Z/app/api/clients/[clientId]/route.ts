import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
      include: {
        jobs: {
          include: {
            scopes: true,
            invoices: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const data = await request.json();
    
    // Remove any fields that shouldn't be updated directly
    const {
      id,
      jobs,
      createdAt,
      updatedAt,
      ...updateData
    } = data;

    const updatedClient = await prisma.client.update({
      where: { id: params.clientId },
      data: updateData,
      include: {
        jobs: {
          include: {
            scopes: true,
            invoices: true,
          },
        },
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}
