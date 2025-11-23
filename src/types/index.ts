// Core domain types
export interface Domain {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  battleCount: number;
  modelCount?: number;
  featured?: boolean;
  color?: string;
  isActive?: boolean;
  transferDomains?: string[];
  transferDomainSimilarities?: Record<string, number>;
  confidenceScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Model types
export interface Model {
  id: string;
  name: string;
  slug: string;
  provider: string;
  logo: string; // Organization logo
  description: string;
  type: 'open-source' | 'proprietary' | 'api-only';
  contextLength: number;
  costPer1MTokens: number;
  verified: boolean;
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelRanking {
  rank: number;
  previousRank: number;
  model: Model;
  score: number;
  uncertainty: number;
  battleCount: number;
  winRate: number;
  domain: Domain;
  lastUpdated: Date;
}

export interface ModelStats {
  totalBattles: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  averageScore: number;
  eloRating: number;
  domainBreakdown: {
    domainId: string;
    domainName: string;
    battles: number;
    winRate: number;
    elo: number;
  }[];
  recentTrend: 'up' | 'down' | 'stable';
}

// Battle types
export interface Battle {
  id: string;
  evaluationId: string;
  domain: Domain;
  testCase: TestCase;
  modelA: Model;
  modelB: Model;
  responseA: string;
  responseB: string;
  prompt: string;
  winner: 'A' | 'B' | 'Tie' | null;
  judgeVotes: JudgeVote[];
  metadata: BattleMetadata;
  verificationHash?: string; // SHA-256 hash stored in database
  createdAt: Date;
  completedAt?: Date;
}

export interface TestCase {
  id: string;
  domainId: string;
  prompt: string;
  context?: string;
  expectedCriteria: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  metadata?: Record<string, any>;
}

export interface JudgeVote {
  id: string;
  battleId: string;
  judgeId: string;
  judgeName?: string;
  vote: 'A' | 'B' | 'Tie';
  reasoning: string;
  criteria: {
    accuracy: boolean;
    relevance: boolean;
    clarity: boolean;
    completeness: boolean;
    [key: string]: boolean;
  };
  confidence: number;
  timestamp: Date;
}

export interface BattleMetadata {
  responseTimeA: number;
  responseTimeB: number;
  tokensA: number;
  tokensB: number;
  costA: number;
  costB: number;
  temperature: number;
  maxTokens: number;
}

// Verification types (database storage only)
export interface VerificationData {
  id: string;
  recordType: 'evaluation' | 'battle' | 'ranking';
  recordId: string;
  dataHash: string; // SHA-256 hash
  metadata?: Record<string, any>;
  verifiedAt: Date;
  createdAt: Date;
}

// Evaluation types
export interface Evaluation {
  id: string;
  name: string;
  domainId: string;
  domain: Domain;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  type: 'public' | 'private';
  createdBy: string;
  organizationId?: string;
  models: Model[];
  battles: Battle[];
  battleCount: number;
  completedBattles: number;
  results?: EvaluationResults;
  config: EvaluationConfig;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface EvaluationConfig {
  battlesPerPair: number;
  judgeCount: number;
  temperature: number;
  maxTokens: number;
  testCaseIds?: string[];
  randomizeOrder: boolean;
  includeHumanJudges: boolean;
}

export interface EvaluationResults {
  rankings: ModelRanking[];
  insights: Insight[];
  recommendations: Recommendation[];
  battleStats: BattleStats;
  accuracy: number;
  confidence: number;
}

export interface Insight {
  id: string;
  type: 'accuracy' | 'consistency' | 'cost' | 'speed' | 'quality';
  title: string;
  value: string | number;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: string;
  variant: 'default' | 'success' | 'warning' | 'error';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  modelId: string;
  model: Model;
  useCase: string;
  confidence: number;
  reasoning: string[];
}

export interface BattleStats {
  total: number;
  completed: number;
  pending: number;
  avgResponseTime: number;
  totalCost: number;
  winLossMatrix: Record<string, Record<string, number>>;
}

// User & Organization types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'judge';
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  members: User[];
  evaluations: Evaluation[];
  usage: UsageStats;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageStats {
  battlesThisMonth: number;
  battlesLimit: number;
  totalSpent: number;
  evaluationsCount: number;
  activeEvaluations: number;
}

// UI State types
export interface FilterState {
  costRange: [number, number];
  modelTypes: string[];
  providers: string[];
  contextLength: [number, number];
  verified: boolean | null;
  costFilter?: string[];
  contextFilter?: string[];
  sortBy?: 'elo' | 'cost-effectiveness' | 'speed';
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface ModelStanding {
  modelId: string;
  model: Model;
  rank: number;
  score: number;
  battles: number;
  change: number;
}

// Elo Rating types
export interface EloPoint {
  timestamp: Date;
  rating: number;
  uncertainty: number;
}

export interface EloHistory {
  modelId: string;
  domainId: string;
  history: EloPoint[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'battle_update' | 'ranking_update' | 'evaluation_complete' | 'standing_update';
  data: any;
  timestamp: Date;
}

// Form types
export interface EvaluationFormData {
  name: string;
  domainId: string;
  modelIds: string[];
  config: EvaluationConfig;
  isPrivate: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

