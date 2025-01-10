# Voice Service Deployment Guide

## Overview
This guide outlines the deployment process for the voice processing system across development, staging, and production environments.

## Prerequisites

### System Requirements
```yaml
hardware:
  cpu: 8+ cores
  ram: 32GB minimum
  storage: 100GB SSD
  network: 10Gbps

software:
  os: Ubuntu 22.04 LTS
  docker: 24.0+
  node: 18.x LTS
  python: 3.11+
```

### Required Services
```yaml
services:
  - Redis (for caching)
  - PostgreSQL (for data storage)
  - RabbitMQ (for message queuing)
  - Elasticsearch (for logging)
```

### SSL Certificates
```yaml
certificates:
  domains:
    - voice-api.moisture-inspector.com
    - voice-ws.moisture-inspector.com
  provider: Let's Encrypt
  renewal: Auto
```

## Deployment Steps

### 1. Environment Setup

#### 1.1 Create Configuration Files
```bash
# Create environment-specific config
mkdir -p /opt/voice-service/config
cp voice-service-config.yml /opt/voice-service/config/

# Set environment variables
cat > /opt/voice-service/.env << EOF
NODE_ENV=production
VOICE_SERVICE_PORT=3000
REDIS_URL=redis://redis:6379
POSTGRES_URL=postgresql://user:pass@db:5432/voice
RABBITMQ_URL=amqp://rabbitmq:5672
EOF
```

#### 1.2 Initialize Data Directories
```bash
# Create required directories
mkdir -p /opt/voice-service/{logs,data,models}
mkdir -p /opt/voice-service/data/{audio-cache,voice-prints}

# Set permissions
chown -R voice-service:voice-service /opt/voice-service
chmod 750 /opt/voice-service/data/voice-prints
```

### 2. Model Deployment

#### 2.1 Download Language Models
```bash
# Download and verify models
cd /opt/voice-service/models
wget https://models.moisture-inspector.com/acoustic-model-v2.0.tar.gz
wget https://models.moisture-inspector.com/language-model-v1.5.tar.gz

# Extract models
tar xzf acoustic-model-v2.0.tar.gz
tar xzf language-model-v1.5.tar.gz

# Verify checksums
sha256sum -c checksums.txt
```

#### 2.2 Configure Model Paths
```yaml
model_paths:
  acoustic: /opt/voice-service/models/acoustic
  language: /opt/voice-service/models/language
  noise: /opt/voice-service/models/noise
```

### 3. Service Deployment

#### 3.1 Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  voice-service:
    image: moisture-inspector/voice-service:${VERSION}
    ports:
      - "3000:3000"
    volumes:
      - /opt/voice-service/config:/config
      - /opt/voice-service/models:/models
      - /opt/voice-service/data:/data
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - postgres
      - rabbitmq

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  rabbitmq:
    image: rabbitmq:3.11-management
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  redis_data:
  postgres_data:
  rabbitmq_data:
```

#### 3.2 Deploy Services
```bash
# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Verify deployment
docker-compose ps
```

### 4. Security Configuration

#### 4.1 Firewall Rules
```bash
# Allow necessary ports
ufw allow 3000/tcp  # Voice API
ufw allow 5432/tcp  # PostgreSQL
ufw allow 6379/tcp  # Redis
ufw allow 5672/tcp  # RabbitMQ
```

#### 4.2 SSL Configuration
```nginx
# /etc/nginx/sites-available/voice-service
server {
    listen 443 ssl http2;
    server_name voice-api.moisture-inspector.com;

    ssl_certificate /etc/letsencrypt/live/voice-api.moisture-inspector.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/voice-api.moisture-inspector.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Monitoring Setup

#### 5.1 Prometheus Configuration
```yaml
# /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'voice-service'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

#### 5.2 Grafana Dashboard
```bash
# Import voice service dashboard
curl -X POST \
  -H "Content-Type: application/json" \
  -d @voice-dashboard.json \
  http://localhost:3000/api/dashboards/db
```

### 6. Backup Configuration

#### 6.1 Database Backup
```bash
#!/bin/bash
# /opt/voice-service/scripts/backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR=/opt/voice-service/backups

# Backup PostgreSQL
pg_dump -U voice_user voice_db > $BACKUP_DIR/voice_db_$DATE.sql

# Backup Redis
redis-cli save
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup voice prints
tar czf $BACKUP_DIR/voice_prints_$DATE.tar.gz /opt/voice-service/data/voice-prints

# Rotate backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

### 7. Scaling Configuration

#### 7.1 Horizontal Scaling
```yaml
# docker-compose.scale.yml
services:
  voice-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

#### 7.2 Load Balancer Configuration
```nginx
# /etc/nginx/conf.d/upstream.conf
upstream voice_backend {
    least_conn;
    server voice1:3000;
    server voice2:3000;
    server voice3:3000;
    keepalive 32;
}
```

### 8. Post-Deployment Verification

#### 8.1 Health Check
```bash
# Check service health
curl -X GET http://localhost:3000/health

# Verify metrics endpoint
curl -X GET http://localhost:3000/metrics

# Test voice processing
curl -X POST \
  -H "Content-Type: audio/wav" \
  --data-binary @test.wav \
  http://localhost:3000/api/v1/voice/process
```

#### 8.2 Performance Test
```bash
# Run performance test suite
cd /opt/voice-service/tests
./performance-test.sh --duration=1h --users=100
```

### 9. Rollback Procedure

#### 9.1 Service Rollback
```bash
# Stop current version
docker-compose down

# Revert to previous version
export VERSION=previous_version
docker-compose up -d

# Verify rollback
docker-compose ps
curl -X GET http://localhost:3000/health
```

#### 9.2 Database Rollback
```bash
# Restore PostgreSQL
psql -U voice_user voice_db < $BACKUP_DIR/voice_db_$DATE.sql

# Restore Redis
systemctl stop redis
cp $BACKUP_DIR/redis_$DATE.rdb /var/lib/redis/dump.rdb
systemctl start redis
```

### 10. Maintenance Procedures

#### 10.1 Log Rotation
```yaml
# /etc/logrotate.d/voice-service
/opt/voice-service/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 voice-service voice-service
    sharedscripts
    postrotate
        systemctl reload voice-service
    endscript
}
```

#### 10.2 Model Updates
```bash
# Update language models
cd /opt/voice-service/models
./update-models.sh --version=latest

# Verify model integrity
./verify-models.sh

# Restart service to load new models
docker-compose restart voice-service
```

### 11. Troubleshooting

#### 11.1 Common Issues
```yaml
issues:
  high_latency:
    check:
      - Monitor CPU usage
      - Check Redis connection
      - Verify model loading
    solution:
      - Scale horizontally
      - Optimize cache settings
      - Update resource limits

  recognition_errors:
    check:
      - Verify model versions
      - Check audio quality
      - Monitor error rates
    solution:
      - Update models
      - Adjust noise filtering
      - Retrain specific patterns
```

#### 11.2 Debug Mode
```bash
# Enable debug logging
sed -i 's/log_level: info/log_level: debug/' /opt/voice-service/config/voice-service-config.yml

# Restart with debug flags
docker-compose down
export DEBUG=voice:*
docker-compose up -d

# Monitor debug output
docker-compose logs -f voice-service
