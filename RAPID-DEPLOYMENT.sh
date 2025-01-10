#!/bin/bash
# Rapid deployment script for Inspection-Report system

echo "Starting rapid deployment of Inspection-Report..."

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 successful"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# 1. Environment Setup
echo "Setting up environment..."
cp .env.example .env
echo "NODE_ENV=production" >> .env
echo "DATABASE_URL=postgresql://localhost:5432/inspection_report" >> .env
check_status "Environment setup"

# 2. Install Dependencies
echo "Installing dependencies..."
npm install
check_status "Dependencies installation"

# 3. Database Setup
echo "Setting up database..."
createdb inspection_report
npm run migrate:latest
check_status "Database setup"

# 4. Build Application
echo "Building application..."
npm run build
check_status "Application build"

# 5. Start Services
echo "Starting services..."
npm run start:prod
check_status "Service startup"

echo "🚀 Rapid deployment complete! Application should be running at http://localhost:3000"
echo "
Next steps:
1. Verify application at http://localhost:3000
2. Check database connectivity
3. Test core features
4. Monitor error logs
"
