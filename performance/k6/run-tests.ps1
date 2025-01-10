# Set working directory to script location
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Ensure k6 is available
$k6Path = "C:\Program Files\k6\k6.exe"
if (-not (Test-Path $k6Path)) {
    Write-Error "k6 not found at expected location. Please ensure k6 is installed correctly."
    exit 1
}

# Create results directory if it doesn't exist
$resultsDir = Join-Path $scriptPath "results"
if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
}

# Build TypeScript files
Write-Host "Building TypeScript files..."
npm run load-test:build

# Run individual scenarios
Write-Host "`nRunning Jobs scenario..."
$jobsScript = Join-Path $scriptPath "dist\scenarios\jobs.test.js"
$jobsResult = Join-Path $resultsDir "jobs-result.json"
& $k6Path "run" "$jobsScript" "--out" "json=$jobsResult"

Write-Host "`nRunning Moisture scenario..."
$moistureScript = Join-Path $scriptPath "dist\scenarios\moisture.test.js"
$moistureResult = Join-Path $resultsDir "moisture-result.json"
& $k6Path "run" "$moistureScript" "--out" "json=$moistureResult"

# Generate combined report
Write-Host "`nGenerating combined report..."
$reportScript = Join-Path $scriptPath "dist\run-tests.js"
node "$reportScript"

Write-Host "`nLoad tests completed. Check the results directory for detailed reports."
