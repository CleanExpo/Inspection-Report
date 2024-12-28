import React, { useState, useEffect } from 'react';
import ReportCard from '../components/ReportCard/ReportCard';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import AnimatedList from '../components/TransitionGroup/TransitionGroup';
import { getReports } from '../data/mockData';
import styles from '../styles/Reports.module.css';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleFilterChange = async (newFilter) => {
    setIsFiltering(true);
    setFilter(newFilter);
    // Simulate filter delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsFiltering(false);
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });


  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Inspection Reports</h1>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
            disabled={isFiltering}
          >
            All Reports
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            onClick={() => handleFilterChange('completed')}
            disabled={isFiltering}
          >
            Completed
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'in-progress' ? styles.active : ''}`}
            onClick={() => handleFilterChange('in-progress')}
            disabled={isFiltering}
          >
            In Progress
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Reports</span>
          <span className={styles.statValue}>{reports.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue}>
            {reports.filter(r => r.status === 'completed').length}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>In Progress</span>
          <span className={styles.statValue}>
            {reports.filter(r => r.status === 'in-progress').length}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        {isFiltering ? (
          <LoadingSpinner />
        ) : (
          filteredReports.length > 0 ? (
            <AnimatedList
              items={filteredReports}
              renderItem={(report) => <ReportCard report={report} />}
            />
          ) : (
            <div className={styles.noReports}>
              No reports found matching the selected filter.
            </div>
          )
        )}
      </div>
    </div>
  );
}
