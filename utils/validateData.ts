import { JobDetails } from '../types/job';
import { validateAgainstStandards } from '../services/standardsValidator';

export const validateData = (data: Partial<JobDetails>, includeStandards: boolean): string[] => {
  const errors: string[] = [];

  // Required fields validation
  if (!data.clientName) errors.push("Client Name is required.");
  if (!data.jobAddress) errors.push("Job Address is required.");
  if (!data.jobNumber) errors.push("Job Number is required.");

  // Photo validation
  if (!data.photos || data.photos.length === 0) {
    errors.push("At least one photo is required.");
  } else if (data.photos.some(photo => !photo.url || !photo.caption)) {
    errors.push("All photos must have a URL and caption.");
  }

  // Notes validation
  if (!data.notes || data.notes.length === 0) {
    errors.push("At least one note is required.");
  } else if (data.notes.some(note => !note.content)) {
    errors.push("All notes must have content.");
  }

  // Power details validation
  if (data.powerDetails) {
    if (typeof data.powerDetails.capacity !== 'number') {
      errors.push("Power capacity must be a number.");
    }
    if (!data.powerDetails.details) {
      errors.push("Power details description is required.");
    }
  }

  // Conditionally validate against Australian standards
  if (includeStandards) {
    errors.push(...validateAgainstStandards(data as JobDetails));
  }

  return errors;
};

export const validatePhotoUpload = (photos: JobDetails['photos']): string[] => {
  const errors: string[] = [];

  if (!photos || photos.length === 0) {
    errors.push("At least one photo is required");
    return errors;
  }

  photos.forEach((photo, index) => {
    if (!photo.url) errors.push(`Photo ${index + 1} must have a URL`);
    if (!photo.caption) errors.push(`Photo ${index + 1} must have a caption`);
  });

  return errors;
};

export const validateNoteAddition = (notes: JobDetails['notes']): string[] => {
  const errors: string[] = [];

  if (!notes || notes.length === 0) {
    errors.push("At least one note is required");
    return errors;
  }

  notes.forEach((note, index) => {
    if (!note.content) errors.push(`Note ${index + 1} must have content`);
    if (!note.timestamp) errors.push(`Note ${index + 1} must have a timestamp`);
  });

  return errors;
};
