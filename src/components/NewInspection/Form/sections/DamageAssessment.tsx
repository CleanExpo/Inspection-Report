import React from 'react';
import { Field, ErrorMessage } from 'formik';
import styles from './FormSection.module.css';

const AFFECTED_AREAS = [
  'Walls',
  'Ceiling',
  'Floor',
  'Basement',
  'Attic',
  'Kitchen',
  'Bathroom',
  'Living Room',
  'Bedroom',
  'Exterior',
  'Roof',
  'Foundation',
  'HVAC System',
  'Plumbing',
  'Electrical',
];

export default function DamageAssessment() {
  return (
    <div className={styles.formSection} data-section="damageAssessment">
      <h2 className={styles.sectionTitle}>Damage Assessment</h2>
      
      <div className={styles.fieldGroup}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="damageAssessment.description" className={styles.label}>
            Damage Description
          </label>
          <Field
            as="textarea"
            id="damageAssessment.description"
            name="damageAssessment.description"
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Provide a detailed description of the damage"
            rows={4}
          />
          <ErrorMessage
            name="damageAssessment.description"
            component="div"
            className={styles.error}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="damageAssessment.severity" className={styles.label}>
            Severity Level
          </label>
          <Field
            as="select"
            id="damageAssessment.severity"
            name="damageAssessment.severity"
            className={styles.input}
          >
            <option value="">Select severity level</option>
            <option value="low">Low - Minor damage, easily repairable</option>
            <option value="medium">Medium - Moderate damage requiring professional repair</option>
            <option value="high">High - Significant damage requiring extensive repair</option>
            <option value="critical">Critical - Severe damage requiring immediate attention</option>
          </Field>
          <ErrorMessage
            name="damageAssessment.severity"
            component="div"
            className={styles.error}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="damageAssessment.estimatedArea" className={styles.label}>
            Estimated Affected Area (sq ft) <span className={styles.optional}>(Optional)</span>
          </label>
          <Field
            type="number"
            id="damageAssessment.estimatedArea"
            name="damageAssessment.estimatedArea"
            className={styles.input}
            placeholder="Enter estimated affected area"
            min="0"
          />
        </div>
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
        <div className={styles.field}>
          <label className={styles.label}>
            Affected Areas
          </label>
          <div className={styles.checkboxGrid}>
            {AFFECTED_AREAS.map(area => (
              <label key={area} className={styles.checkbox}>
                <Field
                  type="checkbox"
                  name="damageAssessment.affectedAreas"
                  value={area.toLowerCase()}
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
          <ErrorMessage
            name="damageAssessment.affectedAreas"
            component="div"
            className={styles.error}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="damageAssessment.recommendations" className={styles.label}>
            Recommendations
          </label>
          <Field
            as="textarea"
            id="damageAssessment.recommendations"
            name="damageAssessment.recommendations"
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Provide recommendations for repair and restoration"
            rows={4}
          />
          <ErrorMessage
            name="damageAssessment.recommendations"
            component="div"
            className={styles.error}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="damageAssessment.notes" className={styles.label}>
            Additional Notes <span className={styles.optional}>(Optional)</span>
          </label>
          <Field
            as="textarea"
            id="damageAssessment.notes"
            name="damageAssessment.notes"
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Any additional notes or observations"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
