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
          <li><a href="/">Home</a></li>
          <li><a href="/reports">Reports</a></li>
          <li><a href="/clients">Clients</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>
    </header>
  );
}
