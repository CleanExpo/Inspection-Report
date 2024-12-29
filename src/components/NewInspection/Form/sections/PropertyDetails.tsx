import React from 'react';
import { Field, ErrorMessage } from 'formik';
import styles from './FormSection.module.css';

export default function PropertyDetails() {
  return (
    <div className={styles.formSection} data-section="propertyDetails">
      <h2 className={styles.sectionTitle}>Property Details</h2>
      
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="propertyDetails.address" className={styles.label}>
            Property Address
          </label>
          <Field
            type="text"
            id="propertyDetails.address"
            name="propertyDetails.address"
            className={styles.input}
            placeholder="Enter property address"
            autoComplete="street-address"
          />
          <ErrorMessage
            name="propertyDetails.address"
            component="div"
            className={styles.error}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="propertyDetails.propertyType" className={styles.label}>
            Property Type
          </label>
          <Field
            as="select"
            id="propertyDetails.propertyType"
            name="propertyDetails.propertyType"
            className={styles.input}
          >
            <option value="">Select property type</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="multi-unit">Multi-Unit Residential</option>
            <option value="other">Other</option>
          </Field>
          <ErrorMessage
            name="propertyDetails.propertyType"
            component="div"
            className={styles.error}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="propertyDetails.dateOfLoss" className={styles.label}>
            Date of Loss
          </label>
          <Field
            type="date"
            id="propertyDetails.dateOfLoss"
            name="propertyDetails.dateOfLoss"
            className={styles.input}
            max={new Date().toISOString().split('T')[0]}
          />
          <ErrorMessage
            name="propertyDetails.dateOfLoss"
            component="div"
            className={styles.error}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="propertyDetails.typeOfLoss" className={styles.label}>
            Type of Loss
          </label>
          <Field
            as="select"
            id="propertyDetails.typeOfLoss"
            name="propertyDetails.typeOfLoss"
            className={styles.input}
          >
            <option value="">Select type of loss</option>
            <option value="water">Water Damage</option>
            <option value="fire">Fire Damage</option>
            <option value="mold">Mold</option>
            <option value="storm">Storm Damage</option>
            <option value="flood">Flood</option>
            <option value="other">Other</option>
          </Field>
          <ErrorMessage
            name="propertyDetails.typeOfLoss"
            component="div"
            className={styles.error}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="propertyDetails.buildingAge" className={styles.label}>
            Building Age <span className={styles.optional}>(Optional)</span>
          </label>
          <Field
            type="number"
            id="propertyDetails.buildingAge"
            name="propertyDetails.buildingAge"
            className={styles.input}
            placeholder="Enter building age in years"
            min="0"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="propertyDetails.squareFootage" className={styles.label}>
            Square Footage <span className={styles.optional}>(Optional)</span>
          </label>
          <Field
            type="number"
            id="propertyDetails.squareFootage"
            name="propertyDetails.squareFootage"
            className={styles.input}
            placeholder="Enter property square footage"
            min="0"
          />
        </div>
      </div>
    </div>
  );
}
