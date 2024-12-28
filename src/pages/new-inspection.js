import React from 'react';
import InspectionForm from '../components/InspectionForm/InspectionForm';

export default function NewInspection() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>Create New Inspection</h1>
      <InspectionForm />
    </div>
  );
}
