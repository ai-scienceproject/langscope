# LangScope - Complete Code Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Models](#database-models)
4. [API Routes](#api-routes)
5. [Components](#components)
6. [Services](#services)
7. [Utilities](#utilities)
8. [Configuration](#configuration)
9. [Data Flow](#data-flow)

---

## Project Overview

**LangScope** is a comprehensive LLM (Large Language Model) evaluation platform that allows users to:
- Compare and rank different LLM models across various domains
- Conduct head-to-head battles between models
- View detailed analytics and battle history
- Track model performance using ELO rating system

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB with Mongoose ODM (Azure Cosmos DB for MongoDB in production)
- **Authentication**: Supabase Auth (Email/Password + OAuth: Google, GitHub)
- **State Management**: React Context API, Zustand (for some components)
- **Styling**: Tailwind CSS with custom design system

---

## Architecture

### Project Structure

```
langscope/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/                # API endpoints
│   │   ├── arena/              # Arena battle pages
│   │   ├── rankings/           # Rankings pages
│   │   ├── results/            # Results dashboard pages
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── layout/             # Layout components
│   │   ├── pages/               # Page-specific components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── domain/              # Domain-related components
│   │   ├── model/               # Model-related components
│   │   └── rankings/            # Rankings components
│   ├── lib/                     # Utilities and helpers
│   │   ├── db/                  # Database connection and models
│   │   │   ├── models/         # Mongoose schemas
│   │   │   └── services/       # Database service layer
│   │   ├── utils/               # Utility functions
│   │   └── api.ts               # API client
│   ├── contexts/                # React contexts
│   ├── types/                   # TypeScript type definitions
│   └── styles/                  # Global styles
├── scripts/                     # Utility scripts
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

### Key Design Patterns

1. **Service Layer Pattern**: Database operations are abstracted into service functions
2. **Component Composition**: Reusable UI components with composition
3. **API Route Pattern**: Next.js API routes handle server-side logic
4. **Type Safety**: Comprehensive TypeScript types for all data structures

---

## Database Models

### Connection (`src/lib/db/connect.ts`)

**Purpose**: Establishes and manages MongoDB connection with connection pooling.

**Key Features**:
- Uses global caching to prevent multiple connections in development
- Implements connection reuse for serverless environments
- Handles connection errors gracefully
- **Automatic database name fix**: Automatically adds `/langscope` to connection strings if missing (Azure Cosmos DB connection strings often don't include database name)

**Database Name Fix**:
The `ensureDatabaseName()` function automatically adds the database name `/langscope` to connection strings that are missing it. This is particularly important for Azure Cosmos DB connection strings which often end with `/?options` instead of `/databaseName?options`.

**Code Explanation**:
```typescript
// Function to ensure database name is present in connection string
function ensureDatabaseName(uri: string): string {
  // Checks if mongodb+srv:// or mongodb:// connection string
  // If database name is missing, adds /langscope
  // Returns corrected connection string
}

// Global cache to store connection in development (Next.js hot reload)
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Function to connect to MongoDB
async function connectDB(): Promise<typeof mongoose> {
  // Get and process connection string dynamically (ensures database name is present)
  const MONGODB_URI = ensureDatabaseName(process.env.DATABASE_URL);
  
  // If connection exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create one
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  // Wait for connection and cache it
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### Model Schemas

#### 1. Domain (`src/lib/db/models/Domain.ts`)

**Purpose**: Represents evaluation domains (e.g., "Code Generation", "Customer Support").

**Fields**:
- `name`: Domain name (e.g., "Code Generation")
- `slug`: URL-friendly identifier (e.g., "code-generation")
- `description`: Domain description
- `icon`: Emoji icon for the domain
- `isActive`: Whether domain is currently active
- `createdAt`, `updatedAt`: Timestamps

**Indexes**:
- Unique index on `slug` for fast lookups

#### 2. Model (`src/lib/db/models/Model.ts`)

**Purpose**: Represents LLM models (e.g., GPT-4, Claude 3).

**Fields**:
- `name`: Model name (e.g., "GPT-4")
- `slug`: URL-friendly identifier
- `organizationId`: Reference to Organization
- `description`: Model description
- `type`: Model type (open-source, proprietary, api-only)
- `contextLength`: Maximum context window
- `strengths`: Array of model strengths
- `weaknesses`: Array of model weaknesses
- `pricing`: Pricing information (input/output costs)
- `createdAt`, `updatedAt`: Timestamps

**Indexes**:
- Unique index on `slug`

#### 3. Organization (`src/lib/db/models/Organization.ts`)

**Purpose**: Represents companies that develop models (e.g., OpenAI, Anthropic).

**Fields**:
- `name`: Organization name
- `slug`: URL-friendly identifier

#### 4. ModelRanking (`src/lib/db/models/ModelRanking.ts`)

**Purpose**: Tracks model performance rankings per domain.

**Fields**:
- `domainId`: Reference to Domain
- `modelId`: Reference to Model
- `rank`: Current rank (1, 2, 3, etc.)
- `eloScore`: ELO rating (default: 1500)
- `wins`: Number of wins
- `losses`: Number of losses
- `ties`: Number of ties
- `totalBattles`: Total battles participated
- `lastBattleAt`: Timestamp of last battle

**Indexes**:
- Unique compound index on `(domainId, modelId)`
- Index on `(domainId, rank)` for sorting

**ELO Rating System**:
- Initial ELO: 1500
- K-factor: 32 (standard for chess)
- Formula: `newElo = currentElo + K * (actualScore - expectedScore)`
- Expected score: `1 / (1 + 10^((opponentElo - currentElo) / 400))`

#### 5. Battle (`src/lib/db/models/Battle.ts`)

**Purpose**: Represents a single battle between two models.

**Fields**:
- `evaluationId`: Reference to Evaluation
- `domainId`: Reference to Domain
- `testCaseId`: Reference to TestCase
- `modelAId`: Reference to Model (first model)
- `modelBId`: Reference to Model (second model)
- `responseA`: Response from model A
- `responseB`: Response from model B
- `winner`: Battle winner (MODEL_A, MODEL_B, or TIE)
- `judgeCount`: Number of judges who voted
- `status`: Battle status (pending, completed, failed)
- `createdAt`, `updatedAt`: Timestamps

**Indexes**:
- Index on `evaluationId` for querying battles by evaluation
- Index on `domainId` for querying battles by domain

#### 6. Evaluation (`src/lib/db/models/Evaluation.ts`)

**Purpose**: Represents a complete evaluation session.

**Fields**:
- `domainId`: Reference to Domain
- `status`: Evaluation status (in-progress, completed, failed)
- `totalBattles`: Total number of battles planned
- `completedBattles`: Number of battles completed
- `createdAt`, `updatedAt`: Timestamps

#### 7. TestCase (`src/lib/db/models/TestCase.ts`)

**Purpose**: Represents test cases for battles.

**Fields**:
- `domainId`: Reference to Domain
- `title`: Test case title
- `prompt`: Test prompt/question
- `expectedCriteria`: Expected evaluation criteria
- `difficulty`: Difficulty level
- `tags`: Array of tags
- `isActive`: Whether test case is active

#### 8. User (`src/lib/db/models/User.ts`)

**Purpose**: Represents application users (legacy MongoDB model).

**Note**: As of the latest update, user authentication is handled by **Supabase Auth**. Users are stored in Supabase, not MongoDB. This model may still exist for backward compatibility or future use.

**Fields**:
- `email`: User email (unique)
- `passwordHash`: Hashed password
- `name`: User name
- `role`: User role (user, admin, judge)
- `createdAt`, `updatedAt`: Timestamps

**Current Authentication**: See [Authentication](#authentication) section below.

---

## API Routes

### Domain APIs

#### GET `/api/domains`

**Purpose**: Fetch all domains with aggregated statistics.

**Implementation** (`src/app/api/domains/route.ts`):
1. Connects to database
2. Calls `getDomainsWithStats()` service function
3. Aggregates `modelCount` and `battleCount` for each domain
4. Returns sorted list of domains

**Response**:
```json
{
  "data": [
    {
      "_id": "...",
      "name": "Code Generation",
      "slug": "code-generation",
      "battleCount": 1247,
      "modelCount": 23
    }
  ]
}
```

#### GET `/api/domains/[slug]`

**Purpose**: Fetch a single domain by slug.

**Implementation** (`src/app/api/domains/[slug]/route.ts`):
1. Extracts `slug` from route parameters
2. Calls `getDomainBySlug()` service function
3. Returns domain data

#### POST `/api/identify-domain`

**Purpose**: Identify domain from user text and optional file using LLM.

**Implementation** (`src/app/api/identify-domain/route.ts`):
1. Accepts `FormData` with `text` (mandatory) and optional `file` (image or PDF)
2. **Database Check**: If only text provided, first checks database for exact case-insensitive match using `getDomainByName()`
3. **LLM Identification**: If no match found or file provided:
   - For images: Uses OCR (tesseract.js) to extract text
   - For PDFs: Extracts text content
   - Combines extracted text with user text
   - Calls OpenRouter API with Llama model (`meta-llama/llama-3.2-3b-instruct:free`)
   - Uses retry logic with exponential backoff for rate limiting (handles 429 errors)
4. Returns identified domain name

**Request**:
- `text`: User-provided text (mandatory)
- `file`: Optional image or PDF file

**Response**:
```json
{
  "domainName": "Finance"
}
```

**Error Handling**:
- Validates that text is mandatory
- Validates file types (only images and PDFs allowed)
- Handles OpenRouter API rate limiting with retry logic
- Returns appropriate error messages

#### POST `/api/domains/check-or-create`

**Purpose**: Check if domain exists or create new domain.

**Implementation** (`src/app/api/domains/check-or-create/route.ts`):
1. Accepts `domainName` in request body
2. Generates slug from domain name using `slugify` utility
3. Checks if domain exists by slug
4. If not found, creates new domain with default values:
   - `isActive: true`
   - `icon: '📋'` (default icon)
   - `description: ''` (empty description)
5. Returns domain details and existence status

**Request**:
```json
{
  "domainName": "Finance"
}
```

**Response**:
```json
{
  "exists": true,
  "domain": {
    "id": "...",
    "name": "Finance",
    "slug": "finance"
  }
}
```

### Rankings APIs

#### GET `/api/rankings/[domain]`

**Purpose**: Fetch model rankings for a specific domain.

**Implementation** (`src/app/api/rankings/[domain]/route.ts`):
1. Extracts `domain` from route parameters
2. Fetches domain by slug
3. Fetches all rankings for the domain using `getRankingsByDomain()`
4. Populates model and organization data
5. Transforms data to include organization logos
6. Returns domain info and rankings array

**Response**:
```json
{
  "domain": {
    "name": "Code Generation",
    "slug": "code-generation"
  },
  "data": [
    {
      "modelId": "...",
      "model": {
        "name": "GPT-4",
        "logo": "/logos/openai.svg",
        "provider": "OpenAI"
      },
      "rank": 1,
      "eloScore": 1700,
      "wins": 200,
      "losses": 70,
      "totalBattles": 280
    }
  ]
}
```

### Model APIs

#### GET `/api/models/[id]`

**Purpose**: Fetch detailed information about a specific model.

**Implementation** (`src/app/api/models/[id]/route.ts`):
1. Extracts `id` from route parameters
2. Fetches model by ID
3. Fetches model ranking for a specific domain (if provided)
4. Fetches battle history for the model
5. Aggregates stats across all domains
6. Returns comprehensive model data including:
   - Model details (name, description, pricing, strengths, weaknesses)
   - Ranking information
   - Battle history
   - Aggregate statistics

**Response**:
```json
{
  "id": "...",
  "name": "GPT-4",
  "description": "...",
  "pricing": {
    "inputCostPer1MTokens": 10.0,
    "outputCostPer1MTokens": 30.0
  },
  "strengths": ["Code generation", "Reasoning"],
  "weaknesses": ["Cost", "Speed"],
  "battleHistory": [...],
  "stats": {
    "totalBattles": 500,
    "wins": 350,
    "losses": 120
  }
}
```

### Arena APIs

#### GET `/api/arena/[domain]/standings`

**Purpose**: Fetch live standings for arena battles.

**Implementation** (`src/app/api/arena/[domain]/standings/route.ts`):
1. Extracts `domain` from route parameters
2. Fetches domain by slug
3. Fetches rankings for the domain
4. If no rankings exist (0 battles), returns all available models with default values
5. Transforms data to include organization logos
6. Returns standings array sorted by ELO score

**Response**:
```json
{
  "data": [
    {
      "modelId": "...",
      "model": {
        "name": "GPT-4",
        "logo": "/logos/openai.svg"
      },
      "rank": 1,
      "score": 1700,
      "battles": 280
    }
  ]
}
```

### Battle APIs

#### POST `/api/battles`

**Purpose**: Create a new battle and update model rankings.

**Implementation** (`src/app/api/battles/route.ts`):

**Step-by-step process**:

1. **Parse Request Body**:
   - `domainSlug`: Domain identifier
   - `modelAId`: First model ID
   - `modelBId`: Second model ID
   - `responseA`: Response from model A
   - `responseB`: Response from model B
   - `winner`: Battle winner ('A', 'B', or 'Tie')
   - `testCaseTitle`: Test case title
   - `evaluationId`: Optional evaluation ID

2. **Fetch Domain and Models**:
   - Validates domain exists
   - Validates both models exist
   - Extracts MongoDB ObjectIds

3. **Get or Create Evaluation**:
   - If `evaluationId` is provided and valid, uses existing evaluation
   - Otherwise, finds existing in-progress evaluation for the domain
   - If none exists, creates a new evaluation

4. **Get or Create Test Case**:
   - Finds existing test case for the domain
   - If none exists, creates a minimal test case

5. **Create Battle Document**:
   - Converts winner format ('A' → 'MODEL_A', etc.)
   - Creates battle document in MongoDB
   - Sets status to 'completed'

6. **Update Evaluation Counts**:
   - Counts total battles for the evaluation
   - Counts completed battles
   - Updates evaluation document

7. **Update Model Rankings** (Critical Step):
   - Calls `updateModelRankingsAfterBattle()` function
   - This function:
     a. Fetches current rankings for both models
     b. Calculates expected scores using ELO formula
     c. Determines actual scores based on winner
     d. Calculates new ELO scores
     e. Updates wins/losses/ties counts
     f. Updates total battles count
     g. Updates last battle timestamp
     h. Recalculates ranks for all models in the domain

8. **Return Response**:
   - Returns `battleId` and `evaluationId`

**ELO Calculation Details**:

```typescript
// Expected score calculation
function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// New ELO calculation
function calculateNewElo(currentElo: number, expectedScore: number, actualScore: number): number {
  return Math.round(currentElo + K_FACTOR * (actualScore - expectedScore));
}

// Example:
// Model A ELO: 1500, Model B ELO: 1500
// Expected A: 0.5, Expected B: 0.5
// If A wins: actualScoreA = 1.0, actualScoreB = 0.0
// New ELO A: 1500 + 32 * (1.0 - 0.5) = 1516
// New ELO B: 1500 + 32 * (0.0 - 0.5) = 1484
```

**Rank Recalculation**:
- After updating ELO scores, all models in the domain are re-sorted by ELO
- Ranks are reassigned (1, 2, 3, etc.) based on ELO score order

### Evaluation APIs

#### GET `/api/evaluations/[id]`

**Purpose**: Fetch evaluation results and statistics.

**Implementation** (`src/app/api/evaluations/[id]/route.ts`):
1. Extracts `id` from route parameters
2. Validates MongoDB ObjectId
3. Calls `getEvaluationStats()` service function
4. Calculates rankings, win/loss matrix, and other metrics
5. Returns comprehensive evaluation data including:
   - `evaluationRankings`: Only models that participated in this evaluation
   - `currentBattleRankings`: Only the 2 models from the latest battle
   - `judgeModel`: Judge model information (if LLM judge was used)

**Response**:
```json
{
  "evaluation": {
    "id": "...",
    "domainId": "...",
    "status": "completed",
    "totalBattles": 10,
    "completedBattles": 10,
    "modelsTested": 5
  },
  "rankings": [...],
  "evaluationRankings": [...],  // Only models in this evaluation
  "currentBattleRankings": [...],  // Only 2 models from latest battle
  "winLossMatrix": {...},
  "stats": {...}
}
```

#### POST `/api/battles/evaluate`

**Purpose**: Evaluate a battle using an LLM judge.

**Implementation** (`src/app/api/battles/evaluate/route.ts`):
1. Receives battle data: `question`, `modelAId`, `modelBId`, `responseA`, `responseB`, `judgeModelId`
2. Calls OpenRouter API to get judge model response
3. Parses judge response to determine winner
4. Returns winner (`MODEL_A`, `MODEL_B`, or `TIE`)

**Request Body**:
```json
{
  "question": "Test question",
  "modelAId": "...",
  "modelBId": "...",
  "responseA": "Response from model A",
  "responseB": "Response from model B",
  "judgeModelId": "openai/gpt-4"
}
```

**Response**:
```json
{
  "winner": "MODEL_A",
  "judgeResponse": "Full judge response text"
}
```

---

## Components

### Layout Components

#### Layout (`src/components/layout/Layout.tsx`)

**Purpose**: Main layout wrapper for all pages.

**Features**:
- Three-column layout: Left Sidebar, Main Content, Right Sidebar
- Responsive design (collapses on mobile)
- Supports different sidebar types: 'filter', 'leaderboard', 'domains'
- Passes user authentication state to child components

**Props**:
- `user`: Current user object
- `isAuthenticated`: Authentication status
- `showSidebar`: Whether to show sidebar
- `sidebarType`: Type of sidebar to display
- `domains`: Domain data for domain showcase sidebar
- `children`: Page content

#### LeftSidebar (`src/components/layout/LeftSidebar.tsx`)

**Purpose**: Persistent left navigation sidebar.

**Features**:
- Navigation links (Home, Rankings, Arena, About) with colorful 3D-style icons
- LangScope logo with image (`/logos/langscope.png`)
- Login/Signup buttons (when not authenticated, hidden when collapsed)
- User menu (when authenticated, hidden when collapsed)
- Auto-collapses when navigating away from home page
- Collapsible on mobile devices
- Responsive design with hamburger menu
- "Current plan" section (Free trial, Upgrade to Pro button)
- User profile section with avatar and email
- Logout button

**State Management**:
- `collapsed`: Controls sidebar collapse state (auto-collapses on non-home pages)
- `mobileMenuOpen`: Controls mobile menu visibility
- Uses `usePathname` to detect current route and auto-collapse

**Styling**:
- Light lavender background (`bg-[#F5F3FF]`)
- Collapsed width: `w-12` (48px)
- Expanded width: `w-64 sm:w-72`
- Logo visible when collapsed (centered, smaller size)
- Navigation icons use Image components for Rankings and Arena
- Active page highlighted (no background circle, just text color change)

#### Sidebar (`src/components/layout/Sidebar.tsx`)

**Purpose**: Generic sidebar component that renders different sidebar types.

**Sidebar Types**:

1. **'filter'**: Filter sidebar (not currently used)
2. **'leaderboard'**: Live leaderboard for arena battles
3. **'domains'**: Domain showcase sidebar

**Trending Domains Sidebar** (formerly "Domain Showcase"):
- Displays list of domains sorted by battle count
- Shows domain icons (emojis)
- Displays battle count and model count
- Format: "#Domain Name" with "#" prefix (homepage only)
- Format: "1,247 battles — 23 models ranked"
- Clicking a domain navigates to rankings page
- Hover animations (shadow and scale effects)
- Auto-collapses on mobile, expandable on desktop
- Dynamically calculates visible domains based on viewport height

#### Header (`src/components/layout/Header.tsx`)

**Purpose**: Top navigation bar (currently minimal, search moved to homepage).

**Features**:
- Search bar
- Action icons (notifications, user menu)

#### Footer (`src/components/layout/Footer.tsx`)

**Purpose**: Site footer with links and information.

**Features**:
- LangScope logo and tagline
- Four navigation columns: Product, Company, Resources, Legal
- Social media links (Twitter, GitHub, Discord)
- Copyright notice
- Background color matches "LLM" highlight color from homepage (`rgb(187, 196, 196)`)
- Text color: `rgb(29, 61, 60)` for readability
- Stretches to extreme left edge of viewport

### Page Components

#### HomePage (`src/components/pages/HomePage.tsx`)

**Purpose**: Main landing page with domain identification feature.

**Features**:
- Hero section with animated hero image and large search bar
- **Domain Identification**: Search bar with file upload support (images/PDFs) for domain identification
- Features section (4 feature cards)
- "How It Works" section (3 steps)
- Trending Domains sidebar (right side)
- Mobile domain showcase (top domains on mobile)

**Data Flow**:
1. **Server-Side Rendering**: Domains are fetched on the server in `src/app/page.tsx` for fast initial load
2. Domains are passed as `initialDomains` prop to HomePage component
3. Only fetches fresh data if a battle was completed (uses sessionStorage flag)
4. Otherwise uses server-rendered initial data for instant loading
5. Transforms MongoDB data to Domain type
6. Sorts domains by battle count (descending)
7. Adds "#" prefix to domain names for homepage display only
8. Passes domains to Layout for sidebar display as "Trending Domains"

**State**:
- `domains`: Array of domain objects (initialized from server-side data)
- `searchQuery`: Current search input value
- `selectedFile`: Uploaded file (image or PDF) for domain identification
- `isIdentifying`: Loading state for domain identification
- `identifiedDomain`: Identified domain from LLM
- `showModal`: Controls domain identification modal visibility
- `showJudgeModal`: Controls judge selection modal visibility

**Domain Identification Flow**:
1. User enters text (mandatory) and optionally uploads an image/PDF
2. On "Search Domain" button click, calls `/api/identify-domain`:
   - If only text: First checks database for exact case-insensitive match
   - If match found: Returns domain immediately
   - If no match or file provided: Calls LLM (Llama via OpenRouter) for identification
   - For images: Uses OCR (tesseract.js) to extract text first
   - For PDFs: Extracts text content
3. After identification, calls `/api/domains/check-or-create` to ensure domain exists
4. Shows `DomainIdentificationModal` with identified domain
5. User can retry, view rankings, or start battle from modal

**Search Button Styling**:
- Gradient background: Purple → Blue → Teal (`from-purple-500 via-blue-500 to-teal-400`)
- White text
- Pill shape (`rounded-[50px]`)
- Shadow and hover effects

**Performance Optimization**:
- Server-side data fetching eliminates client-side API delay
- Domains are available immediately when page renders
- Only refreshes data when battle is completed (not on every navigation)
- Trending Domains sidebar appears instantly without loading delay

#### RankingsPage (`src/components/pages/RankingsPage.tsx`)

**Purpose**: Displays model rankings for a specific domain.

**Features**:
- Domain header with name and description
- Rankings table with sortable columns
- Model details modal on row click
- **No filters sidebar**: Filters sidebar has been removed
- "Start Battle" button with gradient styling
- Compare models functionality

**Data Flow**:
1. Extracts `domainSlug` from URL parameters
2. Fetches domain and rankings from `/api/rankings/[domain]`
3. Validates response structure
4. Displays rankings in table format
5. Opens model details modal on row click

**State**:
- `domain`: Current domain object
- `rankings`: Array of model rankings
- `loading`: Loading state
- `error`: Error message
- `selectedModelId`: ID of model for details modal
- `compareMode`: Whether compare mode is active
- `selectedModels`: Array of selected model IDs for comparison
- `showJudgeModal`: Controls judge selection modal visibility

**Start Battle Button**:
- Gradient background: Blue → Purple → Pink (`from-blue-500 via-purple-500 to-pink-500`)
- White text
- Pill shape (`rounded-[50px]`)
- Checks authentication before starting battle
- Redirects to login if not authenticated

#### ArenaBattlePage (`src/components/pages/ArenaBattlePage.tsx`)

**Purpose**: Interactive arena battle interface with support for both manual voting and LLM judge evaluation.

**Features**:
- Battle counter (Battle X of Y)
- Two model comparison
- Vote selection (Model A, Model B, Tie) - Manual mode
- LLM Judge mode - Automatic evaluation using another LLM
- Test case context display
- Live leaderboard sidebar
- Submit & Next button
- Progress tracking for LLM evaluations

**Data Flow**:

1. **Initial Load**:
   - Fetches standings from `/api/arena/[domain]/standings`
   - Selects two random models for first battle
   - Sets test case context
   - Determines evaluation mode (manual or LLM judge)

2. **Manual Battle Submission** (`handleSubmit`):
   - Validates vote selection
   - Calls `/api/battles` POST endpoint with:
     - Domain slug
     - Model IDs
     - Responses
     - Winner selection
     - Test case title
     - Evaluation ID (if exists)
   - Updates evaluation ID from response
   - Updates local standings state (simulated)
   - Selects new models for next battle
   - Advances battle index
   - Redirects to results page after all battles

3. **LLM Judge Evaluation** (`startLLMEvaluation`):
   - Selects two models at the start (same models for all questions)
   - For each question:
     - Generates responses from both models via `/api/generate`
     - Evaluates battle using `/api/battles/evaluate` with judge model
     - Creates battle with judge-determined winner
     - Updates progress (X of Y battles completed)
   - Uses `llmEvaluationStartedRef` to prevent duplicate evaluations
   - Includes 60-second timeouts for API calls
   - Redirects to results page with `judgeModelId` query parameter
   - Ensures same two models are used throughout the evaluation

4. **Model Selection**:
   - On battle index change, selects two new random models
   - Ensures models are different
   - In LLM judge mode, models are selected once at the start

**State**:
- `battleIndex`: Current battle number (1-10)
- `totalBattles`: Total battles in session (10)
- `selectedVote`: Selected winner ('A', 'B', or 'Tie')
- `submitting`: Submission loading state
- `responseA`, `responseB`: Model responses
- `evaluationId`: Current evaluation ID
- `judgeModelId`: Judge model ID for LLM evaluations
- `isLLMEvaluation`: Whether LLM judge mode is active
- `llmEvaluationProgress`: Progress tracking for LLM evaluation
- `standings`: Live standings array
- `currentModelA`, `currentModelB`: Current battle models
- `testCaseContext`: Current test case description

#### ResultsDashboardPage (`src/components/pages/ResultsDashboardPage.tsx`)

**Purpose**: Displays evaluation results and statistics with support for evaluation-specific rankings and judge model display.

**Features**:
- Evaluation summary (battles, models tested)
- Judge model information (if LLM judge was used)
- Overall rankings (all models in domain)
- Evaluation rankings (only models tested in this evaluation)
- Current battle standings (only the 2 models from latest battle)
- Model performance metrics
- Win/loss matrix visualization
- Insights section

**Data Flow**:
1. Extracts `evaluationId` and `judgeModelId` from URL parameters
2. Handles Next.js 15 async params
3. Fetches evaluation data from `/api/evaluations/[id]`
4. If `judgeModelId` is present, fetches judge model details from `/api/models`
5. If evaluation ID is invalid/demo, falls back to domain-based rankings
6. Transforms and displays data with three ranking views:
   - **Overall Rankings**: All models in the domain
   - **Evaluation Rankings**: Only models that participated in this evaluation
   - **Current Battle Standings**: Only the 2 models from the latest battle

**State**:
- `results`: Evaluation results object containing:
  - `rankings`: Overall domain rankings
  - `evaluationRankings`: Models tested in this evaluation
  - `currentBattleRankings`: Only the 2 models from current battle
  - `judgeModel`: Judge model info (if LLM judge was used)
  - `totalBattles`, `modelsTested`: Evaluation statistics
- `insights`: Array of insight objects
- `loading`: Loading state
- `error`: Error message

### UI Components

#### Button (`src/components/ui/Button.tsx`)

**Purpose**: Reusable button component.

**Variants**:
- `primary`: Primary action button (black background)
- `secondary`: Secondary action button (gray background)
- `outline`: Outlined button
- `ghost`: Minimal button with hover effects

**Props**:
- `variant`: Button variant
- `size`: Button size (sm, md, lg)
- `loading`: Shows loading spinner
- `disabled`: Disables button
- `onClick`: Click handler
- `children`: Button content

#### Card (`src/components/ui/Card.tsx`)

**Purpose**: Reusable card component.

**Sub-components**:
- `CardHeader`: Card header section
- `CardTitle`: Card title
- `CardDescription`: Card description
- `CardContent`: Card main content
- `CardFooter`: Card footer section

#### Modal (`src/components/ui/Modal.tsx`)

**Purpose**: Reusable modal/dialog component.

**Features**:
- Backdrop overlay
- Close button
- Click outside to close
- Responsive sizing

**Props**:
- `isOpen`: Controls modal visibility
- `onClose`: Close handler
- `title`: Modal title
- `children`: Modal content

#### DomainIdentificationModal (`src/components/ui/DomainIdentificationModal.tsx`)

**Purpose**: Displays identified domain with action options.

**Features**:
- **Futuristic Design**: Soft purple/blue gradient background with animated border glow
- Displays identified domain name
- **Action Cards**: Three card-based buttons (Rankings, Battle, Retry)
- **Authentication Check**: "Start Battle" checks if user is logged in
- **Retry Functionality**: Allows retrying domain identification without closing modal
- **Responsive**: Fits in viewport without scrolling, mobile-friendly
- Close button (X) at top right

**Props**:
- `isOpen`: Controls modal visibility
- `onClose`: Close handler
- `domainName`: Identified domain name
- `domainExists`: Whether domain exists in database
- `domainSlug`: Domain slug for navigation
- `onRetry`: Retry callback function
- `onStartBattle`: Start battle callback
- `isRetrying`: Loading state for retry
- `onDomainUpdate`: Callback when domain is updated

**Styling**:
- Soft gradient background (`from-purple-50/80 via-blue-50/80 to-purple-50/80`)
- Animated shimmer border effect
- Card-based action buttons with hover effects
- White/purple gradient modal background
- Dark teal/purple text colors

#### SearchBar (`src/components/ui/SearchBar.tsx`)

**Purpose**: Search input with file upload support for domain identification.

**Features**:
- Controlled input value
- Placeholder text
- Size variants (sm, md, lg)
- Search icon
- **File upload support**: Allows image and PDF file uploads
- **Enter key support**: Triggers search on Enter key press
- **No automatic search**: Only searches when button is clicked or Enter is pressed

**File Upload**:
- Accepts: `image/*` and `.pdf` files
- Client-side validation for file types
- File preview with remove option
- File input button with upload icon

**Implementation**:
- Uses controlled input for text value
- `onSearch` callback triggered by Enter key or explicit button click
- File upload handled via `onFileChange` callback
- No automatic debounced search on text input

#### Avatar (`src/components/ui/Avatar.tsx`)

**Purpose**: Displays user/model avatars.

**Features**:
- Image support (with fallback)
- Initials fallback
- Size variants
- Rounded styling

#### DomainCard (`src/components/domain/DomainCard.tsx`)

**Purpose**: Displays domain information in card format.

**Features**:
- Icon and domain name in same line (horizontal layout)
- **No background on icons**: Icons display without background for cleaner look
- Domain description with line clamping
- Battle and model count statistics
- **"Explore Rankings" button**: Gradient button (blue to turquoise) with white text
- Consistent card heights in grid layout
- Hover effects (shadow, border color change)
- Featured badge (optional)

**Layout**:
- Icon and title aligned horizontally with gap
- Description below with proper spacing
- Stats and button at bottom
- Uses flexbox for consistent heights (`h-full flex flex-col`)
- Button positioned at bottom with `mt-auto`

**Explore Rankings Button Styling**:
- Gradient background: Blue → Turquoise (`from-blue-500 to-cyan-400`)
- White text
- Pill shape (`rounded-[50px]`)
- No border
- Hover opacity effect

#### RankingsTable (`src/components/rankings/RankingsTable.tsx`)

**Purpose**: Displays rankings in table format.

**Features**:
- Sortable columns (Rank, Model, Score, Win Rate)
- Model logos from organization
- Click row to open model details
- Responsive design
- **"Details" button only**: "Test" button has been removed

**Columns**:
- Rank: Model rank number
- Model: Model name with logo
- Score: ELO score
- Win Rate: Win percentage
- Battles: Total battles
- Actions: "Details" button (no "Test" button)

#### ModelDetailsModal (`src/components/model/ModelDetailsModal.tsx`)

**Purpose**: Modal displaying detailed model information.

**Features**:
- Tabbed interface (Overview, Performance, Battle History)
- Model information (description, pricing, strengths, weaknesses)
- Performance metrics
- Battle history timeline
- Organization logo

**Tabs**:
1. **Overview**: Model details, pricing, strengths, weaknesses
2. **Performance**: Performance metrics and charts
3. **Battle History**: List of past battles

**Data Flow**:
1. Receives `modelId` and `domainSlug` as props
2. Fetches model details from `/api/models/[id]`
3. Uses `useCallback` to prevent infinite re-renders
4. Resets state when modal closes

---

## Services

### Domain Service (`src/lib/db/services/domainService.ts`)

**Functions**:

1. **`getDomains()`**: Fetch all active domains with statistics
   - Fetches domains where `isActive: true`
   - For each domain, calculates:
     - `modelCount`: Count of unique models with rankings in this domain
     - `battleCount`: Total number of battles in this domain
   - Returns domains sorted by creation date (newest first)

2. **`getDomainBySlug(slug)`**: Fetch domain by slug
   - Returns single domain matching slug
   - Only returns active domains

3. **`getDomainsWithStats()`**: Fetch domains with aggregated statistics (legacy, use `getDomains()` instead)

### Model Service (`src/lib/db/services/modelService.ts`)

**Functions**:

1. **`getModels()`**: Fetch all models (with optional filters)
2. **`getModelById(id)`**: Fetch model by ID
3. **`getModelBySlug(slug)`**: Fetch model by slug

### Ranking Service (`src/lib/db/services/rankingService.ts`)

**Functions**:

1. **`getRankingsByDomain(domainId)`**: Fetch all rankings for a domain
   - Populates model and organization data
   - Sorts by rank

2. **`getModelRanking(domainId, modelId)`**: Fetch ranking for a specific model in a domain
   - Returns null if no ranking exists
   - Populates model and organization data

3. **`updateRanking(domainId, modelId, data)`**: Update or create ranking
   - Uses `upsert: true` to create if doesn't exist
   - Updates ELO score, wins, losses, ties, total battles, last battle timestamp

### Battle Service (`src/lib/db/services/battleService.ts`)

**Functions**:

1. **`getBattlesByEvaluation(evaluationId)`**: Fetch all battles for an evaluation
   - Populates model, test case, and domain data
   - Sorts by creation date (newest first)

2. **`getBattleById(id)`**: Fetch a single battle by ID
   - Populates all related data

3. **`getBattleHistory(modelId, domainId?)`**: Fetch battle history for a model
   - Filters battles where model is either modelA or modelB
   - Optionally filters by domain
   - Limits to 50 most recent battles

4. **`createBattle(data)`**: Create a new battle document

### Evaluation Service (`src/lib/db/services/evaluationService.ts`)

**Functions**:

1. **`getEvaluationById(id)`**: Fetch evaluation by ID
   - Validates MongoDB ObjectId
   - Returns null for invalid IDs

2. **`getEvaluationStats(id)`**: Calculate comprehensive evaluation statistics
   - Fetches evaluation and all associated battles
   - Calculates rankings based on battle results
   - Builds win/loss matrix
   - Calculates aggregate statistics
   - **Filters evaluation rankings** to only include models that participated in battles
   - **Identifies current battle** and creates `currentBattleRankings` with only those 2 models
   - Handles both populated and non-populated model references
   - Creates placeholder rankings for models that participated but don't have `ModelRanking` entries

3. **`createEvaluation(data)`**: Create a new evaluation document

**`getEvaluationStats()` Implementation**:
- Fetches evaluation and battles
- Extracts unique model IDs from battles (handles both populated and non-populated cases)
- Groups battles by model pairs
- Calculates wins/losses/ties for each model
- Builds win/loss matrix (model vs model)
- Filters `transformedRankings` to create `evaluationRankings` (only models in battles)
- Identifies latest battle and extracts its 2 model IDs
- Creates `currentBattleRankings` with only those 2 models
- For models without existing `ModelRanking` entries, fetches model details and creates placeholder rankings
- Returns comprehensive stats object with:
  - `rankings`: All domain rankings
  - `evaluationRankings`: Only models tested in this evaluation
  - `currentBattleRankings`: Only the 2 models from latest battle

---

## Utilities

### Model Icons (`src/lib/utils/modelIcons.ts`)

**Purpose**: Maps organization names to logo paths.

**Function**: `getOrganizationLogo(organizationName: string): string`

**Implementation**:
- Maps organization names to logo file paths in `/public/logos/`
- Returns path like `/logos/openai.svg`
- Falls back to default logo if organization not found
- Handles various organization name formats (e.g., "x-ai" for X.AI)

**Supported Organizations**:
- OpenAI → `/logos/openai.svg`
- Anthropic → `/logos/anthropic.svg`
- Google → `/logos/google.svg`
- Meta → `/logos/meta.svg`
- x-ai / X.AI → `/logos/x-ai.svg`
- And many more...

### General Utils (`src/lib/utils.ts`)

**Purpose**: Collection of utility functions.

**Key Functions**:

1. **`cn(...classes)`**: Merges Tailwind CSS classes
   - Uses `clsx` and `tailwind-merge`
   - Handles conditional classes

2. **`formatNumber(num)`**: Formats numbers with commas
   - Example: 1000 → "1,000"

3. **`formatCurrency(amount, currency)`**: Formats currency
   - Example: 10.5 → "$10.50"

4. **`formatDate(date)`**: Formats dates
   - Example: "Jan 1, 2024"

5. **`formatRelativeTime(date)`**: Formats relative time
   - Example: "2 hours ago"

6. **`truncate(str, length)`**: Truncates strings
   - Adds ellipsis if truncated

7. **`debounce(func, delay)`**: Debounces function calls
   - Delays execution until no calls for specified delay

8. **`throttle(func, delay)`**: Throttles function calls
   - Limits execution to once per delay period

### API Client (`src/lib/api.ts`)

**Purpose**: Centralized API client with error handling.

**Features**:
- Base URL configuration
- Request/response interceptors
- Error handling
- Type-safe responses

**Methods**:
- `get<T>(url, config?)`: GET request
- `post<T>(url, data, config?)`: POST request
- `put<T>(url, data, config?)`: PUT request
- `delete<T>(url, config?)`: DELETE request

---

## Authentication

### Supabase Auth Integration

**Purpose**: Handles user authentication using Supabase Auth service.

**Implementation** (`src/contexts/AuthContext.tsx`):
- Uses Supabase client (`@supabase/supabase-js`) for authentication
- Supports email/password and OAuth (Google, GitHub)
- Manages user session state
- Converts Supabase user objects to application `User` type

**Key Functions**:
- `login(email, password)`: Email/password login
- `signup(data)`: User registration with email/password
- `logout()`: Sign out current user
- `signInWithGoogle()`: OAuth login with Google
- `signInWithGitHub()`: OAuth login with GitHub
- `refreshUser()`: Refresh user data from session

**Supabase Client Files**:
- `src/lib/supabase/client.ts`: Browser-side Supabase client
- `src/lib/supabase/server.ts`: Server-side Supabase client (for API routes)
- `src/lib/supabase/middleware.ts`: Middleware helper for session management

**Middleware Integration** (`src/middleware.ts`):
- Protects routes that require authentication
- Updates Supabase session on each request
- Redirects unauthenticated users to `/login`
- **Protected Routes** (require login):
  - `/arena/*` - Arena battle pages
  - `/results/*` - Results dashboard pages
  - `/compare` - Model comparison page
  - `POST /api/battles` - Creating battles
  - `POST /api/battles/evaluate` - Evaluating battles
  - `POST /api/generate` - Generating responses
- **Public Routes** (no login required):
  - `/` - Home page
  - `/about` - About page
  - `/login` - Login page
  - `/signup` - Signup page
  - `/rankings` - Rankings page (public)
  - `/rankings/*` - Ranking detail pages (public)
  - `/models` - Models page (public)
  - `GET /api/*` - All GET API routes (public)

**OAuth Callback** (`src/app/auth/callback/route.ts`):
- Handles OAuth redirects from providers
- Exchanges OAuth code for Supabase session
- Redirects to home page after successful authentication

**Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (public key)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only, optional)

**Features**:
- ✅ Email/password authentication
- ✅ OAuth (Google, GitHub)
- ✅ Session management
- ✅ Protected routes
- ✅ User metadata (name, role, avatar)
- ✅ Graceful handling when Supabase is not configured

**Migration Notes**:
- NextAuth has been completely removed
- AuthContext API remains the same for backward compatibility
- Users are stored in Supabase, not MongoDB
- Sessions are managed by Supabase

## Configuration

### Next.js Config (`next.config.js`)

**Key Settings**:
- `reactStrictMode: true`: Enables React strict mode
- `output: 'standalone'`: Enables Next.js standalone output mode for optimized deployments (Azure)
  - Bundles only production dependencies
  - Creates minimal `server.js` for self-hosting
  - Significantly reduces deployment size and startup time
- Image optimization: Allows images from all HTTPS domains
- Environment variables: `NEXT_PUBLIC_*` variables are automatically exposed to the browser

### TypeScript Config (`tsconfig.json`)

**Key Settings**:
- Path aliases: `@/*` maps to `src/*`
- Strict type checking enabled
- ES2020 target
- Module resolution: bundler

### Tailwind Config (`tailwind.config.ts`)

**Key Settings**:
- Custom color palette:
  - `black: '#1c1b1b'`
  - `dark-gray: '#474545'`
  - `light-gray: '#f3f3f3'`
- Custom breakpoints (including `xs: 475px`)
- Source Sans 3 font family

### ESLint Config (`eslint.config.mjs`)

**Key Rules**:
- `@typescript-eslint/no-explicit-any: off`: Allows `any` type
- `@typescript-eslint/no-unused-vars: warn`: Warns on unused variables
- `react-hooks/exhaustive-deps: off`: Disables exhaustive deps warning

---

## Data Flow

### Battle Submission Flow

1. **User Action**: User clicks "Submit & Next" in ArenaBattlePage
2. **Frontend**: `handleSubmit()` function executes
3. **API Call**: POST request to `/api/battles` with battle data
4. **Backend Processing**:
   a. Validates domain and models
   b. Gets/creates evaluation
   c. Gets/creates test case
   d. Creates battle document
   e. Updates evaluation counts
   f. **Updates model rankings** (ELO, wins, losses, ties)
   g. **Recalculates ranks** for all models
5. **Response**: Returns `battleId` and `evaluationId`
6. **Frontend Update**: Updates local state, selects new models, advances battle index

### Rankings Display Flow

1. **Page Load**: RankingsPage component mounts
2. **Data Fetch**: Calls `/api/rankings/[domain]`
3. **Backend Processing**:
   a. Fetches domain by slug
   b. Fetches all rankings for domain
   c. Populates model and organization data
   d. Transforms data (adds logos, formats)
4. **Response**: Returns domain info and rankings array
5. **Display**: RankingsTable renders rankings with logos and metrics

### Model Details Flow

1. **User Action**: User clicks on model in rankings table
2. **Modal Open**: ModelDetailsModal opens with `modelId` and `domainSlug`
3. **Data Fetch**: Calls `/api/models/[id]` with optional domain
4. **Backend Processing**:
   a. Fetches model by ID
   b. Fetches ranking for domain (if provided)
   c. Fetches battle history
   d. Aggregates stats across domains
5. **Response**: Returns comprehensive model data
6. **Display**: Modal shows tabs with model information

### LLM Judge Evaluation Flow

1. **User Action**: User selects "LLM Judge" mode in ArenaBattlePage
2. **Model Selection**: Two models are selected at the start (same models for all questions)
3. **Judge Selection**: User selects a judge model from available models
4. **For Each Question**:
   a. **Generate Responses**: 
      - Calls `/api/generate` for both models (with 60s timeout)
      - Stores responses in state
   b. **Evaluate Battle**:
      - Calls `/api/battles/evaluate` with question, responses, and judge model
      - Judge model evaluates responses via OpenRouter API
      - Returns winner (`MODEL_A`, `MODEL_B`, or `TIE`)
   c. **Create Battle**:
      - Calls `/api/battles` POST with judge-determined winner
      - Updates evaluation ID from response
      - Updates progress counter
5. **Completion**: After all questions are evaluated
   a. Redirects to `/results/[evaluationId]?judgeModelId=[judgeId]`
   b. Results page displays judge model information
   c. Shows evaluation rankings and current battle standings
6. **Error Handling**: 
   - Timeouts (60s) prevent hanging
   - Errors are logged and progress continues
   - Failed battles are still saved with error status

---

## Environment Variables

### Required Variables

- `DATABASE_URL`: MongoDB connection string
  - Format: `mongodb://localhost:27017/langscope` (local)
  - Format: `mongodb+srv://user:pass@cluster.mongodb.net/langscope` (Atlas)
  - Format: `mongodb+srv://user:pass@cluster.global.mongocluster.cosmos.azure.com/langscope?tls=true&...` (Azure Cosmos DB)
  - **Note**: The connection string should include the database name (`/langscope`). If missing, the code automatically adds it.
  - **Azure Cosmos DB**: Connection strings from Azure Portal often don't include the database name. The code automatically adds `/langscope` if missing.

### Authentication Variables (Supabase)

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
  - Format: `https://your-project.supabase.co`
  - Found in Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (public key)
  - Found in Supabase Dashboard → Settings → API
  - Safe to expose in client-side code
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (optional, server-side only)
  - Found in Supabase Dashboard → Settings → API
  - **Never expose in client-side code** - only use in API routes or server components

**Note**: If Supabase variables are not set, authentication features will be disabled gracefully. The app will work without authentication, but protected routes will redirect to login.

### Optional Variables

- `NEXT_PUBLIC_API_URL`: API base URL (default: `http://localhost:3001`)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (default: `ws://localhost:3001`)
- `NODE_ENV`: Environment (development, production)
- `OPENROUTER_API_KEY`: API key for OpenRouter (for LLM judge evaluations)

---

## Deployment

### Azure App Service Deployment

The application is configured for deployment to Azure App Service using GitHub Actions with CI/CD pipeline integration.

**CI Pipeline** (`.github/workflows/ci.yml`):
- Runs on pushes to `main` and `develop` branches
- Runs on pull requests to `main` and `develop` branches
- Executes three jobs in sequence:
  1. **Lint**: ESLint code quality checks
  2. **Type Check**: TypeScript type validation
  3. **Build**: Next.js application build
- **Must complete successfully before deployment**

**Deployment Workflow** (`.github/workflows/deploy-azure.yml`):
- **Triggers**: Automatically triggered after CI pipeline completes successfully on `main` branch
- **Manual Trigger**: Supports `workflow_dispatch` for manual deployments (use with caution)
- **CI Verification**: Includes `check-ci-status` job that verifies CI completed successfully
- **Build Process**:
  - Builds Next.js application in standalone mode
  - Creates optimized deployment package
  - Deploys to Azure App Service using publish profile
- **Code Checkout**: Properly checks out code from the triggering CI workflow commit

**Key Features**:
- **Standalone Build**: Uses Next.js `output: 'standalone'` for minimal deployment size
- **Optimized Package**: Only includes production dependencies and necessary files
- **Automatic Deployment**: GitHub Actions handles build and deployment automatically

**Required GitHub Secrets**:
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Azure App Service publish profile (download from Azure Portal)
- `DATABASE_URL`: MongoDB connection string (with `/langscope` database name)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (optional)
- `NEXT_PUBLIC_API_URL`: API base URL (optional, defaults to Azure App Service URL)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (optional, defaults to Azure App Service URL)

**Azure App Service Configuration**:
- **Runtime Stack**: Node.js 24 LTS
- **Startup Command**: `node server.js` (automatically set by standalone build)
- **Port**: Azure sets `PORT` environment variable (default: 8080)
- **Application Settings**: All environment variables must be set in Azure Portal

**Deployment Process**:
1. Code is pushed to `main` branch
2. **CI Pipeline runs first** (`.github/workflows/ci.yml`):
   - Linting with ESLint
   - Type checking with TypeScript
   - Building the Next.js application
3. **If CI passes**, deployment workflow (`.github/workflows/deploy-azure.yml`) automatically triggers
4. Deployment workflow verifies CI status
5. Application is built in standalone mode
6. Deployment package is created with:
   - `.next/standalone/*` (bundled server and dependencies)
   - `.next/static/*` (static assets)
   - `public/*` (public assets)
   - `package.json` (minimal, runs `node server.js`)
7. Package is deployed to Azure App Service
8. Azure starts the application using `node server.js`

**CI/CD Safety**:
- Deployment only occurs if CI pipeline passes all checks
- Prevents deployment of broken code
- Ensures code quality before production deployment
- Manual deployment via `workflow_dispatch` is available but shows a warning

**Database Connection**:
- Azure Cosmos DB connection strings are automatically fixed to include `/langscope` database name
- Connection string format: `mongodb+srv://user:pass@cluster.global.mongocluster.cosmos.azure.com/langscope?tls=true&...`

**Troubleshooting**:
- If deployment fails, check GitHub Actions logs
- If app doesn't start, check Azure App Service logs (Log stream)
- Ensure all environment variables are set in Azure Portal
- Verify `DATABASE_URL` includes database name or let the code add it automatically

---

## Error Handling

### API Error Handling

- All API routes use try-catch blocks
- Returns appropriate HTTP status codes (400, 404, 500)
- Includes error messages in response
- Logs errors to console (server-side)

### Frontend Error Handling

- Components use error state for failed API calls
- Displays user-friendly error messages
- Graceful fallbacks (e.g., default values for missing data)

### Database Error Handling

- Connection errors are caught and logged
- Invalid ObjectIds are validated before queries
- Missing data returns null/empty arrays instead of throwing

---

## Performance Optimizations

1. **Connection Pooling**: MongoDB connection is cached and reused
2. **Database Indexes**: Unique and compound indexes for fast queries
3. **Manual Search**: Search only triggers on button click or Enter key (no automatic debouncing)
4. **Memoization**: `useCallback` used for stable function references
5. **Lazy Loading**: Components loaded on demand
6. **Image Optimization**: Next.js Image component for optimized images

---

## Security Considerations

1. **Authentication**: Supabase Auth handles password hashing and session management
2. **Input Validation**: API routes validate input data
3. **ObjectId Validation**: MongoDB ObjectIds are validated before queries
4. **CORS**: Configured for allowed origins
5. **Environment Variables**: Sensitive data stored in environment variables
6. **Route Protection**: Middleware protects authenticated routes
7. **OAuth Security**: OAuth flows handled securely by Supabase
8. **API Key Protection**: OpenRouter API key stored server-side only

---

## Recent Updates

### Performance Optimizations
- ✅ **Server-Side Domain Fetching**: Homepage now fetches domains on the server for instant loading
- ✅ **Trending Domains**: Renamed "Domain Showcase" to "Trending Domains" with "#" prefix on homepage
- ✅ **Optimized Card Heights**: All domain cards now have consistent heights in grid layout
- ✅ **Scrollbar Styling**: Custom scrollbar colors to match theme (no black lines)

### UI/UX Improvements
- ✅ **Left Sidebar**: Auto-collapses when navigating away from home, hidden user section when collapsed
- ✅ **Domain Cards**: Icon and name in same line, removed unnecessary spacing, consistent card heights
- ✅ **Logo Updates**: Using image files (`langscope.png`, `ranking.png`, `battle.png`) instead of SVG components
- ✅ **Footer Styling**: Background matches homepage highlight color, stretches to extreme left
- ✅ **Button Styling**: Changed from black to light purple (`#E8E3FF`) with dark gray text
- ✅ **About Page**: Removed Technology section

### LLM Judge Evaluation
- ✅ Automatic battle evaluation using another LLM as judge
- ✅ Support for judge model selection
- ✅ Progress tracking during LLM evaluations
- ✅ Judge model information displayed on results page
- ✅ Timeout handling for API calls (60 seconds)

### Evaluation Rankings
- ✅ **Evaluation Rankings**: Shows only models tested in a specific evaluation
- ✅ **Current Battle Standings**: Shows only the 2 models from the latest battle
- ✅ Improved model filtering to ensure accurate rankings
- ✅ Support for models without existing `ModelRanking` entries

### Authentication Migration
- ✅ Migrated from custom token-based auth to Supabase Auth
- ✅ Email/password authentication
- ✅ OAuth support (Google, GitHub)
- ✅ Session management via middleware
- ✅ Protected routes
- ✅ Graceful degradation when Supabase is not configured

### Model Icons
- ✅ Added support for x-ai/X.AI organization logos
- ✅ Improved organization name matching

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live standings
2. **Advanced Filtering**: More sophisticated search and filter options
3. **Export Features**: Export rankings and battle data
4. **Analytics Dashboard**: More detailed analytics and visualizations
5. **Additional OAuth Providers**: More social login options
6. **Vector Search**: Leverage Azure Cosmos DB vector search capabilities

---

## Conclusion

This documentation provides a comprehensive overview of the Langscope codebase. Each component, API route, and service is designed to work together to provide a seamless LLM evaluation experience. The system uses MongoDB for data persistence, Next.js for both frontend and backend, and implements an ELO rating system for fair model rankings.

For questions or contributions, please refer to the main README.md file.

