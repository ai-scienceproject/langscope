# Seed Azure Cosmos DB Database

This guide will help you seed your Azure Cosmos DB (MongoDB API) database with initial data.

## Prerequisites

- Node.js installed locally
- Your Azure Cosmos DB connection string
- Access to your Azure Cosmos DB (firewall rules configured)

## Step 1: Get Your Azure Cosmos DB Connection String

1. Go to Azure Portal → Your Cosmos DB cluster (`langscope-db`)
2. Go to **Connection strings** or **Keys** section
3. Copy the connection string
4. It should look like:
   ```
   mongodb+srv://sahebscienceproject:<password>@langscope-db.global.mongocluster.cosmos.azure.com/langscope?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
   ```
5. Replace `<password>` with your actual password

## Step 2: Set Up Environment Variable

Create or update your `.env.local` file in the project root:

```env
DATABASE_URL="mongodb+srv://sahebscienceproject:YOUR_PASSWORD@langscope-db.global.mongocluster.cosmos.azure.com/langscope?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"
```

**Important:** Replace `YOUR_PASSWORD` with your actual Cosmos DB password.

## Step 3: Install Dependencies (If Not Already Installed)

```bash
npm install
```

## Step 4: Run the Seed Script

```bash
npm run db:seed
```

This will:
- Connect to your Azure Cosmos DB
- Clear existing data (optional - you can comment this out in `scripts/seed.ts` if you want to keep existing data)
- Create:
  - 5 organizations (OpenAI, Anthropic, Google, Meta, Mistral AI)
  - 12 domains (Code Generation, Creative Writing, Mathematics, etc.)
  - 12 models (GPT-4, Claude 3, Gemini, Llama, etc.)
  - Model rankings with initial ELO scores
  - Test cases
  - Sample evaluations and battles

## Step 5: Verify the Data

After seeding, you can verify the data was created:

### Option 1: Check via Your App

1. Make sure your app is running with the Azure database connection
2. Visit: `https://langscope-h3eph9deh7e8b6d5.eastasia-01.azurewebsites.net/api/domains`
3. You should see the seeded domains

### Option 2: Use Azure Portal

1. Go to Azure Portal → Cosmos DB → Data Explorer
2. Navigate to your database and collections
3. You should see documents in:
   - `organizations`
   - `domains`
   - `models`
   - `modelrankings`
   - `testcases`
   - `evaluations`
   - `battles`

### Option 3: Use MongoDB Compass (If Installed)

1. Connect using your Azure Cosmos DB connection string
2. Browse the collections
3. View the documents

## Troubleshooting

### Error: "Connection timeout"

**Cause:** Firewall rules blocking your IP address

**Fix:**
1. Go to Azure Portal → Cosmos DB → Networking
2. Add your current IP address to the firewall rules
3. Or enable "Allow access from Azure services"

### Error: "Authentication failed"

**Cause:** Incorrect password or username

**Fix:**
1. Verify your connection string has the correct password
2. Make sure you're using the admin username (not a database user)
3. Check if the password has special characters that need URL encoding

### Error: "Cannot connect to database"

**Cause:** Connection string format incorrect

**Fix:**
- Make sure the connection string includes:
  - `tls=true`
  - `authMechanism=SCRAM-SHA-256`
  - `retrywrites=false` (required for Cosmos DB)
  - `maxIdleTimeMS=120000`

### Error: "Module not found" or TypeScript errors

**Fix:**
```bash
npm install
npm install -g ts-node typescript
```

## What Gets Seeded

The seed script creates:

- **Organizations:** OpenAI, Anthropic, Google, Meta, Mistral AI
- **Domains:** Code Generation, Creative Writing, Mathematics, Data Analysis, Legal, Medical, Translation, Question Answering, Summarization, Sentiment Analysis, Chat & Conversation, SEO & Marketing
- **Models:** GPT-4 Turbo, GPT-3.5 Turbo, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku, Gemini Pro, Llama 3 70B, Llama 3 8B, Mixtral 8x7B, Command R+
- **Model Rankings:** Initial ELO scores for each model in each domain
- **Test Cases:** Sample test cases for different domains
- **Evaluations & Battles:** Sample evaluation data with battles

## Re-seeding

If you want to re-seed (clear and re-populate):

1. The seed script automatically clears existing data
2. Just run `npm run db:seed` again

To keep existing data and only add new data:
1. Open `scripts/seed.ts`
2. Comment out the "Clear existing data" section (lines 17-26)
3. Run `npm run db:seed` again

## Next Steps

After seeding:
1. Set environment variables in Azure App Service (if not already set)
2. Restart your app service
3. Test the API endpoints
4. Verify data is accessible through your app

