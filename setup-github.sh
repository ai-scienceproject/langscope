#!/bin/bash

# GitHub Setup Script for Langscope
# This script helps initialize and push the repository to GitHub

set -e

echo "🚀 Langscope GitHub Setup Script"
echo "=================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if remote exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter GitHub repository URL: " repo_url
        git remote set-url origin "$repo_url"
        echo "✅ Remote updated"
    fi
else
    read -p "Enter GitHub repository URL (e.g., https://github.com/scienceproject-ai/langscope.git): " repo_url
    git remote add origin "$repo_url"
    echo "✅ Remote added"
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Staging all changes..."
    git add .
    
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Initial commit: Langscope LLM Evaluation Platform"
    fi
    
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
fi

# Set main branch
git branch -M main

# Ask about pushing
read -p "Do you want to push to GitHub now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Go to your repository on GitHub"
    echo "2. Navigate to Settings → Secrets and variables → Actions"
    echo "3. Add required secrets (DATABASE_URL, NEXT_PUBLIC_API_URL, etc.)"
    echo "4. Check the Actions tab to see your CI/CD pipeline"
    echo ""
    echo "See GITHUB_SETUP.md for detailed instructions."
else
    echo "⏭️  Skipping push. You can push later with: git push -u origin main"
fi

