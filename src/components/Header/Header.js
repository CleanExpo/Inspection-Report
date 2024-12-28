import React from 'react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          Inspection Report
        </div>
        <ul className={styles.menu}>
          <li><a href="/" className={styles.link}>Home</a></li>
          <li><a href="/reports" className={styles.link}>Reports</a></li>
          <li><a href="/new-inspection" className={styles.link}>New Inspection</a></li>
          <li><a href="/clients" className={styles.link}>Clients</a></li>
          <li><a href="/settings" className={styles.link}>Settings</a></li>
        </ul>
      </nav>
    </header>
  );
}
