'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import type { Model, ModelStats } from '@/types';

interface ModelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
  domainSlug?: string;
}

interface BattleHistory {
  id: string;
  opponentId: string;
  opponentName: string;
  prompt: string;
  winner: 'A' | 'B' | 'Tie';
  votes: number;
  completedAt: Date;
}

interface ModelDetails {
  model: Model;
  stats: ModelStats;
  battles: BattleHistory[];
  strengths: string[];
  weaknesses: string[];
  latency?: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

const ModelDetailsModal: React.FC<ModelDetailsModalProps> = ({
  isOpen,
  onClose,
  modelId,
  domainSlug,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [details, setDetails] = useState<ModelDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && modelId) {
      fetchModelDetails();
    }
  }, [isOpen, modelId, domainSlug]);

  const fetchModelDetails = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data
    const mockModel: Model = {
      id: modelId,
      name: modelId.includes('gpt-4') ? 'GPT-4 Turbo' :
            modelId.includes('claude-3-opus') ? 'Claude 3 Opus' :
            modelId.includes('gemini') ? 'Gemini Pro' :
            modelId.includes('gpt-3.5') ? 'GPT-3.5 Turbo' :
            modelId.includes('claude-3-sonnet') ? 'Claude 3 Sonnet' :
            'Model Name',
      slug: modelId,
      provider: modelId.includes('gpt') ? 'OpenAI' :
               modelId.includes('claude') ? 'Anthropic' :
               modelId.includes('gemini') ? 'Google' :
               'Provider',
      logo: '🤖',
      description: 'Advanced language model with state-of-the-art performance',
      type: 'api-only',
      contextLength: modelId.includes('claude-3-opus') ? 200000 : 128000,
      costPer1MTokens: modelId.includes('gpt-4') ? 10.0 :
                       modelId.includes('claude-3-opus') ? 15.0 :
                       modelId.includes('gemini') ? 7.0 :
                       modelId.includes('gpt-3.5') ? 0.5 :
                       modelId.includes('claude-3-sonnet') ? 3.0 : 5.0,
      verified: true,
      releaseDate: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    const mockStats: ModelStats = {
      totalBattles: 155,
      wins: 117,
      losses: 30,
      ties: 8,
      winRate: 75.5,
      averageScore: 1450,
      eloRating: 1450,
      domainBreakdown: [
        { domainId: '1', domainName: 'Code Generation', battles: 45, winRate: 78.2, elo: 1480 },
        { domainId: '2', domainName: 'Mathematical Reasoning', battles: 38, winRate: 72.5, elo: 1420 },
        { domainId: '3', domainName: 'Creative Writing', battles: 42, winRate: 76.8, elo: 1460 },
        { domainId: '4', domainName: 'Question Answering', battles: 30, winRate: 74.3, elo: 1440 },
      ],
      recentTrend: 'up',
    };

    const mockBattles: BattleHistory[] = [
      {
        id: '1',
        opponentId: 'claude-3-opus',
        opponentName: 'Claude 3 Opus',
        prompt: 'Write a Python function to calculate factorial',
        winner: 'A',
        votes: 45,
        completedAt: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        opponentId: 'gemini-pro',
        opponentName: 'Gemini Pro',
        prompt: 'Explain quantum entanglement',
        winner: 'B',
        votes: 42,
        completedAt: new Date(Date.now() - 7200000),
      },
      {
        id: '3',
        opponentId: 'gpt-3.5-turbo',
        opponentName: 'GPT-3.5 Turbo',
        prompt: 'Create a REST API endpoint',
        winner: 'B',
        votes: 52,
        completedAt: new Date(Date.now() - 10800000),
      },
    ];

    const mockStrengths = [
      'Excellent code generation and debugging',
      'Strong reasoning capabilities',
      'Large context window for complex tasks',
      'High accuracy in technical domains',
    ];

    const mockWeaknesses = [
      'Higher latency compared to smaller models',
      'Cost can be prohibitive for high-volume use',
      'Occasional verbosity in responses',
    ];

    const mockLatency = {
      average: 1250,
      p50: 980,
      p95: 2100,
      p99: 3200,
    };

    setDetails({
      model: mockModel,
      stats: mockStats,
      battles: mockBattles,
      strengths: mockStrengths,
      weaknesses: mockWeaknesses,
      latency: mockLatency,
    });
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'battle-history', label: 'Battle History', icon: '⚔️' },
    { id: 'stats', label: 'Stats', icon: '📈' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
  ];

  if (!details && !loading) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={details?.model.name || 'Model Details'}
      size="lg"
    >
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading model details...</p>
        </div>
      ) : details ? (
        <div>
          {/* Header with Model Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar
                src={details.model.logo}
                alt={details.model.name}
                size="md"
                shape="square"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{details.model.name}</h3>
                  {details.model.verified && (
                    <Badge label="Verified" variant="success" size="sm" />
                  )}
                  <Badge
                    label={details.model.type === 'open-source' ? 'Open Source' : 
                           details.model.type === 'api-only' ? 'API Only' : 'Proprietary'}
                    variant="default"
                    size="sm"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{details.model.provider}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{details.model.description}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="p-3">
                    <p className="text-xs text-gray-500 mb-1">Elo Score</p>
                    <p className="text-xl font-bold text-gray-900">{details.stats.eloRating}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {details.stats.recentTrend === 'up' ? '↑' : 
                       details.stats.recentTrend === 'down' ? '↓' : '→'} Recent
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                    <p className="text-xl font-bold text-gray-900">{details.stats.winRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {details.stats.wins}W / {details.stats.losses}L / {details.stats.ties}T
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500 mb-1">Context Window</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(details.model.contextLength / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-500 mt-1">tokens</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500 mb-1">Cost</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${details.model.costPer1MTokens.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per 1M tokens</p>
                  </Card>
                </div>

                {/* Latency */}
                {details.latency && (
                  <Card className="p-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-3">Latency Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Average</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {details.latency.average}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">P50</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {details.latency.p50}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">P95</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {details.latency.p95}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">P99</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {details.latency.p99}ms
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>✅</span> Strengths
                    </h4>
                    <ul className="space-y-1.5">
                      {details.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-4 bg-red-50 border-red-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>⚠️</span> Weaknesses
                    </h4>
                    <ul className="space-y-1.5">
                      {details.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'battle-history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-900">Recent Battles</h4>
                  <span className="text-sm text-gray-500">
                    {details.battles.length} battles shown
                  </span>
                </div>
                {details.battles.map((battle) => {
                  const won = battle.winner === 'A' || battle.winner === 'B';
                  const tied = battle.winner === 'Tie';

                  return (
                    <Card key={battle.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              vs {battle.opponentName}
                            </span>
                            {won && <Badge label="Won" variant="success" size="sm" />}
                            {!won && !tied && <Badge label="Lost" variant="error" size="sm" />}
                            {tied && <Badge label="Tie" variant="default" size="sm" />}
                          </div>
                          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                            {battle.prompt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{battle.votes} votes</span>
                            <span>•</span>
                            <span>{battle.completedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* Overall Stats */}
                <Card className="p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Overall Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Battles</p>
                      <p className="text-2xl font-bold text-gray-900">{details.stats.totalBattles}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Wins</p>
                      <p className="text-2xl font-bold text-green-600">{details.stats.wins}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Losses</p>
                      <p className="text-2xl font-bold text-red-600">{details.stats.losses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ties</p>
                      <p className="text-2xl font-bold text-gray-600">{details.stats.ties}</p>
                    </div>
                  </div>
                </Card>

                {/* Domain Breakdown */}
                <Card className="p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Performance by Domain</h4>
                  <div className="space-y-2">
                    {details.stats.domainBreakdown.map((domain) => (
                      <div key={domain.domainId} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{domain.domainName}</p>
                          <p className="text-xs text-gray-500">{domain.battles} battles</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{domain.winRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Elo: {domain.elo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Win Rate Chart Placeholder */}
                <Card className="p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Win Rate Trend</h4>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500">Chart visualization would go here</p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-4">
                {/* Pricing Overview */}
                <Card className="p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Pricing Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Input Tokens</p>
                        <p className="text-xs text-gray-500">Per 1M tokens</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ${details.model.costPer1MTokens.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Output Tokens</p>
                        <p className="text-xs text-gray-500">Per 1M tokens</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ${(details.model.costPer1MTokens * 1.2).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Cost Calculator */}
                <Card className="p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Cost Calculator</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Input Tokens (in millions)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        defaultValue="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onChange={(e) => {
                          const inputTokens = parseFloat(e.target.value) || 0;
                          const outputTokens = inputTokens * 0.5; // Assume 50% output
                          // const inputCost = inputTokens * details.model.costPer1MTokens;
                          // const outputCost = outputTokens * details.model.costPer1MTokens * 1.2;
                          // const totalCost = inputCost + outputCost; // Reserved for future use
                          // Update display (simplified - would need state for full implementation)
                          void outputTokens; // Suppress unused variable warning
                        }}
                      />
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-primary-700">
                        ${details.model.costPer1MTokens.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">for 1M input tokens</p>
                    </div>
                  </div>
                </Card>

                {/* Pricing Notes */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Pricing Notes</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Prices are per 1 million tokens</li>
                    <li>• Output tokens typically cost 20% more than input tokens</li>
                    <li>• Volume discounts may apply for enterprise customers</li>
                    <li>• Pricing subject to change by provider</li>
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ModelDetailsModal;

