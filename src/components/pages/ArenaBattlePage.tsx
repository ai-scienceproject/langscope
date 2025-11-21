'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ModelStanding } from '@/types';

interface ArenaBattlePageProps {
  domainSlug: string;
}

const ArenaBattlePage: React.FC<ArenaBattlePageProps> = ({ domainSlug }) => {
  const [battleIndex, setBattleIndex] = useState(1);
  const [totalBattles] = useState(10);
  const [selectedVote, setSelectedVote] = useState<'A' | 'B' | 'Tie' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [responseA, setResponseA] = useState('');
  const [responseB, setResponseB] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [evaluationId] = useState(() => `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [criteria, setCriteria] = useState({
    accuracy: false,
    clarity: false,
    safety: false,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [testCaseContext, setTestCaseContext] = useState('');
  const [standings, setStandings] = useState<ModelStanding[]>([
    {
      modelId: 'gpt-4-turbo',
      model: {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        slug: 'gpt-4-turbo',
        provider: 'OpenAI',
        logo: '🤖',
        description: 'GPT-4 Turbo by OpenAI',
        type: 'api-only',
        contextLength: 128000,
        costPer1MTokens: 10.0,
        verified: true,
        releaseDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      rank: 1,
      score: 1450,
      battles: 155,
      change: 2,
    },
    {
      modelId: 'claude-3-opus',
      model: {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        slug: 'claude-3-opus',
        provider: 'Anthropic',
        logo: '🤖',
        description: 'Claude 3 Opus by Anthropic',
        type: 'api-only',
        contextLength: 200000,
        costPer1MTokens: 15.0,
        verified: true,
        releaseDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      rank: 2,
      score: 1420,
      battles: 153,
      change: -1,
    },
    {
      modelId: 'gemini-pro',
      model: {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        slug: 'gemini-pro',
        provider: 'Google',
        logo: '🤖',
        description: 'Gemini Pro by Google',
        type: 'api-only',
        contextLength: 128000,
        costPer1MTokens: 7.0,
        verified: true,
        releaseDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      rank: 3,
      score: 1380,
      battles: 150,
      change: 1,
    },
    {
      modelId: 'gpt-3.5-turbo',
      model: {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        slug: 'gpt-3.5-turbo',
        provider: 'OpenAI',
        logo: '🤖',
        description: 'GPT-3.5 Turbo by OpenAI',
        type: 'api-only',
        contextLength: 16000,
        costPer1MTokens: 0.5,
        verified: true,
        releaseDate: new Date('2023-01-01'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
      },
      rank: 4,
      score: 1350,
      battles: 152,
      change: 0,
    },
    {
      modelId: 'claude-3-sonnet',
      model: {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        slug: 'claude-3-sonnet',
        provider: 'Anthropic',
        logo: '🤖',
        description: 'Claude 3 Sonnet by Anthropic',
        type: 'api-only',
        contextLength: 200000,
        costPer1MTokens: 3.0,
        verified: true,
        releaseDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      rank: 5,
      score: 1320,
      battles: 150,
      change: -2,
    },
  ]);

  useEffect(() => {
    // Mock battle data
    const prompts = [
      'Write a Python function to calculate the factorial of a number',
      'Explain quantum entanglement in simple terms',
      'Create a REST API endpoint for user authentication',
      'Write a poem about artificial intelligence',
      'Solve: What is the derivative of x^2 + 3x + 5?',
    ];
    
    const contexts = [
      'Patient presents with symptoms of fever, cough, and difficulty breathing. Age 45, no known allergies. Seeking medical advice in Odia language.',
      'Legal contract analysis for software licensing agreement. Need to identify key terms and potential risks.',
      'Customer support query about product return policy. Customer is frustrated and needs immediate assistance.',
    ];
    
    setPrompt(prompts[battleIndex % prompts.length]);
    setTestCaseContext(contexts[battleIndex % contexts.length]);
    setResponseA('Model A\'s response: Here\'s a recursive approach using Python...\n\nThis implements the solution efficiently.');
    setResponseB('Model B\'s response: Here\'s an iterative approach...\n\nThis avoids potential stack overflow issues.');
  }, [battleIndex]);

  const handleSubmit = async () => {
    if (!selectedVote) return;
    
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update standings (simulate score changes)
    setStandings(prevStandings => {
      const updated = [...prevStandings];
      // Randomly update a model's score to simulate real-time changes
      const randomIndex = Math.floor(Math.random() * updated.length);
      updated[randomIndex] = {
        ...updated[randomIndex],
        score: updated[randomIndex].score + Math.floor(Math.random() * 10 - 5),
        battles: updated[randomIndex].battles + 1,
        change: updated[randomIndex].change + (Math.random() > 0.5 ? 1 : -1),
      };
      // Re-sort by score
      return updated.sort((a, b) => b.score - a.score).map((s, i) => ({ ...s, rank: i + 1 }));
    });
    
    if (battleIndex < totalBattles) {
      setBattleIndex(prev => prev + 1);
      setSelectedVote(null);
      setCriteria({
        accuracy: false,
        clarity: false,
        safety: false,
      });
    } else {
      // Redirect to Results Dashboard when all battles are complete
      window.location.href = `/results/${evaluationId}?domain=${domainSlug}`;
    }
    
    setSubmitting(false);
  };

  return (
    <Layout
      showSidebar={true}
      sidebarType="leaderboard"
      standings={standings}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Bar: Battle X of Y | Domain [Pause] */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-gray-900">
                Battle {battleIndex} of {totalBattles}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-lg font-medium text-gray-700 capitalize">
                {domainSlug.split('-').join(' ')}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        </div>

        {/* Test Case: Context Box */}
        <Card className="mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Test Case:</h3>
          </div>
          <div className="p-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {testCaseContext || 'Patient case description - context box'}
              </p>
            </div>
          </div>
        </Card>

        {/* Responses: Response 1 | Response 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Response 1 */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedVote === 'A' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedVote('A')}
          >
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Response 1</h4>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap">{responseA}</p>
            </div>
          </Card>

          {/* Response 2 */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedVote === 'B' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedVote('B')}
          >
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Response 2</h4>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap">{responseB}</p>
            </div>
          </Card>
        </div>

        {/* Voting Panel */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Which response is better?</h3>

            {/* Vote Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Button
                variant={selectedVote === 'A' ? 'primary' : 'outline'}
                size="lg"
                onClick={() => setSelectedVote('A')}
                className="h-16"
              >
                <span className="text-lg">Response 1</span>
              </Button>
              <Button
                variant={selectedVote === 'Tie' ? 'primary' : 'outline'}
                size="lg"
                onClick={() => setSelectedVote('Tie')}
                className="h-16"
              >
                <span className="text-lg">Tie</span>
              </Button>
              <Button
                variant={selectedVote === 'B' ? 'primary' : 'outline'}
                size="lg"
                onClick={() => setSelectedVote('B')}
                className="h-16"
              >
                <span className="text-lg">Response 2</span>
              </Button>
            </div>

            {/* Criteria Checkboxes */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Criteria:
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'accuracy' as const, label: 'Accuracy' },
                  { key: 'clarity' as const, label: 'Clarity' },
                  { key: 'safety' as const, label: 'Safety' },
                ].map((criterion) => (
                  <label key={criterion.key} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria[criterion.key]}
                      onChange={(e) => 
                        setCriteria({ ...criteria, [criterion.key]: e.target.checked })
                      }
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{criterion.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => setBattleIndex(prev => prev + 1)}>
                  Skip
                </Button>
                <Button variant="ghost" onClick={() => {/* TODO: Show more context */}}>
                  Need more context
                </Button>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={!selectedVote || submitting || isPaused}
                loading={submitting}
              >
                Submit & Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Leaderboard (shown after 2+ battles) */}
        {battleIndex > 2 && (
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Live Leaderboard (after {battleIndex - 1} battles):
              </h3>
              <div className="flex flex-wrap gap-4">
                {standings.slice(0, 5).map((standing, idx) => {
                  // Calculate wins/losses (mock data)
                  const wins = Math.floor(standing.battles * 0.6);
                  const losses = standing.battles - wins;
                  return (
                    <div key={standing.modelId} className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600">
                        {idx + 1}.
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {standing.model.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({wins}-{losses})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ArenaBattlePage;
