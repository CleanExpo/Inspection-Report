import React from 'react';
import styles from './Notification.module.css';

export default function Notification({ type, message, onClose }) {
  if (!message) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <p>{message}</p>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>
      )}
    </div>
  );
}
