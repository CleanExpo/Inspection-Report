# Run as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {  
    Write-Warning "Please run as administrator!"
    Break
}

Write-Host "Starting Inspection Report System Deployment..." -ForegroundColor Green

# Function to handle errors
function Handle-DeploymentError {
    param (
        [string]$Step,
        [string]$ErrorMessage
    )
    Write-Host "Error during $Step : $ErrorMessage" -ForegroundColor Red
    Write-Host "Deployment failed. Please check the error and try again." -ForegroundColor Red
    pause
    exit 1
}

# 1. Environment Setup
Write-Host "`nSetting up environment..." -ForegroundColor Yellow
try {
    if (Test-Path .env) {
        Copy-Item .env .env.backup
        Write-Host "Backed up existing .env file" -ForegroundColor Green
    }
    Copy-Item .env.example .env
    Add-Content .env "`nNODE_ENV=production"
    Add-Content .env "`nDATABASE_URL=postgresql://localhost:5432/inspection_report"
    Write-Host "Environment setup complete" -ForegroundColor Green
} catch {
    Handle-DeploymentError "environment setup" $_.Exception.Message
}

# 2. Install Dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} catch {
    Handle-DeploymentError "dependency installation" $_.Exception.Message
}

# 3. Database Setup
Write-Host "`nSetting up database..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "postgres"
    & "C:\Program Files\PostgreSQL\14\bin\createdb.exe" -U postgres inspection_report
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Database already exists, continuing..." -ForegroundColor Yellow
    }
    npm run migrate:latest
    Write-Host "Database setup complete" -ForegroundColor Green
} catch {
    Handle-DeploymentError "database setup" $_.Exception.Message
}

# 4. Build Application
Write-Host "`nBuilding application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Application built successfully" -ForegroundColor Green
} catch {
    Handle-DeploymentError "application build" $_.Exception.Message
}

# 5. Start Services
Write-Host "`nStarting services..." -ForegroundColor Yellow
try {
    # Kill any existing node processes
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    
    # Start the application
    Start-Process npm -ArgumentList "run start:prod" -NoNewWindow
    Write-Host "Services started successfully" -ForegroundColor Green
} catch {
    Handle-DeploymentError "service startup" $_.Exception.Message
}

# 6. Verify Deployment
Write-Host "`nVerifying deployment..." -ForegroundColor Yellow
try {
    Start-Sleep -Seconds 5  # Wait for service to start
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Application is running successfully!" -ForegroundColor Green
    } else {
        throw "Health check failed with status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "Warning: Could not verify deployment. Please check http://localhost:3000 manually." -ForegroundColor Yellow
}

Write-Host "`n🚀 Deployment complete!" -ForegroundColor Green
Write-Host "
Next steps:
1. Visit http://localhost:3000 to verify the application
2. Check the application logs for any issues
3. Test core functionality
4. Monitor system performance
" -ForegroundColor Yellow

# Keep the window open
pause
