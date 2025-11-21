# Database Setup Guide

## Prerequisites
- PostgreSQL 14+ installed
- Node.js 18+ installed
- Access to database

## Option 1: Using Raw SQL

### 1. Create Database
```bash
psql -U postgres
CREATE DATABASE langscope;
\c langscope
```

### 2. Run Schema
```bash
psql -U postgres -d langscope -f database/schema.sql
```

### 3. Seed Data (Optional)
```bash
psql -U postgres -d langscope -f database/seed.sql
```

## Option 2: Using Prisma (Recommended)

### 1. Install Prisma
```bash
npm install -D prisma
npm install @prisma/client
```

### 2. Initialize Database
```bash
# Generate Prisma Client
npx prisma generate

# Create database and run migrations
npx prisma db push

# Or create migration
npx prisma migrate dev --name init
```

### 3. Seed Database
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add seed data
  await prisma.domain.createMany({
    data: [
      {
        name: 'Code Generation',
        slug: 'code-generation',
        description: 'Generate, complete, and debug code',
        icon: '💻',
        featured: true,
        confidenceScore: 92.5,
      },
      // ... more domains
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

### 4. Studio (Database GUI)
```bash
npx prisma studio
```

## Connection String Format

Add to `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/langscope?schema=public"
```

## Backup Database

```bash
pg_dump -U postgres langscope > backup.sql
```

## Restore Database

```bash
psql -U postgres -d langscope < backup.sql
```

## Common Commands

### Check tables
```sql
\dt
```

### Describe table
```sql
\d table_name
```

### Count records
```sql
SELECT COUNT(*) FROM table_name;
```

## Troubleshooting

### Reset database
```bash
npx prisma migrate reset
```

### Force push schema (development only)
```bash
npx prisma db push --force-reset
```

### View migrations
```bash
npx prisma migrate status
```

