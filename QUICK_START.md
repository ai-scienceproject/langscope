# Quick Start Guide

## ✅ MongoDB Setup Complete!

Your MongoDB is running in Docker. Here's what's been set up:

### 1. MongoDB Container
- **Status**: Running on `localhost:27017`
- **Database**: `langscope`
- **Connection URL**: `mongodb://localhost:27017/langscope`

### 2. Database Seeded
The database has been populated with:
- ✅ 5 organizations (OpenAI, Anthropic, Google, Meta, Mistral AI)
- ✅ 12 domains (Code Generation, Mathematical Reasoning, etc.)
- ✅ 12 models (GPT-4, Claude 3, Gemini, Llama, Mistral)
- ✅ 8 model rankings
- ✅ 4 test cases

### 3. Environment Variables
Create a `.env` file in the project root with:

```env
DATABASE_URL="mongodb://localhost:27017/langscope?retryWrites=true&w=majority"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

## Next Steps

### Start the Development Server
```bash
npm run dev
```

### Test the API
Visit: http://localhost:3000/api/domains

You should see all the seeded domains!

### View Data in MongoDB
```bash
# Connect to MongoDB shell
docker exec -it mongodb mongosh langscope

# List collections
show collections

# View domains
db.domains.find().pretty()

# View models
db.models.find().pretty()
```

## Useful Commands

### MongoDB Container
```bash
# Stop MongoDB
docker stop mongodb

# Start MongoDB
docker start mongodb

# Restart MongoDB
docker restart mongodb

# View logs
docker logs mongodb

# Remove container (if needed)
docker rm -f mongodb
```

### Database Operations
```bash
# Re-seed database (clears and re-populates)
npm run db:seed

# Connect to MongoDB shell
docker exec -it mongodb mongosh langscope
```

## Troubleshooting

### MongoDB not connecting?
1. Check if container is running: `docker ps`
2. Verify connection string in `.env`
3. Check MongoDB logs: `docker logs mongodb`

### Seed script fails?
1. Make sure MongoDB container is running
2. Check `.env` file has `DATABASE_URL` set
3. Try: `docker restart mongodb`

### Port already in use?
If port 27017 is already in use, you can:
1. Stop the existing MongoDB service
2. Or use a different port: `docker run -d --name mongodb -p 27018:27017 mongo:latest`
   Then update `.env`: `DATABASE_URL="mongodb://localhost:27018/langscope"`

