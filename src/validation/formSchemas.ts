import * as Yup from 'yup';
import { SEVERITY_LEVELS, PROPERTY_TYPES, DAMAGE_TYPES, CONTACT_METHODS, AFFECTED_AREAS } from '../types/form';

const phoneRegExp = /^\+?[\d\s-()]{10,}$/;

export const clientInfoSchema = Yup.object({
  name: Yup.string()
    .required('Client name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(phoneRegExp, 'Invalid phone number format'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters'),
  company: Yup.string()
    .optional()
    .max(100, 'Company name must not exceed 100 characters'),
  preferredContact: Yup.string()
    .optional()
    .oneOf(CONTACT_METHODS, 'Invalid contact method'),
});

export const propertyDetailsSchema = Yup.object({
  address: Yup.string()
    .required('Property address is required')
    .min(5, 'Address must be at least 5 characters'),
  propertyType: Yup.string()
    .required('Property type is required')
    .oneOf(PROPERTY_TYPES, 'Invalid property type'),
  dateOfLoss: Yup.date()
    .required('Date of loss is required')
    .max(new Date(), 'Date cannot be in the future'),
  typeOfLoss: Yup.string()
    .required('Type of loss is required')
    .oneOf(DAMAGE_TYPES, 'Invalid damage type'),
  buildingAge: Yup.number()
    .optional()
    .min(0, 'Building age must be positive')
    .max(1000, 'Building age seems too high'),
  squareFootage: Yup.number()
    .optional()
    .min(0, 'Square footage must be positive')
    .max(1000000, 'Square footage seems too high'),
});

export const damageAssessmentSchema = Yup.object({
  description: Yup.string()
    .required('Damage description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  severity: Yup.string()
    .required('Severity level is required')
    .oneOf(SEVERITY_LEVELS, 'Invalid severity level'),
  affectedAreas: Yup.array()
    .of(Yup.string().oneOf(AFFECTED_AREAS, 'Invalid affected area'))
    .min(1, 'At least one affected area must be selected')
    .required('Affected areas are required'),
  recommendations: Yup.string()
    .required('Recommendations are required')
    .min(10, 'Recommendations must be at least 10 characters')
    .max(2000, 'Recommendations must not exceed 2000 characters'),
  estimatedArea: Yup.number()
    .optional()
    .min(0, 'Estimated area must be positive')
    .max(1000000, 'Estimated area seems too high'),
  notes: Yup.string()
    .optional()
    .max(1000, 'Notes must not exceed 1000 characters'),
});

export const photosSchema = Yup.object({
  photos: Yup.array()
    .of(
      Yup.mixed<File>()
        .test('fileSize', 'File is too large', (value) => {
          if (!value || !(value instanceof File)) return true;
          return value.size <= 10 * 1024 * 1024; // 10MB
        })
        .test('fileType', 'Unsupported file type', (value) => {
          if (!value || !(value instanceof File)) return true;
          return ['image/jpeg', 'image/png', 'image/heic'].includes(value.type);
        })
    )
    .min(1, 'At least one photo is required')
    .required('Photos are required'),
});

export const getValidationSchema = (section: string) => {
  switch (section) {
    case 'clientInfo':
      return clientInfoSchema;
    case 'propertyDetails':
      return propertyDetailsSchema;
    case 'damageAssessment':
      return damageAssessmentSchema;
    case 'photos':
      return photosSchema;
    default:
      return Yup.object({});
  }
};

export const completeValidationSchema = Yup.object({
  clientInfo: clientInfoSchema,
  propertyDetails: propertyDetailsSchema,
  damageAssessment: damageAssessmentSchema,
  photos: photosSchema,
});
