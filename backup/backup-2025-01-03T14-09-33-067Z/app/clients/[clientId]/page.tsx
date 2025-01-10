import { notFound } from 'next/navigation';
import ClientDetailsView from '../../components/ClientDetails/ClientDetailsView';
import prisma from '../../lib/prisma';
import { ExtendedClient, ExtendedJob } from '../../components/ClientDetails/types';

async function getClientDetails(clientId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        jobs: {
          include: {
            scopes: true,
            invoices: true,
          },
        },
      },
    });

    return client;
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return null;
  }
}

async function updateClient(clientId: string, data: Partial<ExtendedClient>) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update client');
  }

  return response.json();
}

export default async function ClientPage({
  params
}: {
  params: { clientId: string };
}) {
  const client = await getClientDetails(params.clientId);

  if (!client) {
    notFound();
  }

  // Cast the Prisma types to our custom types
  const transformedClient = {
    ...client,
    jobs: client.jobs.map(job => ({
      ...job,
      scopes: job.scopes || [],
      invoices: job.invoices || [],
    })),
  } as unknown as ExtendedClient;

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientDetailsView 
        client={transformedClient}
        onUpdate={updateClient}
      />
    </div>
  );
}

// Generate static params for static site generation
export async function generateStaticParams() {
  const clients = await prisma.client.findMany({
    select: { id: true }
  });

  return clients.map((client) => ({
    clientId: client.id
  }));
}
