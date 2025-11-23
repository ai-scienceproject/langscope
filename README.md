# Langscope - LLM Evaluation Platform

Battle-tested LLM rankings with blockchain-verified immutability.

## Features

- 🎯 Domain-specific LLM rankings
- ⚔️ Interactive arena battle testing
- 📊 Comprehensive analytics and insights
- 🔗 Blockchain verification (Arweave, IPFS, Polygon)
- 🏢 Enterprise dashboard with team management
- 🔍 Full transparency and audit trails

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Database:** MongoDB with Mongoose ODM
- **Real-time:** Socket.io
- **Blockchain:** Arweave, IPFS, Polygon
- **Charts:** Recharts
- **State Management:** Zustand
- **Data Fetching:** TanStack Query

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

# Seed the database with sample data (optional)
npm run db:seed

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

- **CI Pipeline** (`.github/workflows/ci.yml`): Runs on every push and PR
  - Linting with ESLint
  - Type checking with TypeScript
  - Building the Next.js application

- **Deploy Pipeline** (`.github/workflows/deploy.yml`): Runs on main branch pushes
  - Automated deployment (configure your target)

See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed setup instructions.

## Deployment

### Vercel (Recommended for Frontend)

```bash
vercel deploy
```

The CI/CD pipeline can automatically deploy to Vercel. Configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` in GitHub Secrets.

### Docker

```bash
docker build -t langscope .
docker run -p 3000:3000 langscope
```

### GitHub Actions

The project includes automated deployment workflows. Configure your deployment target in `.github/workflows/deploy.yml`.

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

## Contact

- Website: https://langscope.ai
- Email: contact@langscope.ai
- Twitter: @langscope

