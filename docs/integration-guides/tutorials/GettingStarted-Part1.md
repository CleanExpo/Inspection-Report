# Tutorial Guide - Part 1: Getting Started

## Initial Setup Tutorial

This tutorial guides you through setting up your first inspection report project.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git (optional but recommended)
- Code editor (VS Code recommended)

### Step-by-Step Setup

1. **Project Initialization**

```bash
# Create a new project directory
mkdir my-inspection-project
cd my-inspection-project

# Initialize a new npm project
npm init -y

# Install core dependencies
npm install @inspection/core @inspection/components
npm install react react-dom next
npm install @mui/material @emotion/react @emotion/styled
```

2. **Configuration Setup**

```typescript
// config/inspection.config.ts
export const inspectionConfig = {
  project: {
    name: 'My Inspection Project',
    version: '1.0.0'
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000
  },
  features: {
    moistureMapping: true,
    photoCapture: true,
    voiceNotes: true
  }
};
```

### Basic Implementation

1. **Create Your First Inspection Form**

```typescript
// components/BasicInspectionForm.tsx
import { useState } from 'react';
import { InspectionForm, TextField, DatePicker } from '@inspection/components';

interface FormData {
  location: string;
  inspectionDate: Date;
  notes: string;
}

export function BasicInspectionForm() {
  const [formData, setFormData] = useState<FormData>({
    location: '',
    inspectionDate: new Date(),
    notes: ''
  });

  const handleSubmit = async (data: FormData) => {
    try {
      // Submit inspection data
      console.log('Submitting:', data);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <InspectionForm onSubmit={handleSubmit}>
      <TextField
        label="Location"
        value={formData.location}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          location: e.target.value
        }))}
        required
      />
      
      <DatePicker
        label="Inspection Date"
        value={formData.inspectionDate}
        onChange={(date) => setFormData(prev => ({
          ...prev,
          inspectionDate: date
        }))}
      />
      
      <TextField
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          notes: e.target.value
        }))}
        multiline
        rows={4}
      />
    </InspectionForm>
  );
}
```

2. **Implement Basic Photo Capture**

```typescript
// components/BasicPhotoCapture.tsx
import { PhotoCapture, PhotoDisplay } from '@inspection/components';

export function BasicPhotoCapture() {
  const [photos, setPhotos] = useState<string[]>([]);

  const handleCapture = (photoData: string) => {
    setPhotos(prev => [...prev, photoData]);
  };

  return (
    <div>
      <PhotoCapture
        onCapture={handleCapture}
        quality="high"
        allowFlash
      />
      
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <PhotoDisplay
            key={index}
            src={photo}
            alt={`Inspection photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
```

### Integration Example

```typescript
// pages/basic-inspection.tsx
import { BasicInspectionForm } from '../components/BasicInspectionForm';
import { BasicPhotoCapture } from '../components/BasicPhotoCapture';

export default function BasicInspectionPage() {
  return (
    <div className="container">
      <h1>Basic Inspection</h1>
      
      <section>
        <h2>Inspection Details</h2>
        <BasicInspectionForm />
      </section>
      
      <section>
        <h2>Photo Documentation</h2>
        <BasicPhotoCapture />
      </section>
    </div>
  );
}
```

## Common Patterns

### 1. Form Handling

```typescript
// hooks/useInspectionForm.ts
import { useState } from 'react';

export function useInspectionForm<T>(initialData: T) {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof T, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is modified
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    // Add validation logic here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    data,
    errors,
    handleChange,
    validate
  };
}
```

### 2. Data Management

```typescript
// utils/storage.ts
export const storageUtils = {
  saveInspection: (data: any) => {
    const inspections = JSON.parse(
      localStorage.getItem('inspections') || '[]'
    );
    inspections.push({
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('inspections', JSON.stringify(inspections));
  },
  
  getInspections: () => {
    return JSON.parse(localStorage.getItem('inspections') || '[]');
  }
};
```

## Best Practices

1. **Project Structure**
   - Organize components logically
   - Keep related files together
   - Use consistent naming conventions

2. **Form Implementation**
   - Implement proper validation
   - Handle errors gracefully
   - Provide user feedback

3. **Data Management**
   - Implement proper state management
   - Handle data persistence
   - Validate data integrity

4. **Photo Handling**
   - Optimize photo quality
   - Implement proper storage
   - Handle upload failures

## Next Steps

1. Explore advanced form features
2. Implement data synchronization
3. Add offline support
4. Integrate with backend services
