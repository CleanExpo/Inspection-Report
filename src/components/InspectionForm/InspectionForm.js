import React, { useState, useCallback } from 'react';
import styles from './InspectionForm.module.css';
import Notification from '../Notification/Notification';

export default function InspectionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    // Client Information
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    propertyAddress: '',
    
    // Inspection Details
    inspectionDate: '',
    inspectorName: '',
    damageType: '',
    severity: 'low',
    
    // Moisture Readings
    moistureReadings: [{ location: '', reading: '', unit: '%' }],
    
    // Additional Information
    notes: '',
    recommendations: ''
  });

  const [photos, setPhotos] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
  };

  const handleMoistureReadingAdd = () => {
    setFormData(prev => ({
      ...prev,
      moistureReadings: [...prev.moistureReadings, { location: '', reading: '', unit: '%' }]
    }));
  };

  const handleMoistureReadingChange = (index, field, value) => {
    setFormData(prev => {
      const newReadings = [...prev.moistureReadings];
      newReadings[index] = { ...newReadings[index], [field]: value };
      return { ...prev, moistureReadings: newReadings };
    });
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.clientName.trim()) {
      setNotification({ type: 'error', message: 'Client name is required' });
      return false;
    }
    if (!formData.propertyAddress.trim()) {
      setNotification({ type: 'error', message: 'Property address is required' });
      return false;
    }
    if (!formData.inspectionDate) {
      setNotification({ type: 'error', message: 'Inspection date is required' });
      return false;
    }
    if (!formData.inspectorName.trim()) {
      setNotification({ type: 'error', message: 'Inspector name is required' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotification({
        type: 'success',
        message: 'Inspection report created successfully!'
      });
      
      // Reset form after successful submission
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        propertyAddress: '',
        inspectionDate: '',
        inspectorName: '',
        damageType: '',
        severity: 'low',
        moistureReadings: [{ location: '', reading: '', unit: '%' }],
        notes: '',
        recommendations: ''
      });
      setPhotos([]);
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to create report. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearNotification = useCallback(() => {
    setNotification({ type: '', message: '' });
  }, []);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>New Inspection Report</h2>
      
      {/* Client Information Section */}
      <section className={styles.section}>
        <h3>Client Information</h3>
        <div className={styles.formGroup}>
          <label htmlFor="clientName">Client Name</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="clientEmail">Email</label>
          <input
            type="email"
            id="clientEmail"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="clientPhone">Phone</label>
          <input
            type="tel"
            id="clientPhone"
            name="clientPhone"
            value={formData.clientPhone}
            onChange={handleChange}
            required
          />
        </div>
      </section>

      <div className={styles.formGroup}>
        <label htmlFor="propertyAddress">Property Address</label>
        <input
          type="text"
          id="propertyAddress"
          name="propertyAddress"
          value={formData.propertyAddress}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="inspectionDate">Inspection Date</label>
        <input
          type="date"
          id="inspectionDate"
          name="inspectionDate"
          value={formData.inspectionDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="inspectorName">Inspector Name</label>
        <input
          type="text"
          id="inspectorName"
          name="inspectorName"
          value={formData.inspectorName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="damageType">Type of Damage</label>
        <select
          id="damageType"
          name="damageType"
          value={formData.damageType}
          onChange={handleChange}
          required
        >
          <option value="">Select damage type</option>
          <option value="water">Water Damage</option>
          <option value="fire">Fire Damage</option>
          <option value="mold">Mold</option>
          <option value="storm">Storm Damage</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="severity">Severity Level</label>
        <select
          id="severity"
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Moisture Readings Section */}
      <section className={styles.section}>
        <h3>Moisture Readings</h3>
        {formData.moistureReadings.map((reading, index) => (
          <div key={index} className={styles.moistureReading}>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                value={reading.location}
                onChange={(e) => handleMoistureReadingChange(index, 'location', e.target.value)}
                placeholder="e.g., Living Room Wall"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Reading</label>
              <input
                type="number"
                value={reading.reading}
                onChange={(e) => handleMoistureReadingChange(index, 'reading', e.target.value)}
                placeholder="Enter reading"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Unit</label>
              <select
                value={reading.unit}
                onChange={(e) => handleMoistureReadingChange(index, 'unit', e.target.value)}
              >
                <option value="%">%</option>
                <option value="WME">WME</option>
                <option value="REL">REL</option>
              </select>
            </div>
          </div>
        ))}
        <button 
          type="button" 
          onClick={handleMoistureReadingAdd}
          className={styles.addButton}
        >
          Add Reading
        </button>
      </section>

      {/* Photo Upload Section */}
      <section className={styles.section}>
        <h3>Photos</h3>
        <div className={styles.photoUpload}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className={styles.fileInput}
          />
          <div className={styles.photoPreview}>
            {photos.map((photo, index) => (
              <div key={index} className={styles.photoThumb}>
                {photo.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notes and Recommendations */}
      <section className={styles.section}>
        <h3>Additional Information</h3>
        <div className={styles.formGroup}>
          <label htmlFor="notes">Inspection Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the damage and current conditions..."
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="recommendations">Recommendations</label>
          <textarea
            id="recommendations"
            name="recommendations"
            value={formData.recommendations}
            onChange={handleChange}
            rows="4"
            placeholder="Provide recommendations for remediation..."
          />
        </div>
      </section>

      <Notification
        type={notification.type}
        message={notification.message}
        onClose={clearNotification}
      />

      <button 
        type="submit" 
        className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
        disabled={isLoading}
      >
        {isLoading ? 'Creating Report...' : 'Create Report'}
      </button>
    </form>
  );
}
