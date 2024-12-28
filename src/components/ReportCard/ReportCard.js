import React from 'react';
import styles from './ReportCard.module.css';

const getSeverityColor = (severity) => {
  const colors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545'
  };
  return colors[severity] || colors.low;
};

const getDamageTypeIcon = (type) => {
  const icons = {
    water: '💧',
    fire: '🔥',
    mold: '🌿',
    storm: '⛈️'
  };
  return icons[type] || '📋';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ReportCard({ report }) {
  const {
    clientName,
    propertyAddress,
    inspectionDate,
    inspectorName,
    damageType,
    severity,
    status
  } = report;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>{getDamageTypeIcon(damageType)}</div>
        <div className={styles.title}>
          <h3>{clientName}</h3>
          <p className={styles.address}>{propertyAddress}</p>
        </div>
        <div 
          className={styles.status}
          style={{ backgroundColor: status === 'completed' ? '#28a745' : '#ffc107' }}
        >
          {status}
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>Inspection Date:</span>
          <span>{formatDate(inspectionDate)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Inspector:</span>
          <span>{inspectorName}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Damage Type:</span>
          <span className={styles.capitalize}>{damageType}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Severity:</span>
          <span 
            className={styles.severity}
            style={{ backgroundColor: getSeverityColor(severity) }}
          >
            {severity}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.viewButton}>View Report</button>
        <button className={styles.downloadButton}>Download PDF</button>
      </div>
    </div>
  );
}
