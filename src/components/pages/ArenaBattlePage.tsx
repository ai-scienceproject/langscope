'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
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
  const [responseA, setResponseA] = useState('');
  const [responseB, setResponseB] = useState('');
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [criteria, setCriteria] = useState({
    accuracy: false,
    clarity: false,
    safety: false,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [testCaseContext, setTestCaseContext] = useState('');
  const [standings, setStandings] = useState<ModelStanding[]>([]);
  const [currentModelA, setCurrentModelA] = useState<ModelStanding | null>(null);
  const [currentModelB, setCurrentModelB] = useState<ModelStanding | null>(null);
  
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch(`/api/arena/${domainSlug}/standings`);
        const result = await response.json();
        
        if (response.ok && result.data) {
          setStandings(result.data);
          
          // Select two random models for the battle (only if we have at least 2 models)
          if (result.data.length >= 2) {
            const shuffled = [...result.data].sort(() => Math.random() - 0.5);
            setCurrentModelA(shuffled[0] || null);
            setCurrentModelB(shuffled[1] || shuffled[0] || null);
          } else if (result.data.length === 1) {
            // If only one model, use it for both (though this shouldn't happen in practice)
            setCurrentModelA(result.data[0] || null);
            setCurrentModelB(result.data[0] || null);
          }
          return;
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
        setStandings([]);
        return;
      }
    };
    
    if (domainSlug) {
      fetchStandings();
    }
  }, [domainSlug]);

  useEffect(() => {
    // Mock battle data
    const contexts = [
      'Patient presents with symptoms of fever, cough, and difficulty breathing. Age 45, no known allergies. Seeking medical advice in Odia language.',
      'Legal contract analysis for software licensing agreement. Need to identify key terms and potential risks.',
      'Customer support query about product return policy. Customer is frustrated and needs immediate assistance.',
    ];
    
    setTestCaseContext(contexts[battleIndex % contexts.length]);
    setResponseA('Model A\'s response: Here\'s a recursive approach using Python...\n\nThis implements the solution efficiently.');
    setResponseB('Model B\'s response: Here\'s an iterative approach...\n\nThis avoids potential stack overflow issues.');
    
    // Select new models for each battle when battleIndex changes
    if (standings.length >= 2) {
      const shuffled = [...standings].sort(() => Math.random() - 0.5);
      setCurrentModelA(shuffled[0] || null);
      setCurrentModelB(shuffled[1] || shuffled[0] || null);
    }
  }, [battleIndex, standings]);

  const handleSubmit = async () => {
    if (!selectedVote || !currentModelA || !currentModelB) return;
    
    setSubmitting(true);
    
    try {
      // Save battle to MongoDB
      const battleResponse = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domainSlug,
          modelAId: currentModelA.modelId,
          modelBId: currentModelB.modelId,
          responseA: responseA || 'Response A',
          responseB: responseB || 'Response B',
          winner: selectedVote,
          testCaseTitle: testCaseContext || 'Arena Battle',
          evaluationId: evaluationId || undefined,
        }),
      });

      if (battleResponse.ok) {
        const battleResult = await battleResponse.json();
        // Update evaluationId with the actual MongoDB ID from the first battle
        if (battleResult.evaluationId && !evaluationId) {
          setEvaluationId(battleResult.evaluationId);
        }
      } else {
        console.error('Failed to save battle:', await battleResponse.json());
      }
    } catch (error) {
      console.error('Error saving battle:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update standings (simulate score changes) and select new models
    setStandings(prevStandings => {
      // Guard against empty standings array
      if (!prevStandings || prevStandings.length === 0) {
        return prevStandings;
      }
      
      const updated = [...prevStandings];
      // Randomly update a model's score to simulate real-time changes
      const randomIndex = Math.floor(Math.random() * updated.length);
      
      // Ensure the item exists before accessing its properties
      if (!updated[randomIndex]) {
        return prevStandings;
      }
      
      updated[randomIndex] = {
        ...updated[randomIndex],
        score: (updated[randomIndex].score || 0) + Math.floor(Math.random() * 10 - 5),
        battles: (updated[randomIndex].battles || 0) + 1,
        change: (updated[randomIndex].change || 0) + (Math.random() > 0.5 ? 1 : -1),
      };
      // Re-sort by score
      return updated.sort((a, b) => (b.score || 0) - (a.score || 0)).map((s, i) => ({ ...s, rank: i + 1 }));
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
      // Use the actual evaluationId from MongoDB, or fall back to the temporary one
      const finalEvalId = evaluationId || `eval-${Date.now()}`;
      window.location.href = `/results/${finalEvalId}?domain=${domainSlug}`;
    }
    
    setSubmitting(false);
  };

  return (
    <Layout
      showSidebar={true}
      sidebarType="leaderboard"
      standings={standings}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Top Bar: Battle X of Y | Domain [Pause] */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
              <span className="text-base sm:text-lg font-semibold text-black">
                Battle {battleIndex} of {totalBattles}
              </span>
              <span className="hidden xs:inline text-gray-400">|</span>
              <span className="text-sm sm:text-base md:text-lg font-medium text-dark-gray capitalize">
                {domainSlug.split('-').join(' ')}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="w-full xs:w-auto"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
