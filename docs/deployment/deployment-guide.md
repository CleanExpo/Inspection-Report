# Deployment Guide

## Overview

This guide outlines the steps required to deploy the application to production, including environment setup, SSL configuration, load balancing, and database migration.

## Prerequisites

- Access to production servers
- Domain name and SSL certificates
- Docker and Docker Compose installed
- Access to cloud provider (AWS/GCP/Azure)
- Database backup from staging environment

## 1. Environment Setup

### 1.1 Server Requirements

```bash
# Minimum server specifications
CPU: 4 cores
RAM: 16GB
Storage: 100GB SSD
OS: Ubuntu 20.04 LTS
```

### 1.2 Environment Variables

Create a `.env.production` file:

```env
# API Configuration
NODE_ENV=production
API_PORT=3000
API_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@db:5432/moisture_db
DATABASE_POOL_SIZE=20

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRATION=24h

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=secure_password
SLACK_API_URL=https://hooks.slack.com/services/xxx/yyy/zzz
SMTP_FROM=alerts@yourdomain.com
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
ALERT_EMAIL_TO=team@yourdomain.com
```

### 1.3 Directory Structure

```bash
mkdir -p /opt/moisture-app/{app,data,logs,ssl}
mkdir -p /opt/moisture-app/data/{postgres,redis,prometheus,grafana}
```

## 2. SSL Configuration

### 2.1 Generate SSL Certificate

Using Let's Encrypt:

```bash
# Install certbot
apt-get update
apt-get install certbot

# Generate certificate
certbot certonly --standalone -d api.yourdomain.com
```

### 2.2 Configure Nginx

Create `/etc/nginx/sites-available/moisture-api.conf`:

```nginx
upstream api_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://api_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
    }
}

# HTTP redirect
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 3. Load Balancer Setup

### 3.1 HAProxy Configuration

Create `/etc/haproxy/haproxy.cfg`:

```haproxy
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000
    timeout client  50000
    timeout server  50000

frontend http-in
    bind *:80
    bind *:443 ssl crt /etc/ssl/private/api.yourdomain.com.pem
    http-request redirect scheme https unless { ssl_fc }
    
    # ACLs for different services
    acl is_api path_beg /api
    acl is_monitoring path_beg /monitoring

    # Use backends based on ACLs
    use_backend api_servers if is_api
    use_backend monitoring_servers if is_monitoring
    default_backend api_servers

backend api_servers
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server api1 127.0.0.1:3000 check
    server api2 127.0.0.1:3001 check

backend monitoring_servers
    balance roundrobin
    server monitoring1 127.0.0.1:3002 check
```

## 4. Database Migration

### 4.1 Backup Current Database

```bash
# On staging server
pg_dump -Fc moisture_db > moisture_db_backup.dump

# Transfer to production
scp moisture_db_backup.dump production:/tmp/
```

### 4.2 Restore Database

```bash
# On production server
createdb moisture_db
pg_restore -d moisture_db /tmp/moisture_db_backup.dump
```

### 4.3 Run Migrations

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy
```

## 5. Monitoring Setup

### 5.1 Start Monitoring Stack

```bash
cd /opt/moisture-app/monitoring
docker-compose up -d
```

### 5.2 Configure Firewall

```bash
# Allow necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from monitoring_subnet to any port 9090 # Prometheus
ufw allow from monitoring_subnet to any port 9093 # Alertmanager
ufw allow from monitoring_subnet to any port 3000 # Grafana
```

## 6. Application Deployment

### 6.1 Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/moisture-app.git
cd moisture-app

# Install dependencies
npm install --production

# Build application
npm run build

# Start application instances
pm2 start ecosystem.config.js
```

### 6.2 Verify Deployment

```bash
# Check application status
pm2 status

# Verify logs
pm2 logs

# Test endpoints
curl -k https://api.yourdomain.com/health
```

## 7. Post-Deployment Tasks

### 7.1 Setup Monitoring Alerts

1. Configure Slack notifications in Alertmanager
2. Verify email notifications
3. Test alert conditions

### 7.2 Setup Backup Schedule

```bash
# Add to crontab
0 1 * * * /opt/moisture-app/scripts/backup.sh
```

### 7.3 Performance Baseline

1. Record initial performance metrics
2. Setup performance monitoring alerts
3. Document baseline metrics

## 8. Rollback Plan

In case of deployment issues:

1. Stop new application instances
```bash
pm2 stop all
```

2. Restore database backup
```bash
pg_restore -d moisture_db /backup/moisture_db_backup.dump
```

3. Start previous version
```bash
cd /opt/moisture-app/previous
pm2 start ecosystem.config.js
```

## 9. Maintenance

### 9.1 Regular Tasks

- Monitor system metrics
- Review application logs
- Check backup integrity
- Update SSL certificates
- Rotate logs

### 9.2 Emergency Contacts

- DevOps Team: devops@yourdomain.com
- Database Admin: dba@yourdomain.com
- Security Team: security@yourdomain.com

## 10. Troubleshooting

### 10.1 Common Issues

1. Database Connection Issues
```bash
# Check database logs
tail -f /var/log/postgresql/postgresql-14-main.log

# Verify connection
psql -h localhost -U moisture_user -d moisture_db
```

2. Redis Connection Issues
```bash
# Check Redis status
redis-cli ping
redis-cli info
```

3. Application Errors
```bash
# Check application logs
pm2 logs

# Check system logs
journalctl -u moisture-app
```

### 10.2 Performance Issues

1. High CPU Usage
```bash
# Check top processes
top -c

# Check specific process
pidstat -p <pid> 1
```

2. Memory Issues
```bash
# Check memory usage
free -m
vmstat 1
```

3. Disk Issues
```bash
# Check disk usage
df -h
iostat -x 1
