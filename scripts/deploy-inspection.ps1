# Inspection Report Deployment Script

Write-Host "Starting Inspection Report deployment..." -ForegroundColor Green

# 1. Validate Environment
Write-Host "`nValidating environment..." -ForegroundColor Cyan
npm run production:validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Environment validation failed!" -ForegroundColor Red
    exit 1
}

# 2. Run Tests
Write-Host "`nRunning test suite..." -ForegroundColor Cyan
npm run test:ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed!" -ForegroundColor Red
    exit 1
}

# 3. Run Performance Tests
Write-Host "`nRunning performance tests..." -ForegroundColor Cyan
npm run performance:test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Performance tests failed!" -ForegroundColor Red
    exit 1
}

# 4. Build Application
Write-Host "`nBuilding application..." -ForegroundColor Cyan
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# 5. Verify PWA Configuration
Write-Host "`nVerifying PWA configuration..." -ForegroundColor Cyan
if (-not (Test-Path "public/manifest.json")) {
    Write-Host "PWA manifest not found!" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "public/sw.js")) {
    Write-Host "Service Worker not found!" -ForegroundColor Red
    exit 1
}

# 6. Configure Cloudflare
Write-Host "`nConfiguring Cloudflare..." -ForegroundColor Cyan
npm run cloudflare:setup
if ($LASTEXITCODE -ne 0) {
    Write-Host "Cloudflare configuration failed!" -ForegroundColor Red
    exit 1
}

# 7. Deploy to Cloudflare Pages
Write-Host "`nDeploying to Cloudflare Pages..." -ForegroundColor Cyan
npx wrangler pages deploy .next --project-name inspection-report
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

# 8. Verify Deployment
Write-Host "`nVerifying deployment..." -ForegroundColor Cyan
npm run verify:deployment
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment verification failed!" -ForegroundColor Red
    exit 1
}

# 9. Setup Monitoring
Write-Host "`nSetting up monitoring..." -ForegroundColor Cyan

# Configure error tracking
Write-Host "Configuring error tracking..." -ForegroundColor Gray
if ($env:SENTRY_DSN) {
    Write-Host "Sentry DSN configured" -ForegroundColor Gray
} else {
    Write-Host "Warning: Sentry DSN not configured" -ForegroundColor Yellow
}

# Configure performance monitoring
Write-Host "Setting up performance monitoring..." -ForegroundColor Gray
npm run metrics:setup
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Metrics setup had issues" -ForegroundColor Yellow
}

# 10. Post-Deployment Checks
Write-Host "`nRunning post-deployment checks..." -ForegroundColor Cyan
npm run post:deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Post-deployment checks failed!" -ForegroundColor Red
    Write-Host "Manual verification required!" -ForegroundColor Yellow
    exit 1
}

# 11. Backup Verification
Write-Host "`nVerifying backup system..." -ForegroundColor Cyan
if ($env:ENABLE_AUTO_BACKUP -eq "true") {
    Write-Host "Testing backup system..." -ForegroundColor Gray
    npm run backup:test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Backup system needs attention" -ForegroundColor Yellow
    }
}

# Deployment Complete
Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
Write-Host "Application URL: $env:NEXT_PUBLIC_APP_URL" -ForegroundColor Cyan

# Final Instructions
Write-Host "`nPost-Deployment Tasks:" -ForegroundColor Yellow
Write-Host "1. Verify application at: $env:NEXT_PUBLIC_APP_URL"
Write-Host "2. Check monitoring dashboard"
Write-Host "3. Verify PWA installation"
Write-Host "4. Test offline functionality"
Write-Host "5. Review error tracking"
Write-Host "6. Monitor performance metrics"

# Display Support Information
Write-Host "`nSupport Information:" -ForegroundColor Magenta
Write-Host "- Technical Support: [Contact]"
Write-Host "- Emergency Contact: [Contact]"
Write-Host "- Documentation: ./docs/TROUBLESHOOTING.md"
