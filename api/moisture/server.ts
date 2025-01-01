import { startScheduledTasks } from './utils/scheduledTasks';
import { logger } from './utils/logger';

/** Tracks server initialization state */
let isInitialized = false;

/**
 * Initializes the moisture analytics server
 * - Starts scheduled maintenance tasks
 * - Sets up log rotation
 * @throws Error if initialization fails
 */
export function initializeServer(): void {
  try {
    if (isInitialized) {
      logger.warn('Server initialization called when already initialized');
      return;
    }

    // Start scheduled tasks
    startScheduledTasks();
    
    logger.info('Moisture analytics server initialized', {
      features: ['Log Rotation', 'Audit Trails'],
      timestamp: new Date().toISOString()
    });

    isInitialized = true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to initialize moisture analytics server', { 
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Initialize server when this module is imported
initializeServer();
