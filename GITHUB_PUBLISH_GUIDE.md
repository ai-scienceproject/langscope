# Publishing to GitHub - Quick Guide

## Repository
**https://github.com/ai-scienceproject/langscope**

## Quick Method: Run the Script

1. **Run the PowerShell script:**
   ```powershell
   .\publish-to-github.ps1
   ```

2. **If authentication is needed:**
   - You'll be prompted to authenticate
   - Use GitHub Personal Access Token or SSH

## Manual Method: Step by Step

### Step 1: Initialize Git (if not already done)

```powershell
# Check if git is initialized
git status

# If not initialized, run:
git init
```

### Step 2: Add Remote Repository

```powershell
# Remove existing remote (if any)
git remote remove origin

# Add GitHub repository
git remote add origin https://github.com/ai-scienceproject/langscope.git

# Verify
git remote -v
```

### Step 3: Stage All Files

```powershell
# Add all files
git add .

# Check what will be committed
git status
```

### Step 4: Create Initial Commit

```powershell
# Create commit
git commit -m "Initial commit: Langscope LLM Evaluation Platform"

# Ensure you're on main branch
git branch -M main
```

### Step 5: Push to GitHub

```powershell
# Push to GitHub
git push -u origin main
```

## Authentication Options

### Option 1: GitHub Personal Access Token (PAT)

1. **Create a PAT:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token (classic)
   - Select scopes: `repo` (full control of private repositories)
   - Copy the token

2. **Use token when pushing:**
   - When prompted for password, paste the token
   - Username: your GitHub username

### Option 2: GitHub CLI

```powershell
# Install GitHub CLI (if not installed)
# Download from: https://cli.github.com/

# Login
gh auth login

# Then push normally
git push -u origin main
```

### Option 3: SSH (Recommended for frequent pushes)

1. **Generate SSH key (if you don't have one):**
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH key to GitHub:**
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys
   - Add new SSH key
   - Paste your public key

3. **Change remote to SSH:**
   ```powershell
   git remote set-url origin git@github.com:ai-scienceproject/langscope.git
   ```

4. **Push:**
   ```powershell
   git push -u origin main
   ```

## Verify Deployment

After pushing, verify your code is on GitHub:

1. Go to: https://github.com/ai-scienceproject/langscope
2. You should see all your files
3. Check the commit history

## Next Steps

After publishing to GitHub, you can:

1. **Set up GitHub Actions for CI/CD:**
   - The repository already has `.github/workflows/` folder
   - Configure deployment in `.github/workflows/deploy.yml`

2. **Enable GitHub Actions for Azure deployment:**
   - Go to Azure App Service → Deployment Center
   - Select GitHub as source
   - Connect your repository
   - Set up automatic deployment

3. **Protect main branch:**
   - Go to GitHub → Settings → Branches
   - Add branch protection rule for `main`

## Troubleshooting

### Error: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/ai-scienceproject/langscope.git
```

### Error: "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH authentication

### Error: "Permission denied"
- Ensure you have write access to `ai-scienceproject` organization
- Check your GitHub account permissions

### Error: "Repository not found"
- Verify the repository URL is correct
- Ensure the repository exists and you have access

## Files to Check Before Pushing

Make sure these are in `.gitignore`:
- `.env` files (sensitive data)
- `node_modules/`
- `.next/` (build files)
- `.env*.local`

The `.gitignore` file should already be configured correctly.

