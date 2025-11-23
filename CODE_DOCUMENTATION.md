# Langscope - Complete Code Documentation

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

**Langscope** is a comprehensive LLM (Large Language Model) evaluation platform that allows users to:
- Compare and rank different LLM models across various domains
- Conduct head-to-head battles between models
- View detailed analytics and battle history
- Track model performance using ELO rating system

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB with Mongoose ODM
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
├── scripts/                     # Utility scripts (seed, etc.)
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

**Code Explanation**:
```typescript
// Global cache to store connection in development (Next.js hot reload)
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Function to connect to MongoDB
async function connectDB(): Promise<typeof mongoose> {
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

**Purpose**: Represents application users.

**Fields**:
- `email`: User email (unique)
- `passwordHash`: Hashed password
- `name`: User name
- `role`: User role (user, admin, judge)
- `createdAt`, `updatedAt`: Timestamps

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
5. Returns comprehensive evaluation data

**Response**:
```json
{
  "evaluation": {
    "id": "...",
    "domainId": "...",
    "status": "completed",
    "totalBattles": 10,
    "completedBattles": 10
  },
  "rankings": [...],
  "winLossMatrix": {...},
  "stats": {...}
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
- Navigation links (Home, Rankings, Arena, Compare, About)
- Login/Signup buttons (when not authenticated)
- User menu (when authenticated)
- Collapsible on mobile devices
- Responsive design with hamburger menu

**State Management**:
- `isCollapsed`: Controls sidebar collapse state
- `isMobileMenuOpen`: Controls mobile menu visibility

#### Sidebar (`src/components/layout/Sidebar.tsx`)

**Purpose**: Generic sidebar component that renders different sidebar types.

**Sidebar Types**:

1. **'filter'**: Filter sidebar (not currently used)
2. **'leaderboard'**: Live leaderboard for arena battles
3. **'domains'**: Domain showcase sidebar

**Domain Showcase Sidebar**:
- Displays list of domains
- Shows domain icons (emojis)
- Displays battle count and model count
- Format: "1,247 battles — 23 models ranked"
- Clicking a domain navigates to rankings page
- Hover animations (shadow and scale effects)

#### Header (`src/components/layout/Header.tsx`)

**Purpose**: Top navigation bar (currently minimal, search moved to homepage).

**Features**:
- Search bar
- Action icons (notifications, user menu)

#### Footer (`src/components/layout/Footer.tsx`)

**Purpose**: Site footer with links and information.

### Page Components

#### HomePage (`src/components/pages/HomePage.tsx`)

**Purpose**: Main landing page.

**Features**:
- Hero section with large search bar
- Features section (4 feature cards)
- "How It Works" section (3 steps)
- Domain showcase in right sidebar

**Data Flow**:
1. `useEffect` fetches domains on mount
2. Calls `/api/domains` endpoint
3. Transforms MongoDB data to Domain type
4. Sorts domains by battle count (descending)
5. Passes domains to Layout for sidebar display

**State**:
- `domains`: Array of domain objects
- `searchQuery`: Current search input value

**Search Functionality**:
- Search bar updates `searchQuery` state
- `handleSearch` function processes search (currently placeholder)
- Domain showcase is not affected by search (always shows all domains)

#### RankingsPage (`src/components/pages/RankingsPage.tsx`)

**Purpose**: Displays model rankings for a specific domain.

**Features**:
- Domain header with name and description
- Rankings table with sortable columns
- Model details modal on row click
- Live standings updates

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

#### ArenaBattlePage (`src/components/pages/ArenaBattlePage.tsx`)

**Purpose**: Interactive arena battle interface.

**Features**:
- Battle counter (Battle X of Y)
- Two model comparison
- Vote selection (Model A, Model B, Tie)
- Test case context display
- Live leaderboard sidebar
- Submit & Next button

**Data Flow**:

1. **Initial Load**:
   - Fetches standings from `/api/arena/[domain]/standings`
   - Selects two random models for first battle
   - Sets test case context

2. **Battle Submission** (`handleSubmit`):
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

3. **Model Selection**:
   - On battle index change, selects two new random models
   - Ensures models are different

**State**:
- `battleIndex`: Current battle number (1-10)
- `totalBattles`: Total battles in session (10)
- `selectedVote`: Selected winner ('A', 'B', or 'Tie')
- `submitting`: Submission loading state
- `responseA`, `responseB`: Model responses (currently placeholder)
- `evaluationId`: Current evaluation ID
- `standings`: Live standings array
- `currentModelA`, `currentModelB`: Current battle models
- `testCaseContext`: Current test case description

#### ResultsDashboardPage (`src/components/pages/ResultsDashboardPage.tsx`)

**Purpose**: Displays evaluation results and statistics.

**Features**:
- Evaluation summary (battles, models tested)
- Model performance metrics
- Rankings table
- Win/loss matrix visualization
- Insights section

**Data Flow**:
1. Extracts `evaluationId` from URL parameters
2. Handles Next.js 15 async params
3. Fetches evaluation data from `/api/evaluations/[id]`
4. If evaluation ID is invalid/demo, falls back to domain-based rankings
5. Transforms and displays data

**State**:
- `results`: Evaluation results object
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

#### SearchBar (`src/components/ui/SearchBar.tsx`)

**Purpose**: Search input with debouncing.

**Features**:
- Debounced search (500ms delay)
- Controlled input value
- Placeholder text
- Size variants (sm, md, lg)
- Search icon

**Implementation**:
- Uses `useCallback` and `useRef` for debouncing
- Calls `onChange` immediately for controlled value
- Calls `onSearch` after debounce delay

#### Avatar (`src/components/ui/Avatar.tsx`)

**Purpose**: Displays user/model avatars.

**Features**:
- Image support (with fallback)
- Initials fallback
- Size variants
- Rounded styling

#### RankingsTable (`src/components/rankings/RankingsTable.tsx`)

**Purpose**: Displays rankings in table format.

**Features**:
- Sortable columns (Rank, Model, Score, Win Rate)
- Model logos from organization
- Click row to open model details
- Responsive design

**Columns**:
- Rank: Model rank number
- Model: Model name with logo
- Score: ELO score
- Win Rate: Win percentage
- Battles: Total battles

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

1. **`getDomains()`**: Fetch all domains
2. **`getDomainBySlug(slug)`**: Fetch domain by slug
3. **`getDomainsWithStats()`**: Fetch domains with aggregated statistics

**`getDomainsWithStats()` Implementation**:
- Fetches all domains
- For each domain, aggregates:
  - `modelCount`: Count of unique models with rankings
  - `battleCount`: Sum of total battles from all rankings
- Returns domains with statistics

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

3. **`createEvaluation(data)`**: Create a new evaluation document

**`getEvaluationStats()` Implementation**:
- Fetches evaluation and battles
- Groups battles by model pairs
- Calculates wins/losses/ties for each model
- Builds win/loss matrix (model vs model)
- Calculates ELO scores (if not already in rankings)
- Returns comprehensive stats object

---

## Utilities

### Model Icons (`src/lib/utils/modelIcons.ts`)

**Purpose**: Maps organization names to logo paths.

**Function**: `getOrganizationLogo(organizationName: string): string`

**Implementation**:
- Maps organization names to logo file paths in `/public/logos/`
- Returns path like `/logos/openai.svg`
- Falls back to default logo if organization not found

**Supported Organizations**:
- OpenAI → `/logos/openai.svg`
- Anthropic → `/logos/anthropic.svg`
- Google → `/logos/google.svg`
- Meta → `/logos/meta.svg`
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

## Configuration

### Next.js Config (`next.config.js`)

**Key Settings**:
- `reactStrictMode: true`: Enables React strict mode
- Image optimization: Allows images from all HTTPS domains
- Environment variables: Configures `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`

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

---

## Environment Variables

### Required Variables

- `DATABASE_URL`: MongoDB connection string
  - Format: `mongodb://localhost:27017/langscope` (local)
  - Format: `mongodb+srv://user:pass@cluster.mongodb.net/langscope` (Atlas)

### Optional Variables

- `NEXT_PUBLIC_API_URL`: API base URL (default: `http://localhost:3001`)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (default: `ws://localhost:3001`)
- `NODE_ENV`: Environment (development, production)

---

## Scripts

### Database Seed (`scripts/seed.ts`)

**Purpose**: Populates MongoDB with initial data.

**Process**:
1. Connects to MongoDB
2. Clears existing data (optional)
3. Creates organizations (OpenAI, Anthropic, Google, etc.)
4. Creates domains (Code Generation, Customer Support, etc.)
5. Creates models (GPT-4, Claude 3, etc.)
6. Creates test cases
7. Creates model rankings with initial ELO scores
8. Creates evaluations
9. Creates battles with random winners

**Usage**: `npm run db:seed`

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
3. **Debouncing**: Search input is debounced to reduce API calls
4. **Memoization**: `useCallback` used for stable function references
5. **Lazy Loading**: Components loaded on demand
6. **Image Optimization**: Next.js Image component for optimized images

---

## Security Considerations

1. **Password Hashing**: User passwords are hashed (bcryptjs)
2. **Input Validation**: API routes validate input data
3. **ObjectId Validation**: MongoDB ObjectIds are validated before queries
4. **CORS**: Configured for allowed origins
5. **Environment Variables**: Sensitive data stored in environment variables

---

## Future Enhancements

1. **OAuth Integration**: Google and Facebook login (currently TODO)
2. **Real-time Updates**: WebSocket support for live standings
3. **Advanced Filtering**: More sophisticated search and filter options
4. **Export Features**: Export rankings and battle data
5. **Analytics Dashboard**: More detailed analytics and visualizations

---

## Conclusion

This documentation provides a comprehensive overview of the Langscope codebase. Each component, API route, and service is designed to work together to provide a seamless LLM evaluation experience. The system uses MongoDB for data persistence, Next.js for both frontend and backend, and implements an ELO rating system for fair model rankings.

For questions or contributions, please refer to the main README.md file.

