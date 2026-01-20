# Railway Frontend Deployment Script
# Run this from the frontend directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Railway Frontend Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Railway CLI not found!" -ForegroundColor Red
    Write-Host "Please install Railway CLI first:" -ForegroundColor Yellow
    Write-Host "  npm install -g @railway/cli" -ForegroundColor White
    exit 1
}
Write-Host "Railway CLI found: $railwayVersion" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Railway login status..." -ForegroundColor Yellow
railway whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Please login:" -ForegroundColor Yellow
    railway login
}
Write-Host "Logged in successfully" -ForegroundColor Green
Write-Host ""

# Link to Railway project (if not already linked)
Write-Host "Linking to Railway project..." -ForegroundColor Yellow
railway link
Write-Host ""

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
Write-Host "  - VITE_API_URL" -ForegroundColor Gray
railway variables set VITE_API_URL=https://backend-tradexion.up.railway.app/api

Write-Host ""
Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "  VITE_API_URL=https://backend-tradexion.up.railway.app/api" -ForegroundColor White
Write-Host ""

# Deploy
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying Frontend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Install dependencies (npm install)" -ForegroundColor White
Write-Host "  2. Build frontend (npm run build)" -ForegroundColor White
Write-Host "  3. Start preview server (npm start)" -ForegroundColor White
Write-Host ""
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Set custom domain: railway domain tradexion.up.railway.app" -ForegroundColor White
    Write-Host "  2. View logs: railway logs" -ForegroundColor White
    Write-Host "  3. Open service: railway open" -ForegroundColor White
    Write-Host ""
    Write-Host "Frontend URL: https://tradexion.up.railway.app" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check logs: railway logs" -ForegroundColor Yellow
    exit 1
}
