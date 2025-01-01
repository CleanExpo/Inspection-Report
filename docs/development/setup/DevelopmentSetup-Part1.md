# Development Setup Guide - Part 1: Initial Setup & Prerequisites

## System Requirements

### 1. Hardware Requirements

```plaintext
Minimum Specifications:
- CPU: Dual-core processor (2.0 GHz or higher)
- RAM: 8GB minimum, 16GB recommended
- Storage: 256GB SSD recommended
- Display: 1920x1080 resolution minimum

Recommended Specifications:
- CPU: Quad-core processor (3.0 GHz or higher)
- RAM: 16GB or higher
- Storage: 512GB SSD or higher
- Display: 2560x1440 or higher
```

### 2. Operating System Support

```plaintext
Supported Operating Systems:
- Windows 10/11 (64-bit)
- macOS 11.0 (Big Sur) or later
- Ubuntu 20.04 LTS or later
- Other Linux distributions with equivalent specifications
```

## Required Software

### 1. Core Development Tools

```bash
# Required Versions
Node.js: 18.x or later
npm: 8.x or later
Git: 2.x or later
Visual Studio Code: Latest stable version
```

### 2. Database Systems

```bash
# Primary Database
PostgreSQL: 14.x or later

# Caching System
Redis: 6.x or later
```

### 3. Container Platform

```bash
# Container Runtime
Docker: 20.x or later
Docker Compose: 2.x or later
```

## Development Environment Setup

### 1. Node.js Installation

```bash
# Windows (using chocolatey)
choco install nodejs

# macOS (using homebrew)
brew install node

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Database Installation

```bash
# PostgreSQL Installation
## Windows (using chocolatey)
choco install postgresql

## macOS (using homebrew)
brew install postgresql

## Ubuntu
sudo apt-get install postgresql postgresql-contrib

# Redis Installation
## Windows (using chocolatey)
choco install redis-64

## macOS (using homebrew)
brew install redis

## Ubuntu
sudo apt-get install redis-server
```

### 3. Docker Setup

```bash
# Windows
## Install Docker Desktop for Windows

# macOS
## Install Docker Desktop for Mac

# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## IDE Configuration

### 1. VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-azuretools.vscode-docker",
    "prisma.prisma",
    "graphql.vscode-graphql",
    "mikestead.dotenv",
    "christian-kohler.path-intellisense"
  ]
}
```

### 2. VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

## Environment Variables

### 1. Development Environment

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
API_URL=http://localhost:8000
```

### 2. Testing Environment

```bash
# .env.test
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/dbname_test
REDIS_URL=redis://localhost:6379
API_URL=http://localhost:8001
```

## System Configuration

### 1. Git Configuration

```bash
# Git global setup
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf input
git config --global init.defaultBranch main
```

### 2. npm Configuration

```bash
# npm global setup
npm config set save-exact=true
npm config set package-lock=true
npm config set audit=true
```

## Verification Steps

1. **Node.js Installation**
```bash
node --version
npm --version
```

2. **Database Installation**
```bash
# PostgreSQL
psql --version
# Redis
redis-cli --version
```

3. **Docker Installation**
```bash
docker --version
docker-compose --version
```

## Troubleshooting Guide

### 1. Common Installation Issues

- Node.js version conflicts
- PostgreSQL connection issues
- Redis service not starting
- Docker permission problems

### 2. Resolution Steps

1. **Node.js Issues**
   - Clear npm cache
   - Reinstall Node.js
   - Use nvm for version management

2. **Database Issues**
   - Check service status
   - Verify port availability
   - Check access permissions

3. **Docker Issues**
   - Verify Docker service
   - Check user permissions
   - Reset Docker desktop

## Next Steps

1. Proceed to Project Setup & Configuration
2. Configure development environment
3. Install project dependencies
4. Set up local development workflow
