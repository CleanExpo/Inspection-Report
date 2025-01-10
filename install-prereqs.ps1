# Run as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {  
    Write-Warning "Please run as administrator!"
    Break
}

Write-Host "Installing prerequisites for Inspection Report System..." -ForegroundColor Green

# Function to install package if not present
function Install-IfNotPresent {
    param (
        [string]$Name,
        [string]$WinGetId
    )
    Write-Host "Checking for $Name..." -ForegroundColor Yellow
    
    try {
        $installed = winget list --id $WinGetId
        if ($installed -match $WinGetId) {
            Write-Host "$Name is already installed." -ForegroundColor Green
        } else {
            Write-Host "Installing $Name..." -ForegroundColor Yellow
            winget install --id $WinGetId --accept-source-agreements --accept-package-agreements
        }
    } catch {
        Write-Host "Error checking/installing $Name. Error: $_" -ForegroundColor Red
    }
}

# Install Node.js LTS
Install-IfNotPresent "Node.js LTS" "OpenJS.NodeJS.LTS"

# Install Git
Install-IfNotPresent "Git" "Git.Git"

# Install PostgreSQL
Install-IfNotPresent "PostgreSQL" "PostgreSQL.PostgreSQL"

# Verify installations
Write-Host "`nVerifying installations..." -ForegroundColor Yellow

$verificationCommands = @(
    @{Name="Node.js"; Command="node --version"},
    @{Name="npm"; Command="npm --version"},
    @{Name="Git"; Command="git --version"},
    @{Name="PostgreSQL"; Command="psql --version"}
)

foreach ($cmd in $verificationCommands) {
    Write-Host "Checking $($cmd.Name)..." -ForegroundColor Yellow
    try {
        $version = Invoke-Expression $cmd.Command
        Write-Host "$($cmd.Name) version: $version" -ForegroundColor Green
    } catch {
        Write-Host "$($cmd.Name) not found or not in PATH" -ForegroundColor Red
        Write-Host "You may need to restart your computer to update PATH variables" -ForegroundColor Yellow
    }
}

Write-Host "`nPrerequisite installation complete!" -ForegroundColor Green
Write-Host "Please restart your computer to ensure all PATH variables are updated." -ForegroundColor Yellow
Write-Host "After restart, you can run RAPID-DEPLOYMENT.bat to deploy the application." -ForegroundColor Yellow

pause
