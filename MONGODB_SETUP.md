# MongoDB Local Setup Guide

## Quick Start - Local MongoDB Connection URL

The default local MongoDB connection URL is:
```
mongodb://localhost:27017/langscope
```

Or with additional options:
```
mongodb://localhost:27017/langscope?retryWrites=true&w=majority
```

## Step-by-Step Setup

### Option 1: Install MongoDB Locally

#### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will install as a Windows service and start automatically
4. Default connection: `mongodb://localhost:27017`

#### macOS (using Homebrew)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: Use Docker (Easiest)

If you have Docker installed:

```bash
# Run MongoDB in a Docker container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:latest

# Connection URL:
# mongodb://localhost:27017/langscope
```

### Option 3: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/langscope?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your database user password

## Verify MongoDB is Running

### Check if MongoDB is running:

**Windows:**
- Open Services (Win + R → `services.msc`)
- Look for "MongoDB" service - it should be "Running"

**macOS/Linux:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Or check service status
brew services list  # macOS
sudo systemctl status mongod  # Linux
```

### Test Connection:

**Using MongoDB Shell (mongosh):**
```bash
# Install mongosh if needed
# Windows: Download from https://www.mongodb.com/try/download/shell
# macOS: brew install mongosh
# Linux: sudo apt-get install mongodb-mongosh

# Connect to MongoDB
mongosh mongodb://localhost:27017

# Or just
mongosh
```

**Using Node.js:**
```bash
# Create a test file: test-connection.js
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/langscope')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection failed:', err));
"
```

## Connection String Formats

### Local MongoDB (Default)
```
mongodb://localhost:27017/langscope
```

### With Authentication (if you set up a user)
```
mongodb://username:password@localhost:27017/langscope?authSource=admin
```

### With Options
```
mongodb://localhost:27017/langscope?retryWrites=true&w=majority
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/langscope?retryWrites=true&w=majority
```

## Add to Your .env File

Create or update `.env` in your project root:

```env
# Local MongoDB (default)
DATABASE_URL="mongodb://localhost:27017/langscope"

# Or with options
DATABASE_URL="mongodb://localhost:27017/langscope?retryWrites=true&w=majority"

# MongoDB Atlas (cloud)
# DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/langscope?retryWrites=true&w=majority"
```

## Common Issues

### MongoDB not starting
- **Windows**: Check if the service is running in Services
- **macOS**: `brew services restart mongodb-community`
- **Linux**: `sudo systemctl restart mongod`

### Connection refused
- Make sure MongoDB is running
- Check if port 27017 is not blocked by firewall
- Verify the connection string is correct

### Authentication failed
- If you set up authentication, include username and password in the URL
- Default local MongoDB usually doesn't require authentication

## Next Steps

1. Set `DATABASE_URL` in your `.env` file
2. Run the seed script to populate data:
   ```bash
   npm run db:seed
   ```
3. Start your development server:
   ```bash
   npm run dev
   ```

## Useful Commands

```bash
# View MongoDB logs
# Windows: Check Event Viewer or MongoDB logs folder
# macOS: tail -f /usr/local/var/log/mongodb/mongo.log
# Linux: sudo tail -f /var/log/mongodb/mongod.log

# Stop MongoDB
# Windows: Stop the service in Services
# macOS: brew services stop mongodb-community
# Linux: sudo systemctl stop mongod

# Restart MongoDB
# Windows: Restart the service in Services
# macOS: brew services restart mongodb-community
# Linux: sudo systemctl restart mongod
```

