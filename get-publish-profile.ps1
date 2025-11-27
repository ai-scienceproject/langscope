# PowerShell script to get Azure App Service publish profile
# Run this script to get your publish profile for GitHub Actions

# Replace these with your actual values:
$appName = "langscope-h3eph9deh7e8b6d5"
$resourceGroup = "langscope-rg"

Write-Host "Getting publish profile for $appName..." -ForegroundColor Green

# Get publish profile
$profile = az webapp deployment list-publishing-profiles `
    --name $appName `
    --resource-group $resourceGroup `
    --xml

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Publish profile retrieved successfully!" -ForegroundColor Green
    Write-Host "`nCopy the XML content below and paste it into GitHub Secret 'AZURE_WEBAPP_PUBLISH_PROFILE':" -ForegroundColor Yellow
    Write-Host "`n" -NoNewline
    Write-Host $profile -ForegroundColor Cyan
    Write-Host "`n" -NoNewline
    
    # Save to file
    $profile | Out-File -FilePath "publish-profile.xml" -Encoding UTF8
    Write-Host "✅ Also saved to 'publish-profile.xml' file in current directory" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error getting publish profile. Make sure:" -ForegroundColor Red
    Write-Host "  1. Azure CLI is installed (az --version)" -ForegroundColor Yellow
    Write-Host "  2. You're logged in (az login)" -ForegroundColor Yellow
    Write-Host "  3. App name and resource group are correct" -ForegroundColor Yellow
}

