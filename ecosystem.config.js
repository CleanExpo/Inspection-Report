module.exports = {
  apps: [
    {
      name: 'moisture-api-1',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        API_PORT: 3000,
        API_HOST: '0.0.0.0'
      },
      env: {
        NODE_ENV: 'development',
        API_PORT: 3000,
        API_HOST: 'localhost'
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      log_type: 'json',
      // Metrics for monitoring
      metrics: {
        http: true,
        runtime: true,
        custom_metrics: [
          {
            name: 'api_requests',
            type: 'counter',
            unit: 'requests'
          },
          {
            name: 'api_response_time',
            type: 'histogram',
            unit: 'ms',
            measurement: 'mean'
          }
        ]
      },
      // Health check endpoint
      health_check: {
        url: 'http://localhost:3000/health'
      },
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Error handling
      max_restarts: 10,
      min_uptime: '1m',
      // Resource limits
      node_args: '--max-old-space-size=4096',
      // Source maps for error tracking
      source_map_support: true,
      // Trace warnings
      trace_warnings: true,
      // Instance management
      increment_var: 'API_PORT',
      instance_var: 'INSTANCE_ID',
      // Deployment configuration
      deploy: {
        production: {
          user: 'node',
          host: ['prod-1', 'prod-2'],
          ref: 'origin/main',
          repo: 'git@github.com:your-org/moisture-app.git',
          path: '/opt/moisture-app',
          'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
          env: {
            NODE_ENV: 'production'
          }
        },
        staging: {
          user: 'node',
          host: 'staging',
          ref: 'origin/develop',
          repo: 'git@github.com:your-org/moisture-app.git',
          path: '/opt/moisture-app',
          'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
          env: {
            NODE_ENV: 'staging'
          }
        }
      },
      // Module configuration
      module_conf: {
        // Profiling
        profiling: true,
        // Tracing
        tracing: {
          enabled: true,
          serviceName: 'moisture-api'
        }
      }
    },
    // Monitoring process
    {
      name: 'moisture-monitor',
      script: 'dist/monitor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: 'logs/monitor-error.log',
      out_file: 'logs/monitor-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Health check for monitoring process
      health_check: {
        url: 'http://localhost:3002/health'
      }
    },
    // Worker process for background tasks
    {
      name: 'moisture-worker',
      script: 'dist/worker.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: 'logs/worker-error.log',
      out_file: 'logs/worker-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],
  // Deploy configuration
  deploy: {
    production: {
      key: '/path/to/key.pem',
      ssh_options: 'StrictHostKeyChecking=no',
      'pre-setup': 'apt-get install git',
      'post-setup': 'ls -la',
      'pre-deploy-local': "echo 'Deploying...'",
      'post-deploy-local': "echo 'Deployed successfully'"
    }
  }
};
