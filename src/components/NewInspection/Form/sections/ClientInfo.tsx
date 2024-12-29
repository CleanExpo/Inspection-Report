import React from 'react';
import { Field, ErrorMessage } from 'formik';
import styles from './FormSection.module.css';

export default function ClientInfo() {
  const validatePhone = (value: string) => {
    if (!value) return 'Phone number is required';
    // Basic phone validation - can be made more sophisticated
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }
  };

  return (
    <div className={styles.formSection} data-section="clientInfo">
      <h2 className={styles.sectionTitle}>Client Information</h2>
      
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="clientInfo.name" className={styles.label}>
            Client Name
          </label>
          <Field
            type="text"
            id="clientInfo.name"
            name="clientInfo.name"
            className={styles.input}
            placeholder="Enter client's full name"
            autoComplete="name"
          />
          <ErrorMessage
            name="clientInfo.name"
            component="div"
            className={styles.error}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="clientInfo.email" className={styles.label}>
            Email Address
          </label>
          <Field
            type="email"
            id="clientInfo.email"
            name="clientInfo.email"
            className={styles.input}
            placeholder="Enter client's email"
            autoComplete="email"
          />
          <ErrorMessage
            name="clientInfo.email"
            component="div"
            className={styles.error}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="clientInfo.phone" className={styles.label}>
            Phone Number
          </label>
          <Field
            type="tel"
            validate={validatePhone}
            autoComplete="tel"
            id="clientInfo.phone"
            name="clientInfo.phone"
            className={styles.input}
            placeholder="Enter client's phone number"
          />
          <ErrorMessage
            name="clientInfo.phone"
            component="div"
            className={styles.error}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="clientInfo.address" className={styles.label}>
            Address
          </label>
          <Field
            type="text"
            id="clientInfo.address"
            name="clientInfo.address"
            className={styles.input}
            placeholder="Enter client's address"
            autoComplete="street-address"
          />
          <ErrorMessage
            name="clientInfo.address"
            component="div"
            className={styles.error}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="clientInfo.company" className={styles.label}>
            Company <span className={styles.optional}>(Optional)</span>
          </label>
          <Field
            type="text"
            id="clientInfo.company"
            name="clientInfo.company"
            className={styles.input}
            placeholder="Enter company name if applicable"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="clientInfo.preferredContact" className={styles.label}>
            Preferred Contact Method <span className={styles.optional}>(Optional)</span>
          </label>
          <Field
            as="select"
            id="clientInfo.preferredContact"
            name="clientInfo.preferredContact"
            className={styles.input}
          >
            <option value="">Select preferred contact method</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
          </Field>
        </div>
      </div>
    </div>
  );
}
