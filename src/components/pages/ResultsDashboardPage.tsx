'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { ModelRanking } from '@/types';

interface ResultsDashboardPageProps {
  evaluationId?: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  metrics?: { label: string; value: string }[];
}

const ResultsDashboardPageContent: React.FC<ResultsDashboardPageProps> = ({ evaluationId }) => {
  const searchParams = useSearchParams();
  const domainSlug = searchParams.get('domain') || 'code-generation';
  
  const [results, setResults] = useState<{
    userRank: number;
    predictedRank: number;
    modelName: string;
    actualScore: number;
    predictedScore: number;
    rankings: ModelRanking[];
    domainName: string;
    totalBattles: number;
    modelsTested: number;
    winLossMatrix: { [key: string]: { [key: string]: { wins: number; losses: number } } };
    confidenceBefore: number;
    confidenceAfter: number;
    predictionAccuracy: number;
  } | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Format domain name from slug
    const domainName = domainSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Mock results data
    const mockResults = {
      userRank: 3,
      predictedRank: 5,
      modelName: 'Claude 3 Opus',
      actualScore: 1420,
      predictedScore: 1350,
      domainName,
      totalBattles: 10,
      modelsTested: 3,
      winLossMatrix: {
        'claude-3-opus': {
          'gpt-4-turbo': { wins: 2, losses: 1 },
          'gemini-pro': { wins: 3, losses: 0 },
        },
        'gpt-4-turbo': {
          'claude-3-opus': { wins: 1, losses: 2 },
          'gemini-pro': { wins: 2, losses: 1 },
        },
        'gemini-pro': {
          'claude-3-opus': { wins: 0, losses: 3 },
          'gpt-4-turbo': { wins: 1, losses: 2 },
        },
      },
      confidenceBefore: 75,
      confidenceAfter: 88,
      predictionAccuracy: 70,
      rankings: [
        {
          rank: 1,
          previousRank: 1,
          model: {
            id: 'gpt-4-turbo',
            name: 'GPT-4 Turbo',
            slug: 'gpt-4-turbo',
            provider: 'OpenAI',
            logo: '🤖',
            description: 'GPT-4 Turbo',
            type: 'api-only' as const,
            contextLength: 128000,
            costPer1MTokens: 10.0,
            verified: true,
            releaseDate: new Date('2024-01-01'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
          },
          score: 1450,
          uncertainty: 15,
          battleCount: 155,
          winRate: 75.2,
          domain: {
            id: '1',
            name: domainName,
            slug: domainSlug,
            description: `Evaluate models on ${domainName.toLowerCase()}`,
            icon: domainSlug.includes('code') ? '💻' : domainSlug.includes('math') ? '🔢' : 
                  domainSlug.includes('creative') ? '✍️' : domainSlug.includes('instruction') ? '📋' :
                  domainSlug.includes('question') ? '❓' : '📄',
            battleCount: 15234,
            modelCount: 45,
            color: '#3B82F6',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          lastUpdated: new Date(),
        },
        {
          rank: 2,
          previousRank: 2,
          model: {
            id: 'claude-3-opus',
            name: 'Claude 3 Opus',
            slug: 'claude-3-opus',
            provider: 'Anthropic',
            logo: '🤖',
            description: 'Claude 3 Opus',
            type: 'api-only' as const,
            contextLength: 200000,
            costPer1MTokens: 15.0,
            verified: true,
            releaseDate: new Date('2024-01-01'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
          },
          score: 1420,
          uncertainty: 18,
          battleCount: 153,
          winRate: 73.8,
          domain: {
            id: '1',
            name: domainName,
            slug: domainSlug,
            description: `Evaluate models on ${domainName.toLowerCase()}`,
            icon: domainSlug.includes('code') ? '💻' : domainSlug.includes('math') ? '🔢' : 
                  domainSlug.includes('creative') ? '✍️' : domainSlug.includes('instruction') ? '📋' :
                  domainSlug.includes('question') ? '❓' : '📄',
            battleCount: 15234,
            modelCount: 45,
            color: '#3B82F6',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          lastUpdated: new Date(),
        },
        {
          rank: 3,
          previousRank: 4,
          model: {
            id: 'gemini-pro',
            name: 'Gemini Pro',
            slug: 'gemini-pro',
            provider: 'Google',
            logo: '🤖',
            description: 'Gemini Pro',
            type: 'api-only' as const,
            contextLength: 128000,
            costPer1MTokens: 7.0,
            verified: true,
            releaseDate: new Date('2024-01-01'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
          },
          score: 1380,
          uncertainty: 20,
          battleCount: 150,
          winRate: 68.5,
          domain: {
            id: '1',
            name: domainName,
            slug: domainSlug,
            description: `Evaluate models on ${domainName.toLowerCase()}`,
            icon: domainSlug.includes('code') ? '💻' : domainSlug.includes('math') ? '🔢' : 
                  domainSlug.includes('creative') ? '✍️' : domainSlug.includes('instruction') ? '📋' :
                  domainSlug.includes('question') ? '❓' : '📄',
            battleCount: 15234,
            modelCount: 45,
            color: '#3B82F6',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          lastUpdated: new Date(),
        },
      ],
    };

    const mockInsights: Insight[] = [
      {
        id: '1',
        title: 'Prediction Accuracy: 70%',
        description: 'Your evaluation results matched predictions 70% of the time, indicating reliable model performance assessment.',
        icon: '🎯',
        color: 'bg-blue-50',
        metrics: [
          { label: 'Accuracy', value: '70%' },
          { label: 'Battles', value: '10' },
          { label: 'Models', value: '3' },
        ],
      },
      {
        id: '2',
        title: 'Biggest Surprise: Claude-3 outperformed in technical terminology',
        description: 'Claude-3 Opus demonstrated exceptional performance in technical terminology and domain-specific language, exceeding initial predictions.',
        icon: '💡',
        color: 'bg-yellow-50',
        metrics: [
          { label: 'Area', value: 'Technical Terms' },
          { label: 'Win Rate', value: '73.8%' },
          { label: 'Improvement', value: '+15%' },
        ],
      },
      {
        id: '3',
        title: 'Cost-Benefit: Top model is 15% more expensive but 23% more accurate',
        description: 'The top-performing model costs 15% more than alternatives but delivers 23% better accuracy, providing excellent value for critical applications.',
        icon: '💰',
        color: 'bg-purple-50',
        metrics: [
          { label: 'Cost Increase', value: '+15%' },
          { label: 'Accuracy Gain', value: '+23%' },
          { label: 'Value Ratio', value: '1.53x' },
        ],
      },
    ];

    setResults(mockResults);
    setInsights(mockInsights);
    setLoading(false);
  }, [evaluationId, domainSlug]);

  const handleExportPDF = () => {
    alert('Downloading Report PDF...');
  };

  const handleExportBattleData = () => {
    alert('Exporting Battle Data...');
  };

  const handleShareResults = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'My LLM Evaluation Results',
        text: 'Check out my evaluation results on Langscope',
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Results link copied to clipboard!');
    }
  };

  const handleScheduleRetest = () => {
    alert('Scheduling re-test...');
  };

  if (loading || !results) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const rankDifference = results.predictedRank - results.userRank;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Evaluation Complete - {results.totalBattles} battles - {results.modelsTested} models tested
          </h1>
          <p className="text-lg text-gray-600">
            Domain: <span className="font-semibold">{results.domainName}</span>
          </p>
        </div>

        {/* Rankings Table: Your Rank vs Predicted */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Model Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Predicted Rank</p>
                <p className="text-4xl font-bold text-gray-400">#{results.predictedRank}</p>
                <p className="text-xs text-gray-500 mt-2">{results.predictedScore} pts</p>
              </div>
              
              <div className="text-center p-6 bg-primary-50 rounded-lg border-2 border-primary-600">
                <p className="text-sm text-primary-600 mb-2 font-semibold">Actual Rank</p>
                <p className="text-4xl font-bold text-primary-700">#{results.userRank}</p>
                <p className="text-xs text-primary-600 mt-2">{results.actualScore} pts</p>
                {rankDifference !== 0 && (
                  <Badge
                    label={`${rankDifference > 0 ? '↑' : '↓'} ${Math.abs(rankDifference)}`}
                    variant={rankDifference > 0 ? 'success' : 'error'}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Score Difference</p>
                <p className="text-4xl font-bold text-green-600">
                  +{results.actualScore - results.predictedScore}
                </p>
                <p className="text-xs text-gray-500 mt-2">points gained</p>
              </div>
            </div>

            {/* Full Rankings Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Predicted</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.rankings.map((ranking) => {
                    const isUserModel = ranking.rank === results.userRank;
                    const predictedRankForModel = ranking.rank === results.userRank ? results.predictedRank : ranking.rank;
                    return (
                      <tr
                        key={ranking.model.id}
                        className={isUserModel ? 'bg-primary-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4">
                          <span className={`text-2xl font-bold ${isUserModel ? 'text-primary-700' : 'text-gray-900'}`}>
                            #{ranking.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{ranking.model.logo}</span>
                            <div>
                              <p className={`font-medium ${isUserModel ? 'text-primary-900' : 'text-gray-900'}`}>
                                {ranking.model.name}
                                {isUserModel && (
                                  <Badge label="Your Model" variant="success" size="sm" className="ml-2" />
                                )}
                              </p>
                              <p className="text-sm text-gray-500">{ranking.model.provider}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">#{predictedRankForModel}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${isUserModel ? 'text-primary-700' : 'text-gray-900'}`}>
                            #{ranking.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-semibold text-gray-900">{ranking.score}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{ranking.winRate.toFixed(1)}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Win/Loss Matrix Visualization */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Win/Loss Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300 bg-gray-50"></th>
                    {Object.keys(results.winLossMatrix).map((modelId) => {
                      const model = results.rankings.find(r => r.model.id === modelId)?.model;
                      return (
                        <th key={modelId} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-300 bg-gray-50">
                          {model?.name || modelId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.winLossMatrix).map(([modelA, vsModels]) => {
                    const model = results.rankings.find(r => r.model.id === modelA)?.model;
                    const vsModelsTyped = vsModels as { [key: string]: { wins: number; losses: number } };
                    return (
                      <tr key={modelA}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 bg-gray-50">
                          {model?.name || modelA}
                        </td>
                        {Object.keys(results.winLossMatrix).map((modelB) => {
                          if (modelA === modelB) {
                            return (
                              <td key={modelB} className="px-4 py-3 text-center text-sm text-gray-400 border border-gray-300 bg-gray-100">
                                —
                              </td>
                            );
                          }
                          const result = vsModelsTyped[modelB];
                          if (!result) {
                            return (
                              <td key={modelB} className="px-4 py-3 text-center text-sm text-gray-400 border border-gray-300">
                                —
                              </td>
                            );
                          }
                          return (
                            <td key={modelB} className="px-4 py-3 text-center text-sm border border-gray-300">
                              <div className="flex flex-col items-center">
                                <span className="text-green-600 font-semibold">{result.wins}W</span>
                                <span className="text-red-600 font-semibold">{result.losses}L</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Confidence Progression Chart */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confidence Progression</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Before Testing</p>
                <p className="text-3xl font-bold text-gray-400">{results.confidenceBefore}%</p>
              </div>
              <div className="flex-1 mx-8">
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-gray-400 to-primary-600 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${((results.confidenceAfter - results.confidenceBefore) / 100) * 100}%`, 
                      marginLeft: `${(results.confidenceBefore / 100) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">After Testing</p>
                <p className="text-3xl font-bold text-primary-600">{results.confidenceAfter}%</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Confidence increased by <span className="font-semibold text-primary-600">+{results.confidenceAfter - results.confidenceBefore}%</span> after evaluation
              </p>
            </div>
          </div>
        </Card>

        {/* Insights Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className={`${insight.color} border-0`}>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-sm text-gray-700 mb-4">{insight.description}</p>
                      {insight.metrics && (
                        <div className="grid grid-cols-3 gap-2">
                          {insight.metrics.map((metric, idx) => (
                            <div key={idx}>
                              <p className="text-xs text-gray-600">{metric.label}</p>
                              <p className="text-sm font-semibold text-gray-900">{metric.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="md" onClick={handleExportPDF}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Download Report PDF
              </Button>
              <Button variant="outline" size="md" onClick={handleExportBattleData}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Battle Data
              </Button>
              <Button variant="outline" size="md" onClick={handleShareResults}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Results
              </Button>
              <Button variant="outline" size="md" onClick={handleScheduleRetest}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Re-test
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

// Wrapper component with Suspense for useSearchParams
const ResultsDashboardPage: React.FC<ResultsDashboardPageProps> = ({ evaluationId }) => {
  return (
    <Suspense fallback={
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      </Layout>
    }>
      <ResultsDashboardPageContent evaluationId={evaluationId} />
    </Suspense>
  );
};

export default ResultsDashboardPage;

