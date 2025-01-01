'use client';

import { useState } from 'react';
import { Equipment, EquipmentType, EquipmentStatus } from '@prisma/client';
import EquipmentForm from '../components/EquipmentForm';
import EquipmentList from '../components/EquipmentList';

interface EquipmentInput {
  serialNumber: string;
  model: string;
  type: EquipmentType;
  calibrationDate: string;
  nextCalibrationDue: string;
  status?: EquipmentStatus;
}

export default function EquipmentPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const handleSubmit = async (data: EquipmentInput) => {
    try {
      const response = await fetch('/api/moisture/equipment' + (editingEquipment ? `/${editingEquipment.id}` : ''), {
        method: editingEquipment ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save equipment');
      }

      // Reset form state
      setShowForm(false);
      setEditingEquipment(null);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to save equipment');
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Equipment Management
        </h1>
        <button
          onClick={() => {
            setEditingEquipment(null);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showForm ? 'Cancel' : 'Add Equipment'}
        </button>
      </div>

      {showForm ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <EquipmentForm
            onSubmit={handleSubmit}
            initialData={editingEquipment ? {
              serialNumber: editingEquipment.serialNumber,
              model: editingEquipment.model,
              type: editingEquipment.type,
              calibrationDate: editingEquipment.calibrationDate.toISOString().split('T')[0],
              nextCalibrationDue: editingEquipment.nextCalibrationDue.toISOString().split('T')[0],
              status: editingEquipment.status
            } : undefined}
          />
        </div>
      ) : (
        <EquipmentList onEdit={handleEdit} />
      )}
    </div>
  );
}
