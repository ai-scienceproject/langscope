# LangScope - LLM Evaluation Platform

Battle-tested LLM rankings with secure data verification.

## Features

- 🎯 Domain-specific LLM rankings
- ⚔️ Interactive arena battle testing (Manual & LLM Judge modes)
- 📊 Comprehensive analytics and insights
- 🔒 Secure data verification and immutable records
- 👥 Community-driven evaluations
- 🔍 Full transparency and audit trails
- 🚀 Server-side rendering for fast initial loads

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (Serverless)
- **Database:** MongoDB with Mongoose ODM (Azure Cosmos DB for MongoDB in production)
- **Authentication:** Supabase Auth (Email/Password + OAuth: Google, GitHub)
- **State Management:** React Context API
- **Styling:** Tailwind CSS with custom design system
- **Deployment:** Azure App Service with GitHub Actions CI/CD

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 6.0+ (or MongoDB Atlas)
- pnpm/npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Set up MongoDB connection
# Add DATABASE_URL to .env file:
# DATABASE_URL="mongodb://localhost:27017/langscope"
# See MONGODB_SETUP.md for detailed setup instructions

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
langscope/
├── src/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   │   ├── layout/          # Layout components
│   │   ├── pages/           # Page-specific components
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utilities and helpers
│   │   ├── api/            # API client
│   │   ├── blockchain/     # Blockchain integrations
│   │   ├── ranking/        # Ranking algorithms
│   │   └── utils/          # Helper functions
│   ├── types/              # TypeScript types
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   └── styles/             # Global styles
├── public/                 # Static assets
└── server/                 # Backend API (optional separate)
```

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## CI/CD Pipeline

This project includes GitHub Actions workflows for continuous integration and deployment:

- **CI Pipeline** (`.github/workflows/ci.yml`): Runs on `main` and `develop` branch pushes, and on PRs
  - Linting with ESLint
  - Type checking with TypeScript
  - Building the Next.js application
  - **Must pass before deployment**

- **Deploy Pipeline** (`.github/workflows/deploy-azure.yml`): Runs automatically after CI passes on `main` branch
  - **Waits for CI pipeline to complete successfully**
  - Only deploys if CI checks pass (lint, type-check, build)
  - Builds Next.js application in standalone mode
  - Creates optimized deployment package
  - Deploys to Azure App Service automatically
  - Supports manual trigger via `workflow_dispatch` (use with caution)

**Workflow Flow:**
1. Code pushed to `main` branch
2. CI pipeline runs (lint → type-check → build)
3. If CI passes, deployment workflow automatically triggers
4. Deployment workflow verifies CI status
5. Code is built and deployed to Azure App Service

## Deployment

### Azure App Service (Current Production)

The application is deployed to Azure App Service using GitHub Actions.

**Deployment Process:**
1. Code is pushed to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy-azure.yml`) triggers automatically
3. Application is built in standalone mode for optimized deployment
4. Deployed to Azure App Service

**Required Environment Variables:**
- `DATABASE_URL`: MongoDB connection string (Azure Cosmos DB for MongoDB)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (optional)
- `OPENROUTER_API_KEY`: OpenRouter API key (for LLM judge evaluations)

See `CODE_DOCUMENTATION.md` for detailed deployment instructions.

### Local Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

API documentation available at `/api/docs` when running in development mode.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Documentation

For detailed code documentation, see [CODE_DOCUMENTATION.md](./CODE_DOCUMENTATION.md).

## Contact

- Website: https://langscope.ai
- Email: contact@langscope.ai
- Twitter: @langscope

