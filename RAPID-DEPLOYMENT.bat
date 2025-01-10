@echo off
echo Starting rapid deployment of Inspection-Report...

:: Function to check status
:check_status
if %errorlevel% equ 0 (
    echo ✅ %~1 successful
) else (
    echo ❌ %~1 failed
    exit /b 1
)

:: 1. Environment Setup
echo Setting up environment...
copy .env.example .env
echo NODE_ENV=production>> .env
echo DATABASE_URL=postgresql://localhost:5432/inspection_report>> .env
call :check_status "Environment setup"

:: 2. Install Dependencies
echo Installing dependencies...
call npm install
call :check_status "Dependencies installation"

:: 3. Database Setup
echo Setting up database...
:: Using psql to create database
"C:\Program Files\PostgreSQL\14\bin\createdb.exe" inspection_report
call npm run migrate:latest
call :check_status "Database setup"

:: 4. Build Application
echo Building application...
call npm run build
call :check_status "Application build"

:: 5. Start Services
echo Starting services...
start /B npm run start:prod
call :check_status "Service startup"

echo 🚀 Rapid deployment complete! Application should be running at http://localhost:3000
echo.
echo Next steps:
echo 1. Verify application at http://localhost:3000
echo 2. Check database connectivity
echo 3. Test core features
echo 4. Monitor error logs

pause
