# GitHub Setup Script for Langscope (PowerShell)
# This script helps initialize and push the repository to GitHub

Write-Host "🚀 Langscope GitHub Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $null = git --version
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Check if remote exists
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "⚠️  Remote 'origin' already exists" -ForegroundColor Yellow
    $update = Read-Host "Do you want to update it? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        $repoUrl = Read-Host "Enter GitHub repository URL"
        git remote set-url origin $repoUrl
        Write-Host "✅ Remote updated" -ForegroundColor Green
    }
} else {
    $repoUrl = Read-Host "Enter GitHub repository URL (e.g., https://github.com/scienceproject-ai/langscope.git)"
    git remote add origin $repoUrl
    Write-Host "✅ Remote added" -ForegroundColor Green
}

# Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Staging all changes..." -ForegroundColor Yellow
    git add .
    
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Initial commit: Langscope LLM Evaluation Platform"
    }
    
    git commit -m $commitMsg
    Write-Host "✅ Changes committed" -ForegroundColor Green
}

# Set main branch
git branch -M main

# Ask about pushing
$push = Read-Host "Do you want to push to GitHub now? (y/n)"
if ($push -eq "y" -or $push -eq "Y") {
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Setup complete!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to your repository on GitHub"
    Write-Host "2. Navigate to Settings → Secrets and variables → Actions"
    Write-Host "3. Add required secrets (DATABASE_URL, NEXT_PUBLIC_API_URL, etc.)"
    Write-Host "4. Check the Actions tab to see your CI/CD pipeline"
    Write-Host ""
    Write-Host "See GITHUB_SETUP.md for detailed instructions." -ForegroundColor Cyan
} else {
    Write-Host "⏭️  Skipping push. You can push later with: git push -u origin main" -ForegroundColor Yellow
}

