# Database Setup Guide

## Prerequisites
- MongoDB 6.0+ installed (or use MongoDB Atlas)
- Node.js 20+ installed
- Access to database

## Option 1: Local MongoDB

### 1. Install MongoDB
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

### 2. Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services
```

### 3. Create Database
MongoDB creates databases automatically when you first write to them. No need to create manually.

## Option 2: MongoDB Atlas (Cloud)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Add it to `.env` as `DATABASE_URL`

## Database Setup

This application uses MongoDB with Mongoose ODM for database operations.

### 1. Install Dependencies

Dependencies are already installed:
- `mongoose` - MongoDB ODM
- `@types/mongoose` - TypeScript types

### 2. Configure Connection

Add to `.env`:
```env
DATABASE_URL="mongodb://localhost:27017/langscope?retryWrites=true&w=majority"
```

For MongoDB Atlas:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/langscope?retryWrites=true&w=majority"
```

### 3. Database Connection

The connection is handled automatically in `src/lib/db/connect.ts`. It uses connection pooling and caching for optimal performance in Next.js.

### 4. Using Models

Import models from `src/lib/db/models`:
```typescript
import { Domain } from '@/lib/db/models';
import connectDB from '@/lib/db/connect';

// In API routes or server components
await connectDB();
const domains = await Domain.find({ isActive: true });
```

### 5. Using Services

Use the service layer for common operations:
```typescript
import { getDomains } from '@/lib/db/services/domainService';

const domains = await getDomains();
```

## Connection String Format

Add to `.env`:
```env
# Local MongoDB
DATABASE_URL="mongodb://localhost:27017/langscope?retryWrites=true&w=majority"

# MongoDB Atlas
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/langscope?retryWrites=true&w=majority"
```

## Backup Database

```bash
# Using mongodump
mongodump --uri="mongodb://localhost:27017/langscope" --out=./backup

# MongoDB Atlas
# Use the Atlas UI to create backups
```

## Restore Database

```bash
# Using mongorestore
mongorestore --uri="mongodb://localhost:27017/langscope" ./backup/langscope
```

## Common Commands

### Check collections
```javascript
// In MongoDB shell
use langscope
show collections
```

### Count documents
```javascript
db.domains.countDocuments()
```

### Query documents
```javascript
db.domains.find({ isActive: true })
```

## Indexes

Prisma automatically creates indexes based on `@@index` directives in the schema. For custom indexes:

```bash
# Create index via MongoDB shell
db.domains.createIndex({ slug: 1 }, { unique: true })
```

## Migration Notes

- MongoDB doesn't use traditional migrations like SQL databases
- Use `prisma db push` to sync schema changes
- For production, use `prisma migrate` (creates migration history)
- Always backup before schema changes
