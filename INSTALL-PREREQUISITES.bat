@echo off
echo Checking and installing prerequisites...

:: Check for Node.js
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Node.js...
    echo Please download and install Node.js from https://nodejs.org/
    echo After installation, please restart this script
    start https://nodejs.org/
    pause
    exit
) else (
    echo ✅ Node.js is installed
)

:: Check for npm
npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    echo Please install npm (should come with Node.js)
    pause
    exit
) else (
    echo ✅ npm is installed
)

:: Check for PostgreSQL
pg_config --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PostgreSQL...
    echo Please download and install PostgreSQL from https://www.postgresql.org/download/windows/
    echo After installation, please restart this script
    start https://www.postgresql.org/download/windows/
    pause
    exit
) else (
    echo ✅ PostgreSQL is installed
)

:: Check for Git
git --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Git...
    echo Please download and install Git from https://git-scm.com/download/win
    echo After installation, please restart this script
    start https://git-scm.com/download/win
    pause
    exit
) else (
    echo ✅ Git is installed
)

echo.
echo All prerequisites are installed!
echo You can now run RAPID-DEPLOYMENT.bat to deploy the application.
echo.
pause
