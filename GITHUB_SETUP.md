# GitHub Setup Guide

This guide will help you set up the repository on GitHub and configure CI/CD.

## Prerequisites

- Git installed on your machine
- GitHub account with access to the `scienceproject-ai` organization
- Node.js 20+ installed

## Step 1: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Langscope LLM Evaluation Platform"
```

## Step 2: Create Repository on GitHub

1. Go to https://github.com/orgs/scienceproject-ai/repositories
2. Click "New repository"
3. Repository name: `langscope` (or your preferred name)
4. Description: "LLM Evaluation Platform with blockchain verification"
5. Set visibility (Public/Private)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

```bash
# Add remote origin (replace YOUR_REPO_NAME if different)
git remote add origin https://github.com/scienceproject-ai/langscope.git

# Or if using SSH:
# git remote add origin git@github.com:scienceproject-ai/langscope.git

# Verify remote
git remote -v
```

## Step 4: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

## Step 5: Configure GitHub Secrets

For the CI/CD pipeline to work, you need to set up secrets in GitHub:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

### Required Secrets

- `NEXT_PUBLIC_API_URL` - Your API URL
  - Example: `https://api.langscope.ai` or `http://localhost:3001` for development

- `NEXT_PUBLIC_WS_URL` - Your WebSocket URL
  - Example: `wss://api.langscope.ai` or `ws://localhost:3001` for development

### Optional Secrets (for deployment)

- `VERCEL_TOKEN` - If deploying to Vercel
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `AWS_ACCESS_KEY_ID` - If deploying to AWS
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

## Step 6: Set Up Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Select the required checks: `lint`, `type-check`, `build`

## Step 7: Verify CI/CD Pipeline

1. Make a small change to the code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push
   ```
3. Go to **Actions** tab in GitHub
4. You should see the CI pipeline running

## Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

## Workflow Overview

### CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push and pull request:
- **Lint**: Checks code quality with ESLint
- **Type Check**: Validates TypeScript types
- **Build**: Builds the Next.js application

### Deploy Pipeline (`.github/workflows/deploy.yml`)

Runs on:
- Manual trigger (workflow_dispatch)
- Pushes to `main` branch
- Version tags (v*)

## Troubleshooting

### CI Fails with Build Errors
- Ensure all required environment variables are set in GitHub Secrets
- Check that `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` are configured
- For CI builds, you can use a dummy connection string if database isn't needed for build

### Build fails
- Check Node.js version (should be 20+)
- Ensure all dependencies are in `package.json`
- Check build logs in GitHub Actions

### Permission denied
- Ensure you have write access to the `scienceproject-ai` organization
- Check your GitHub authentication

## Next Steps

1. Configure your deployment target in `.github/workflows/deploy.yml`
2. Set up environment-specific configurations
3. Add automated testing (if you have tests)
4. Configure code coverage reporting
5. Set up automated dependency updates (Dependabot)

