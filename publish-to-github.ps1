# Script to publish Langscope to GitHub
# Repository: https://github.com/ai-scienceproject/langscope

Write-Host "=== Publishing Langscope to GitHub ===" -ForegroundColor Green
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Initialize git if needed
if (!(Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "Git repository already initialized" -ForegroundColor Green
}

# Set remote origin
Write-Host ""
Write-Host "Setting remote origin to https://github.com/ai-scienceproject/langscope.git" -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/ai-scienceproject/langscope.git
git remote -v

# Check current branch
$currentBranch = git branch --show-current 2>$null
if (!$currentBranch) {
    Write-Host ""
    Write-Host "Creating initial commit..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit: Langscope LLM Evaluation Platform"
    git branch -M main
    Write-Host "Initial commit created" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Current branch: $currentBranch" -ForegroundColor Green
    Write-Host "Staging all changes..." -ForegroundColor Yellow
    git add .
    
    $status = git status --porcelain
    if ($status) {
        Write-Host "Changes detected. Creating commit..." -ForegroundColor Yellow
        git commit -m "Update: Langscope LLM Evaluation Platform"
    } else {
        Write-Host "No changes to commit" -ForegroundColor Green
    }
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Repository: https://github.com/ai-scienceproject/langscope.git" -ForegroundColor Cyan
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "=== SUCCESS! ===" -ForegroundColor Green
    Write-Host "Your code has been published to:" -ForegroundColor Green
    Write-Host "https://github.com/ai-scienceproject/langscope" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "=== PUSH FAILED ===" -ForegroundColor Red
    Write-Host "You may need to authenticate with GitHub." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "1. Use GitHub CLI: gh auth login" -ForegroundColor Cyan
    Write-Host "2. Use Personal Access Token (PAT)" -ForegroundColor Cyan
    Write-Host "3. Use SSH instead of HTTPS" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To use SSH, run:" -ForegroundColor Yellow
    Write-Host "git remote set-url origin git@github.com:ai-scienceproject/langscope.git" -ForegroundColor Cyan
}

