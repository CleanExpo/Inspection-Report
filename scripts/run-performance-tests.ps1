# Build TypeScript files
Write-Host "Building TypeScript files..."
npx tsc

# Run performance tests
Write-Host "Running performance tests..."
node scripts/performance-test.js

# Check exit status
if ($LASTEXITCODE -eq 0) {
    Write-Host "Performance tests completed successfully"
} else {
    Write-Host "Performance tests failed"
    exit 1
}
