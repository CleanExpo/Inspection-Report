import React, { useCallback } from 'react';
import { useField, useFormikContext } from 'formik';
import { useDropzone } from 'react-dropzone';
import styles from './FormSection.module.css';

interface PhotoPreview {
  file: File;
  preview: string;
}

export default function Photos() {
  const [field, meta, helpers] = useField('photos');
  const { setFieldValue } = useFormikContext();
  const [previews, setPreviews] = React.useState<PhotoPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
    setFieldValue('photos', [...field.value, ...acceptedFiles]);
  }, [field.value, setFieldValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    maxSize: 10485760, // 10MB
  });

  const removePhoto = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newPhotos = field.value.filter((_: File, i: number) => i !== index);
    
    setPreviews(newPreviews);
    setFieldValue('photos', newPhotos);
  };

  React.useEffect(() => {
    // Cleanup previews on unmount
    return () => previews.forEach(preview => URL.revokeObjectURL(preview.preview));
  }, [previews]);

  return (
    <div className={styles.formSection} data-section="photos">
      <h2 className={styles.sectionTitle}>Photos</h2>
      
      <div className={styles.fieldGroup}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
          >
            <input {...getInputProps()} />
            <div className={styles.dropzoneContent}>
              <svg
                className={styles.uploadIcon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Drag & drop photos here, or click to select</p>
              <span className={styles.dropzoneHint}>
                Accepted formats: JPEG, PNG, HEIC • Max size: 10MB
              </span>
            </div>
          </div>
          {meta.error && meta.touched && (
            <div className={styles.error}>{meta.error}</div>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className={styles.photoGrid}>
          {previews.map((preview, index) => (
            <div key={preview.preview} className={styles.photoPreview}>
              <img
                src={preview.preview}
                alt={`Preview ${index + 1}`}
                className={styles.previewImage}
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className={styles.removePhoto}
                aria-label="Remove photo"
              >
                ×
              </button>
              <div className={styles.photoInfo}>
                <span>{preview.file.name}</span>
                <span>{Math.round(preview.file.size / 1024)}KB</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
