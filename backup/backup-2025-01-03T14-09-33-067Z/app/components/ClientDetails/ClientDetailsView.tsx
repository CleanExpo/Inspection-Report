import { useState } from 'react';
import Image from 'next/image';
import { MapIcon, PhoneIcon, EnvelopeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ExtendedClient } from './types';
import ClientEditForm from './ClientEditForm';

interface Props {
  client: ExtendedClient;
  onUpdate?: (clientId: string, data: Partial<ExtendedClient>) => Promise<void>;
}

export default function ClientDetailsView({ client, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleGetDirections = () => {
    if (client.latitude && client.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${client.latitude},${client.longitude}`,
        '_blank'
      );
    }
  };

  const formatAddress = () => {
    const parts = [
      client.address,
      client.city,
      client.state,
      client.postalCode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleSave = async (updatedClient: Partial<ExtendedClient>) => {
    try {
      if (onUpdate) {
        await onUpdate(client.id, updatedClient);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update client:', error);
      // You might want to show an error message to the user here
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <ClientEditForm
          client={client}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Property Image Section */}
      <div className="relative h-48 bg-gray-200">
        {client.propertyImage ? (
          <Image
            src={client.propertyImage}
            alt="Property"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No property image available
          </div>
        )}
      </div>

      {/* Client Information Section */}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center text-gray-600">
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            <a href={`mailto:${client.email}`} className="hover:text-blue-600">
              {client.email}
            </a>
          </div>
          {client.phone && (
            <div className="flex items-center text-gray-600">
              <PhoneIcon className="h-5 w-5 mr-2" />
              <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                {client.phone}
              </a>
            </div>
          )}
          {client.mobile && (
            <div className="flex items-center text-gray-600">
              <PhoneIcon className="h-5 w-5 mr-2" />
              <a href={`tel:${client.mobile}`} className="hover:text-blue-600">
                {client.mobile} (Mobile)
              </a>
            </div>
          )}
          {client.address && (
            <div className="flex items-center text-gray-600">
              <MapIcon className="h-5 w-5 mr-2" />
              <span>{formatAddress()}</span>
              {(client.latitude && client.longitude) && (
                <button
                  onClick={handleGetDirections}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Get Directions
                </button>
              )}
            </div>
          )}
        </div>

        {/* Jobs Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Jobs</h2>
          <div className="space-y-4">
            {client.jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <p className="text-gray-600 mt-1">{job.description}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-500">Status: {job.status}</span>
                  <span className="text-gray-500">Priority: {job.priority}</span>
                  {job.claimType && (
                    <span className="text-gray-500">Claim Type: {job.claimType}</span>
                  )}
                  {job.propertyType && (
                    <span className="text-gray-500">Property Type: {job.propertyType}</span>
                  )}
                </div>
                {/* Scopes and Invoices Summary */}
                <div className="mt-3 text-sm text-gray-500">
                  <div>Scopes: {job.scopes.length}</div>
                  <div>Invoices: {job.invoices.length}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        {client.notes && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
