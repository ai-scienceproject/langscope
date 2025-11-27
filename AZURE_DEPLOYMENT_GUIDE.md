# Azure Deployment Guide - Complete Setup

## Table of Contents
1. [Overview](#overview)
2. [Domain Options](#domain-options)
3. [Step-by-Step Azure Setup](#step-by-step-azure-setup)
4. [Exposing to External Users](#exposing-to-external-users)
5. [Custom Domain Setup](#custom-domain-setup)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Environment Variables](#environment-variables)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Overview

When you deploy to Azure, you have two options for exposing your application:

1. **Free Azure Subdomain** (No domain purchase needed)
   - Format: `langscope.azurewebsites.net`
   - Free, automatically provided
   - Includes SSL certificate
   - Perfect for testing and development

2. **Custom Domain** (Optional, recommended for production)
   - Format: `langscope.ai` or `www.langscope.ai`
   - Requires domain purchase (~$10-15/year)
   - More professional and memorable
   - Better for production use

**Answer: You do NOT need to buy a domain to expose your app. Azure provides a free subdomain that works immediately.**

---

## Domain Options

### Option 1: Free Azure Subdomain (Recommended for Start)

**Pros:**
- ✅ Completely free
- ✅ Works immediately after deployment
- ✅ Includes free SSL certificate
- ✅ No DNS configuration needed
- ✅ Perfect for testing and MVP

**Cons:**
- ❌ Less professional URL
- ❌ Harder to remember
- ❌ Not ideal for production branding

**Example URL:** `https://langscope-app.azurewebsites.net`

### Option 2: Custom Domain (Recommended for Production)

**Pros:**
- ✅ Professional and memorable
- ✅ Better for branding
- ✅ SEO benefits
- ✅ More trustworthy

**Cons:**
- ❌ Requires domain purchase (~$10-15/year)
- ❌ Requires DNS configuration
- ❌ Slightly more setup

**Example URL:** `https://langscope.ai`

**Where to Buy Domains:**
- **Namecheap**: ~$10-15/year for `.ai` domains
- **Google Domains**: ~$10-20/year
- **Azure Domain Services**: Integrated with Azure
- **GoDaddy**: ~$10-30/year

---

## Step-by-Step Azure Setup

### Step 1: Create Azure Resources

#### 1.1 Create Azure Cosmos DB for MongoDB

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** (top left, green button)
3. Search for **"Cosmos DB"** or **"DocumentDB"** or **"Azure Cosmos DB"**
4. You might see:
   - **"Azure Cosmos DB"** ← Select this
   - **"Azure DocumentDB (with MongoDB compatibility)"** ← Also correct
5. Click **Create**
6. **Important:** Select **"Azure DocumentDB (with MongoDB Compatibility)"** as the Account Type
   - ⭐ This is the **RECOMMENDED** option
   - ✅ Modern workloads & AI/Vector search support
   - ✅ Cost-efficient scaling model
   - ✅ Open-source engine
   - ✅ Better for analytics and AI workloads
   - ❌ **Don't select** "Request unit (RU) database account" (older model, limited for AI)

**Note:** "Azure DocumentDB" is the modern name for the new Cosmos DB MongoDB API. This is the correct service!

**Configuration - Cluster Details:**

- **Subscription**: Your Azure subscription
- **Resource Group**: Create new `langscope-rg`
- **Cluster name**: `langscope-mongodb` (must be globally unique)
  - ⚠️ **This is the "Cluster name" field** you see in the UI
  - This name must be **globally unique** across all Azure accounts
  - The name will appear in your connection string: `langscope-mongodb.mongo.cosmos.azure.com`
  - You can use any name you want (e.g., `myapp-db`, `langscope-prod`, etc.)
  - If the name is taken, Azure will show an error - try a different name
- **Free tier**: 
  - ✅ **Enable Free tier** (if available) - Provides 1,000 RU/s + 25 GB storage free forever
  - ⚠️ **Important**: Free tier is a **permanent setting** - you cannot disable it later
  - ✅ **Good news**: You can still scale beyond free tier limits and pay only for additional usage
  - ✅ **You can switch** between Serverless and Provisioned modes later
  - Or leave unchecked for regular pricing (no free tier benefits)
- **Location**: Choose closest to your users (e.g., `East US`, `West Europe`)
- **Cluster tier**: 
  - ⭐ **Serverless** (RECOMMENDED) - Pay per use, no minimum ($0.25 per million RU)
  - **Provisioned** (for high traffic) - Fixed RU/s, minimum $23/month
- **MongoDB version**: Latest (usually 4.2 or 5.0)

**Configuration - Administrator Account:**

- **Admin username**: `langscope-admin` (or any username you prefer)
  - ⚠️ **Important**: Remember this username - you'll need it for the connection string
  - Can be any username (e.g., `admin`, `dbadmin`, `langscope-user`)
- **Password**: Create a strong password
  - ⚠️ **CRITICAL**: Save this password securely - you'll need it for the connection string
  - Must meet Azure password requirements (usually 8+ characters, mix of letters/numbers)
- **Confirm password**: Re-enter the same password

**Configuration - Network Connectivity and Firewall Rules:**

1. **Connectivity method**: 
   - ✅ **Select "Public access (allowed IP addresses)"** ← This is the correct option
   - ❌ **Don't select "Private access"** (coming soon, not available yet)

2. **Firewall rules**:
   - ✅ **CHECK "Allow public access from Azure services and resources within Azure to this cluster"** ← **REQUIRED**
     - This allows your App Service to connect to the database
     - Without this, your web app won't be able to access the database
   
   - **Optional - Add your current IP** (if you want to connect from your local machine):
     - Click **"+ Add current client IP address"** 
     - This allows you to connect from your computer for testing/development
     - Your IP will be shown (e.g., `103.242.189.71`)
   
   - ❌ **DO NOT click "+ Add 0.0.0.0 - 255.255.255.255"** 
     - This would allow access from ALL IP addresses worldwide
     - **Major security risk** - don't do this!

3. **Encrypted connections**:
   - ✅ TLS/SSL encryption is automatically enforced
   - All connections are encrypted by default

**Configuration - Data Encryption:**

- **Data encryption**: 
  - ⭐ **Select "Server managed" (Service-Managed Keys)** ← **RECOMMENDED for most users**
    - ✅ Automatic encryption with AES-256
    - ✅ No configuration needed - Microsoft manages keys
    - ✅ Strong security out of the box
    - ✅ Zero maintenance overhead
    - ✅ Perfect for most web applications
  
  - **"Customer managed" (Customer-Managed Keys)** - Only if needed:
    - ⚠️ Requires Azure Key Vault setup
    - ⚠️ More complex configuration
    - ⚠️ You manage key rotation and access
    - ✅ Use only if you have specific compliance requirements (HIPAA, GDPR with strict key control, etc.)
    - ✅ Use if your organization requires direct control over encryption keys

**Recommendation:**
- ✅ **Choose "Server managed"** for your web application
- ✅ Provides strong encryption (AES-256) automatically
- ✅ No additional setup or maintenance required
- ✅ Only choose "Customer managed" if you have specific compliance/regulatory requirements

**Configuration - Tags (Optional but Recommended):**

Tags help organize and manage your Azure resources. They're optional but useful for:
- **Cost tracking**: Group resources by project/environment
- **Billing management**: Track costs by department/project
- **Resource organization**: Filter and find resources easily
- **Compliance**: Tag resources for regulatory requirements

**Recommended Tags:**
- **Name**: `Project` → Value: `langscope` (or your project name)
- **Name**: `Environment` → Value: `production` (or `development`, `staging`)
- **Name**: `Owner` → Value: `your-email@example.com` (or team name)
- **Name**: `CostCenter` → Value: `engineering` (or your department)

**Example Tags:**
```
Project = langscope
Environment = production
Owner = admin@example.com
CostCenter = engineering
```

**Note:** Tags are optional - you can skip this step if you don't need resource organization. You can always add tags later.

**⚠️ Important Notes:**
- **Account Type choice cannot be changed after creation** - Choose "Azure DocumentDB (with MongoDB Compatibility)"!
- **Free tier is permanent** - Once enabled, you cannot disable it (but you can still scale beyond free limits)
- **You CAN change Cluster tier later** - Switch between Serverless and Provisioned anytime
- **Save your username and password** - you'll need them for the connection string
- Don't select "Azure Database for MongoDB" - that's a different service!
- The "Cluster name" is what Azure calls it in the new UI - it's the same as "Account Name" in older interfaces

**Free Tier Details:**
- ✅ **1,000 RU/s** provisioned throughput free forever
- ✅ **25 GB** storage free forever
- ✅ **One free account per Azure subscription**
- ✅ **You can scale beyond these limits** - only pay for additional usage
- ✅ **You can switch to Serverless or Provisioned** modes anytime
- ❌ **Cannot disable free tier** once enabled (but this is usually fine - you still get the free benefits)

**Wait 5-10 minutes for deployment**

#### 1.1.1 Network Access Configuration (Already Set During Creation)

The network access is configured during cluster creation. Here's what you should have set:

**During Creation:**
- ✅ **Connectivity method**: "Public access (allowed IP addresses)" - Selected
- ✅ **Firewall rules**: "Allow public access from Azure services" - **CHECKED** (Required!)
- ✅ **Your current IP**: Added if you want local access (optional)

**After Creation - If You Need to Change:**

1. Go to your Cosmos DB resource in Azure Portal
2. Click **Networking** in the left menu
3. You can:
   - Add/remove IP addresses
   - Verify "Allow Azure services" is enabled
   - Add your current IP for local development

**Security Best Practices:**
- ✅ **"Allow Azure services" is checked** - Required for App Service
- ✅ **Only specific IPs added** - Not "0.0.0.0 - 255.255.255.255"
- ✅ **TLS encryption** - Automatically enforced
- ❌ **Don't allow all IPs** - Security risk!

#### 1.2 Get MongoDB Connection String

1. Go to your Cosmos DB resource
2. Click **Connection String** in left menu
3. Copy the **Primary Connection String**

**Connection String Format:**

Azure Cosmos DB for MongoDB uses the `mongodb+srv://` format (MongoDB Atlas style):

```
mongodb+srv://[username]:<password>@[cluster-name].global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
```

**Example:**
```
mongodb+srv://sahebscienceproject:<password>@langscope-db.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
```

**Important:** 
- Replace `<password>` with the **actual password** you created during setup
- Replace `[username]` with your **Admin username** (e.g., `sahebscienceproject`)
- Replace `[cluster-name]` with your **Cluster name** (e.g., `langscope-db`)
- The connection string already includes:
  - `tls=true` - TLS encryption enabled
  - `authMechanism=SCRAM-SHA-256` - Authentication method
  - `retrywrites=false` - Retry writes disabled (Cosmos DB requirement)
  - `maxIdleTimeMS=120000` - Connection timeout settings

**To Add Database Name:**

If you want to specify a database name, add it before the `?`:

```
mongodb+srv://sahebscienceproject:<password>@langscope-db.global.mongocluster.cosmos.azure.com/langscope?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
```

**Alternative:** You can also get the connection string from:
- **Keys** section → Copy connection string and replace `<password>` with your actual password

#### 1.3 Create Azure App Service

1. Go to **Create a resource**
2. Search for **"Web App"**
3. Click **Create**

**Configuration - Basics Tab:**

- **Subscription**: Your Azure subscription
- **Resource Group**: Same as database (`langscope-rg`)
- **Name**: `langscope-app` (must be globally unique)
- **Publish**: **Code** ← Select this
- **Runtime stack**: ⚠️ **IMPORTANT** - Select **Node.js**
  - ⭐ **Select "Node 24 LTS"** (or the latest LTS version available)
  - Node 24 LTS is the newest LTS version with longer support period
  - If you see older versions (like Node 20 LTS) with EOL warnings, choose Node 24 LTS instead
  - LTS (Long Term Support) versions are recommended for production
- **Operating System**: **Linux** ← Select this
- **Region**: **East Asia** (or same as your Cosmos DB - East Asia)

**Configuration - Deployment Tab:**
- ⚠️ **Continuous deployment**: Select **"Disable"** ← Skip GitHub setup for now
- ⚠️ **GitHub settings**: Leave empty (you can set up GitHub later if needed)
- ⚠️ **Basic authentication**: Leave as **"Disable"** (default)
- **Note**: You can deploy manually using VS Code, Azure CLI, or ZIP deploy (see deployment methods below)

**Configuration - Networking Tab:**
- Leave default settings for now

**Configuration - Monitoring Tab:**
- Leave default settings (or enable Application Insights if needed)

**Configuration - Database Tab (Optional):**
- ⚠️ **You can skip this section** - You're using Cosmos DB (already created)
- If you see "Create a Database" option:
  - ❌ **Do NOT create a database here** - You already have Cosmos DB
  - This is for Azure SQL Database (different service)
  - Your app will connect to Cosmos DB using the connection string
- If you see VNet/networking options:
  - Leave as default (not needed for public access to Cosmos DB)
  - Your Cosmos DB is already configured with "Allow Azure services" access

**Configuration - Tags Tab:**
- Optional: Add tags if you want (same as Cosmos DB tags)

**Configuration - Review + Create Tab:**

Before clicking "Create", you'll configure the **App Service Plan**:

1. **App Service Plan Section:**
   - Click **"Create new"** (or select existing if you have one)
   - **Name**: `langscope-plan` (or any name you prefer)

2. **Pricing Plan:**
   - ⚠️ **IMPORTANT**: Click **"Change plan"** or **"Explore pricing plans"**
   - **DO NOT use Premium V3** (too expensive - ~$150+/month)
   - **Recommendation for Langscope (LLM Evaluation Platform):**
     
     **⭐ Start with Basic B1 (~$13/month)** - Recommended for your app
     - ✅ Good for LLM evaluation workloads (needs CPU for API calls)
     - ✅ Supports custom domains
     - ✅ No daily timeout limits
     - ✅ Better performance than Free tier
     - ✅ Can handle moderate traffic
     - ✅ Can scale up later if needed
     
     **Alternative Options:**
     - **Free F1** ($0/month) - Only for initial testing
     - ❌ Limited CPU (shared, can be slow)
     - ❌ Daily timeout after 60 minutes of inactivity
     - ❌ No custom domain support
     - ❌ May struggle with LLM API calls
     - ✅ Good for: Testing deployment, development
     
     - **Standard S1** (~$70/month) - For production with high traffic
     - ✅ Better performance and scaling
     - ✅ Auto-scaling support
     - ✅ More CPU and memory
     - ✅ Good for: High traffic, many concurrent users
     
   - Click **Apply** or **Select**

3. **Zone Redundancy:**
   - ⚠️ **Select "Disabled"** ← Recommended for cost savings
     - Enabled: Minimum 2 instances, more expensive
     - Disabled: Minimum 1 instance, cheaper
   - You can enable zone redundancy later if needed

4. **Click "Review + Create"**, then **"Create"**

**Wait 2-5 minutes for deployment**

**⚠️ Important Notes:**
- **Runtime stack**: Must be **Node.js** (for Next.js application)
- **Pricing plan**: Choose **Free F1** for testing or **Basic B1** for production
- **Zone redundancy**: **Disable** to save costs (unless you need high availability)
- **Region**: Should match your Cosmos DB region (East Asia) for best performance

---

## Exposing to External Users

### Using Free Azure Subdomain (Immediate Access)

**Your app is automatically exposed!**

1. After App Service deployment completes:
   - Go to your App Service resource
   - Click **Overview** in left menu
   - Find **URL**: `https://langscope-app.azurewebsites.net`
   - **This URL is live and accessible to anyone on the internet!**

2. **Test it:**
   - Open the URL in any browser
   - Your application should be accessible
   - No additional configuration needed

**That's it! Your app is now publicly accessible.**

### Default Azure URL Format

- **Pattern**: `https://[app-name].azurewebsites.net`
- **Example**: `https://langscope-app.azurewebsites.net`
- **SSL**: Automatically included (HTTPS)
- **Access**: Publicly accessible worldwide

---

## Custom Domain Setup

### Step 1: Purchase Domain (Optional)

1. **Choose a domain registrar:**
   - Namecheap: https://www.namecheap.com
   - Google Domains: https://domains.google
   - Azure Domain Services: In Azure Portal

2. **Search for domain:**
   - Try: `langscope.ai`, `langscope.com`, `langscope.io`
   - Check availability and price

3. **Purchase domain:**
   - Complete checkout
   - Wait for domain activation (usually instant to 24 hours)

### Step 2: Configure Custom Domain in Azure

#### 2.1 Add Custom Domain to App Service

1. Go to your App Service in Azure Portal
2. Click **Custom domains** in left menu
3. Click **Add custom domain**
4. Enter your domain: `langscope.ai` or `www.langscope.ai`
5. Click **Validate**

#### 2.2 Configure DNS Records

Azure will show you the DNS records to add. You need to add these in your domain registrar's DNS settings:

**For Root Domain (langscope.ai):**
```
Type: A
Name: @
Value: [IP address shown by Azure]
TTL: 3600
```

**For WWW Subdomain (www.langscope.ai):**
```
Type: CNAME
Name: www
Value: langscope-app.azurewebsites.net
TTL: 3600
```

**Steps:**
1. Go to your domain registrar (Namecheap, Google Domains, etc.)
2. Find **DNS Management** or **DNS Settings**
3. Add the records shown by Azure
4. Save changes
5. Wait 5-60 minutes for DNS propagation

#### 2.3 Verify Domain in Azure

1. After adding DNS records, go back to Azure Portal
2. Click **Refresh** in Custom domains
3. Azure will verify the domain
4. Once verified, the domain is active

### Step 3: SSL Certificate (Free with Azure)

Azure provides **free SSL certificates** for custom domains:

1. Go to **Custom domains** in App Service
2. Click **Add binding** next to your domain
3. Select your domain
4. Choose **SNI SSL** (free)
5. Click **Add binding**

**Wait 5-10 minutes for certificate provisioning**

Your domain will now have HTTPS: `https://langscope.ai`

---

## Environment Variables

### Step 1: Configure App Settings

1. Go to your App Service in Azure Portal
2. Click **Configuration** in left menu
3. Click **Application settings** tab
4. Click **+ New application setting**

**Add these settings:**

```
DATABASE_URL = mongodb+srv://sahebscienceproject:YOUR_PASSWORD@langscope-db.global.mongocluster.cosmos.azure.com/langscope?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000

NEXT_PUBLIC_API_URL = https://langscope-app.azurewebsites.net

NEXT_PUBLIC_WS_URL = wss://langscope-app.azurewebsites.net

NODE_ENV = production
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual password (the one you created during Cosmos DB setup)
- Replace `sahebscienceproject` with your actual admin username (if different)
- Replace `langscope-db` with your actual cluster name (if different)
- Replace `langscope-app` with your actual App Service name
- Replace `langscope` with your database name (or remove `/langscope` to use default)
- Click **Save** after adding all settings

**Connection String Format Notes:**
- Uses `mongodb+srv://` protocol (MongoDB Atlas style)
- Includes `tls=true` for encryption
- Includes `authMechanism=SCRAM-SHA-256` for authentication
- Includes `retrywrites=false` (required for Cosmos DB)
- Includes `maxIdleTimeMS=120000` for connection management

### Step 2: Restart App Service

1. Go to **Overview** in App Service
2. Click **Restart** button
3. Wait 1-2 minutes for restart

---

## Database Seeding

### Option 1: Run Seed Script Locally

1. Update your local `.env` file with Azure connection string:
   ```env
   DATABASE_URL=mongodb://langscope-mongodb:YOUR_PASSWORD@langscope-mongodb.mongo.cosmos.azure.com:10255/langscope?ssl=true&replicaSet=globaldb
   ```

2. Run seed script:
   ```bash
   npm run db:seed
   ```

### Option 2: Use Azure Cloud Shell

1. Go to Azure Portal
2. Click **Cloud Shell** icon (top right)
3. Clone your repository:
   ```bash
   git clone https://github.com/chatterjeesaheb/langscope.git
   cd langscope
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set environment variable:
   ```bash
   export DATABASE_URL="mongodb+srv://sahebscienceproject:YOUR_PASSWORD@langscope-db.global.mongocluster.cosmos.azure.com/langscope?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"
   ```
   
   **Important:** Replace `YOUR_PASSWORD` with your actual password

6. Run seed script:
   ```bash
   npm run db:seed
   ```

---

## Deployment Methods

### ⭐ Method 1: VS Code Azure Extension (Easiest - Recommended)

**Prerequisites:**
- VS Code installed
- Azure account

**Steps:**

1. **Install VS Code Extension:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for **"Azure App Service"**
   - Install the extension by Microsoft

2. **Sign in to Azure:**
   - Click the Azure icon in VS Code sidebar
   - Click **"Sign in to Azure"**
   - Follow the browser authentication

3. **Deploy Your App:**
   - Right-click on your project folder in VS Code
   - Select **"Deploy to Web App"**
   - Select your subscription
   - Select your App Service (`langscope-app`)
   - VS Code will build and deploy automatically

**That's it!** Your app will be deployed in a few minutes.

### Method 2: Azure CLI (Command Line)

**Prerequisites:**
- Azure CLI installed ([Download here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Node.js installed

**Steps:**

```bash
# 1. Login to Azure
az login

# 2. Navigate to your project directory
cd /path/to/langscope

# 3. Build your Next.js app locally
npm install
npm run build

# 4. Deploy to Azure App Service
az webapp up \
  --name langscope-app \
  --resource-group langscope-rg \
  --runtime "NODE:24-lts" \
  --os-type Linux
```

**Note:** This will automatically:
- Create a ZIP file of your app
- Deploy it to Azure
- Configure the runtime

### Method 3: ZIP Deploy (Manual)

**Steps:**

1. **Build your app locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Create a ZIP file:**
   - On Windows: Right-click project folder → Send to → Compressed folder
   - On Mac/Linux: `zip -r deploy.zip . -x "node_modules/*" ".git/*"`

3. **Deploy via Azure Portal:**
   - Go to your App Service in Azure Portal
   - Click **Deployment Center** in left menu
   - Click **Local Git** or **ZIP Deploy**
   - Upload your ZIP file
   - Click **Deploy**

4. **Or use Azure CLI:**
   ```bash
   az webapp deployment source config-zip \
     --resource-group langscope-rg \
     --name langscope-app \
     --src deploy.zip
   ```

### Method 4: GitHub Actions (Optional - For CI/CD)

If you want to set up automatic deployment from GitHub later:

1. **Set up GitHub Secrets:**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `AZURE_WEBAPP_PUBLISH_PROFILE`
     - `AZURE_DATABASE_URL`

2. **Get Publish Profile:**
   - Go to App Service in Azure Portal
   - Click **Get publish profile**
   - Copy the content
   - Paste into GitHub Secret `AZURE_WEBAPP_PUBLISH_PROFILE`

3. **Create GitHub Actions Workflow:**
   - Create `.github/workflows/azure-deploy.yml`
   - (See example below)

---

## GitHub Actions Deployment Workflow

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.AZURE_DATABASE_URL }}
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'langscope-app'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

---

## Post-Deployment Checklist

### ✅ Application Access

- [ ] App is accessible at `https://langscope-app.azurewebsites.net`
- [ ] Homepage loads correctly
- [ ] No console errors in browser

### ✅ Database Connection

- [ ] API endpoints return data (test `/api/domains`)
- [ ] Database is seeded with initial data
- [ ] Models and rankings are visible

### ✅ Environment Variables

- [ ] `DATABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_API_URL` points to Azure URL
- [ ] `NODE_ENV` is set to `production`

### ✅ Custom Domain (If Used)

- [ ] DNS records are configured
- [ ] Domain is verified in Azure
- [ ] SSL certificate is active
- [ ] HTTPS works on custom domain

### ✅ Security

- [ ] Database connection uses SSL
- [ ] Environment variables are secure
- [ ] No sensitive data in code

### ✅ Performance

- [ ] App Service plan is appropriate for traffic
- [ ] Database has sufficient capacity
- [ ] Images and assets load quickly

---

## Cost Estimation

### Free Tier (Testing/Development) - Not Recommended for LLM Platform

- **App Service**: Free F1 tier ($0/month)
  - ⚠️ Limited CPU (shared, can be slow for LLM API calls)
  - ⚠️ Daily timeout after 60 minutes inactivity
  - ⚠️ No custom domain support
- **Cosmos DB**: Free tier (1,000 RU/s + 25 GB free)
- **Domain**: Free Azure subdomain
- **Total**: ~$0-5/month (depending on usage)
- **Best for**: Initial testing, development only

### Basic Production - ⭐ RECOMMENDED for Langscope

- **App Service**: Basic B1 (~$13/month)
  - ✅ Dedicated CPU (good for LLM API calls)
  - ✅ No timeout limits
  - ✅ Custom domain support
  - ✅ Better performance
- **Cosmos DB**: Free tier + Serverless (pay per use beyond free limits)
  - Free: 1,000 RU/s + 25 GB
  - Additional: ~$0.25/GB + $0.10 per million RUs
- **Domain**: ~$10-15/year (optional)
- **Total**: ~$13-25/month (depending on database usage)
- **Best for**: Small to medium traffic, production use

### Standard Production (High Traffic)

- **App Service**: Standard S1 (~$70/month)
  - ✅ Better performance and auto-scaling
  - ✅ More CPU and memory
  - ✅ Good for high concurrent users
- **Cosmos DB**: Provisioned 400 RU/s (~$25/month) or Serverless
- **Domain**: ~$10-15/year
- **Total**: ~$100-120/month
- **Best for**: High traffic, many concurrent users, production at scale

### Why Basic B1 for Langscope?

Your LLM evaluation platform needs:
- ✅ **CPU resources** for handling LLM API calls (OpenRouter, etc.)
- ✅ **No timeouts** (evaluations can take time)
- ✅ **Custom domain** support (professional appearance)
- ✅ **Reliable performance** for battle evaluations
- ✅ **Cost-effective** for starting out

**Recommendation**: Start with **Basic B1** (~$13/month), then scale to Standard S1 if you get high traffic.

---

## Troubleshooting

### Quota Error: "Total Regional Cores quota exceeded"

**Error Message:**
```
Operation could not be completed as it results in exceeding approved Total Regional Cores quota.
Location: eastus, Current Limit: 0, Additional Required: 1
```

**What This Means:**
- Your Azure subscription has **0 cores allocated** in the selected region (East US)
- Azure Cosmos DB needs at least **1 core** to create the cluster
- This is common with new subscriptions, especially free tier or trial accounts

**Solution 1: Request Quota Increase (Recommended)**

1. **Go to Azure Portal** → [portal.azure.com](https://portal.azure.com)
2. **Navigate to Subscriptions:**
   - Search for "Subscriptions" in the top search bar
   - Click on your subscription
3. **Go to Usage + Quotas:**
   - In the left menu, click **"Usage + quotas"**
   - Or search for "Usage + quotas" in the subscription page
4. **Find Total Regional vCPUs:**
   - Filter by **"Compute"** or search for **"Total Regional vCPUs"**
   - Select the region (e.g., **"East US"**)
5. **Request Increase:**
   - Click on **"Total Regional vCPUs"** for East US
   - Click **"Request increase"** button
   - Enter **New limit**: `10` (or more if needed)
   - Add **Justification**: "Creating Azure Cosmos DB for MongoDB cluster"
   - Click **Submit**
6. **Wait for Approval:**
   - Usually approved within **1-2 hours** (sometimes up to 24 hours)
   - You'll receive an email when approved
   - Then try creating the Cosmos DB again

**Solution 2: Try a Different Region (Quick Fix)**

If you need it working immediately, try a different region:

1. **Go back to Cosmos DB creation**
2. **Change Location** to a different region:
   - **West US 2** (often has higher default quotas)
   - **West Europe**
   - **Southeast Asia**
   - **Central US**
3. **Try creating again** - Different regions may have different quota limits

**Solution 3: Upgrade Subscription (If on Free Tier)**

If you're on Azure Free Tier or Trial:

1. **Upgrade to Pay-As-You-Go:**
   - Go to **Subscriptions** → Your subscription
   - Click **"Upgrade"** or **"Switch to Pay-As-You-Go"**
   - Pay-As-You-Go subscriptions have higher default quotas
2. **Then request quota increase** (Solution 1)

**Quick Check: Current Quota Status**

To see your current quotas:
1. Go to **Subscriptions** → Your subscription
2. Click **Usage + quotas**
3. Filter by **"Compute"** and select your region
4. Look for **"Total Regional vCPUs"** - this shows your current limit

**Expected Timeline:**
- **Quota increase request**: Usually approved in 1-2 hours
- **Different region**: Works immediately (if that region has quota)
- **Subscription upgrade**: Immediate, then request quota increase

**After Quota Increase:**
- Go back to Cosmos DB creation
- Use the same settings
- Creation should work now

### Deployment Failure: "Terminal provisioning state 'Failed'"

**Error Message:**
```
The resource write operation failed to complete successfully, because it reached terminal provisioning state 'Failed'.
Target: /subscriptions/.../resourceGroups/langscope-rg/providers/Microsoft.DocumentDB/mongoClusters/langscope-db
```

**What This Means:**
- The Cosmos DB cluster deployment started but failed during provisioning
- The resource was partially created but couldn't complete
- Common causes: quota issues, region availability, configuration problems, or temporary Azure issues

**Solution 1: Check Deployment Details**

**If Azure Portal Shows "ReactView frame failed to load":**

This is a common Azure Portal UI issue. Try these workarounds:

1. **Refresh the Page:**
   - Press `F5` or click the refresh button
   - Clear browser cache and try again
   - Try a different browser (Chrome, Edge, Firefox)

2. **Use Activity Log Instead:**
   - Go to **Resource groups** → `langscope-rg`
   - Click **Activity log** in the left menu (this usually works even if Overview fails)
   - Look for operations with status "Failed" or "Succeeded"
   - Click on the failed deployment to see details
   - Look for error messages and codes

3. **Check Resource Group Overview:**
   - Go to **Resource groups** → `langscope-rg`
   - Click **Overview** (not the deployment)
   - Look at the resources list
   - Check if any resources show as "Failed" or have error icons

4. **Use Azure CLI (Alternative Method):**
   ```bash
   # List deployments in resource group
   az deployment group list --resource-group langscope-rg --output table
   
   # Get specific deployment details
   az deployment group show --resource-group langscope-rg --name CosmosDB-MongoDB-langscope-db-f1d544c2fa214a3c9ab1bdb092796ad9
   
   # Get deployment operations
   az deployment operation group list --resource-group langscope-rg --name CosmosDB-MongoDB-langscope-db-f1d544c2fa214a3c9ab1bdb092796ad9
   ```

**Understanding Activity Log Entries:**

If you see a log entry with:
- **Status**: "Succeeded" - This means the deployment operation completed
- **Operation**: "Microsoft.Resources/deployments/write" - This is the deployment wrapper
- **Level**: "Informational" - Not an error

**⚠️ Important:** A "Succeeded" deployment operation doesn't always mean the resource was created successfully. You need to check:

1. **Check if the actual resource exists:**
   - Go to **Resource groups** → `langscope-rg`
   - Look for a Cosmos DB resource (not the deployment)
   - Check if it shows as "Succeeded" or "Failed"

2. **Check nested operations:**
   - In Activity Log, look for operations related to:
     - `Microsoft.DocumentDB/mongoClusters` (the actual Cosmos DB resource)
     - Not just `Microsoft.Resources/deployments` (the deployment wrapper)
   - These nested operations will show the actual resource creation status

3. **Check all operations in the deployment:**
   - Click on the deployment in Activity Log
   - Look for "Related events" or expand to see all operations
   - Check if any nested operations failed

5. **Check Resource Status:**
   - Go to **Resource groups** → `langscope-rg`
   - Look for any Cosmos DB resources
   - Click on the resource (not the deployment)
   - Go to **Overview** to see the status
   - Check for any error messages or warnings

**Solution 2: Clean Up and Retry**

1. **Delete Failed Resource:**
   - If the resource exists but is in "Failed" state:
     - Go to the resource in Azure Portal
     - Click **Delete**
     - Wait for deletion to complete (may take a few minutes)
   - If deletion fails or resource is stuck:
     - Wait 10-15 minutes and try again
     - Azure may be cleaning it up automatically

2. **Verify Resource Group is Clean:**
   - Go to **Resource groups** → `langscope-rg`
   - Ensure no Cosmos DB resources exist
   - If needed, delete the entire resource group and create a new one

3. **Retry Creation:**
   - Go back to **Create a resource** → **Azure Cosmos DB**
   - Use the same settings but try:
     - **Different cluster name** (in case the old one is still being cleaned up)
     - **Different region** (if the current region has issues)
     - **Wait 15-30 minutes** before retrying (if it was a temporary Azure issue)

**Solution 3: Check Common Issues**

1. **Quota Issues:**
   - Verify you have sufficient quota (see "Quota Error" section above)
   - Check if quota increase was approved

2. **Region Availability:**
   - Some regions may have temporary capacity issues
   - Try a different region:
     - **West US 2**
     - **West Europe**
     - **Southeast Asia**

3. **Cluster Name:**
   - Ensure cluster name is globally unique
   - Try a different name if the previous one failed

4. **Subscription Issues:**
   - Verify subscription is active and not suspended
   - Check for any payment/billing issues
   - Ensure subscription has necessary permissions

**Solution 4: Use Azure Support (If Issues Persist)**

If the problem continues:

1. **Open Support Request:**
   - Go to **Help + support** in Azure Portal
   - Click **Create a support request**
   - Select:
     - **Issue type**: Technical
     - **Service**: Azure Cosmos DB
     - **Problem type**: Deployment
     - **Problem subtype**: Cluster creation failed

2. **Provide Details:**
   - Include the error message
   - Include resource group name: `langscope-rg`
   - Include subscription ID: `01ef847d-0f3d-4ae2-a669-d0191135d5a4`
   - Include any error codes from Activity Log

**Quick Recovery Steps:**

1. ✅ **Wait 15-30 minutes** (sometimes Azure needs time to clean up)
2. ✅ **Delete failed resource** (if it exists)
3. ✅ **Try different cluster name** (e.g., `langscope-db-2`)
4. ✅ **Try different region** (if current region has issues)
5. ✅ **Check Activity Log** for specific error details
6. ✅ **Verify quota** is sufficient

**Prevention Tips:**

- Ensure quota is increased before creating
- Use a unique cluster name
- Choose a region with good availability
- Don't create multiple clusters simultaneously
- Wait for one deployment to complete before starting another

### App Not Accessible

1. **Check App Service Status:**
   - Go to App Service → Overview
   - Ensure status is "Running"
   - If stopped, click "Start"

2. **Check Logs:**
   - Go to App Service → Log stream
   - Look for errors
   - Check Application Insights

3. **Verify Environment Variables:**
   - Go to Configuration → Application settings
   - Ensure all variables are set
   - Restart app after changes

### Database Connection Issues

1. **Check Connection String:**
   - Verify password is correct
   - Ensure SSL is enabled
   - Check firewall rules in Cosmos DB

2. **Test Connection:**
   - Use Azure Cloud Shell
   - Try connecting with `mongosh`
   - Check network connectivity

### Custom Domain Not Working

1. **Check DNS Propagation:**
   - Use `nslookup langscope.ai` or `dig langscope.ai`
   - Verify DNS records are correct
   - Wait up to 48 hours for full propagation

2. **Verify Domain in Azure:**
   - Go to Custom domains
   - Ensure domain shows as "Verified"
   - Check SSL certificate status

---

## Summary

### Quick Answer to Your Questions:

**Q: Do I need to buy a domain to expose the app?**
**A: No!** Azure provides a free subdomain (`langscope-app.azurewebsites.net`) that works immediately. You can use this for testing and even production if you don't mind the URL.

**Q: How do I expose to external users?**
**A: Your app is automatically exposed** when you deploy to Azure App Service. The URL `https://langscope-app.azurewebsites.net` is publicly accessible to anyone on the internet.

**Q: Should I buy langscope.ai?**
**A: Optional but recommended for production.** A custom domain looks more professional, but the free Azure subdomain works perfectly fine for getting started.

### Recommended Approach:

1. **Start with free Azure subdomain** - Deploy and test
2. **Buy custom domain later** - When ready for production
3. **Configure custom domain** - Follow the steps above
4. **Set up SSL** - Free with Azure App Service

Your application will be accessible to external users immediately after deployment, with or without a custom domain!

