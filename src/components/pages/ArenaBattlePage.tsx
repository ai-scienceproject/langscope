'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { getOrganizationLogo } from '@/lib/utils/modelIcons';
import type { ModelStanding } from '@/types';

interface ArenaBattlePageProps {
  domainSlug: string;
}

interface Question {
  id: string;
  text: string;
  domain: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  provider?: string;
}

// Extract provider name from OpenRouter model ID (e.g., "openai/gpt-4" -> "openai")
const getProviderFromModelId = (modelId: string): string => {
  const parts = modelId.split('/');
  if (parts.length > 1) {
    return parts[0];
  }
  return 'OpenRouter';
};

const ArenaBattlePage: React.FC<ArenaBattlePageProps> = ({ domainSlug }) => {
  const searchParams = useSearchParams();
  const judgeType = searchParams.get('judge') as 'human' | 'llm' | null;
  const selectedModelIds = searchParams.get('models')?.split(',') || [];

  const [battleIndex, setBattleIndex] = useState(1);
  const [totalBattles] = useState(1);
  const [selectedVote, setSelectedVote] = useState<'A' | 'B' | 'Tie' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [responseA, setResponseA] = useState('');
  const [responseB, setResponseB] = useState('');
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [testCaseContext, setTestCaseContext] = useState('');
  const [standings, setStandings] = useState<ModelStanding[]>([]);
  const [currentModelA, setCurrentModelA] = useState<ModelStanding | null>(null);
  const [currentModelB, setCurrentModelB] = useState<ModelStanding | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [judgeModelId, setJudgeModelId] = useState<string | null>(null);
  const [isLLMEvaluating, setIsLLMEvaluating] = useState(false);
  const [llmProgress, setLlmProgress] = useState({ current: 0, total: 0 });
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [battleComplete, setBattleComplete] = useState(false);
  const [battleRankings, setBattleRankings] = useState<ModelStanding[]>([]);
  const [allRankings, setAllRankings] = useState<ModelStanding[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const modelsFetchedRef = useRef(false);
  const questionsFetchedRef = useRef(false);
  const resultsFetchedRef = useRef(false);
  const llmEvaluationStartedRef = useRef(false); // Prevent duplicate LLM evaluations
  const evaluationCheckedRef = useRef(false);
  const hasExistingEvaluationRef = useRef(false);
  
  // Check if battle is already complete on mount (for page reloads and back navigation)
  useEffect(() => {
    const checkExistingBattle = async () => {
      // Reset flags if no evaluationId in URL (fresh start)
      const urlEvalId = searchParams.get('evaluationId');
      if (!urlEvalId || urlEvalId === 'null' || urlEvalId.startsWith('eval-')) {
        // Reset flags for new battle
        evaluationCheckedRef.current = false;
        hasExistingEvaluationRef.current = false;
        llmEvaluationStartedRef.current = false;
        modelsFetchedRef.current = false;
        questionsFetchedRef.current = false;
        resultsFetchedRef.current = false;
        return;
      }
      
      if (evaluationCheckedRef.current) return;
      evaluationCheckedRef.current = true;
      
      // Check if evaluationId exists in URL and evaluation is complete
      if (urlEvalId && urlEvalId !== 'null' && !urlEvalId.startsWith('eval-')) {
        try {
          // Check if evaluation exists and has completed battles
          const evalResponse = await fetch(`/api/evaluations/${urlEvalId}`);
          if (evalResponse.ok) {
            const evalData = await evalResponse.json();
            if (evalData.data && evalData.data.completedBattles > 0) {
              hasExistingEvaluationRef.current = true;
              setEvaluationId(urlEvalId);
              setBattleComplete(true);
              // Redirect to results page if coming from back button
              const judgeModelId = searchParams.get('judgeModelId');
              const judgeParam = judgeModelId ? `&judgeModelId=${encodeURIComponent(judgeModelId)}` : '';
              window.location.href = `/results/${urlEvalId}?domain=${domainSlug}${judgeParam}`;
              return;
            }
          }
        } catch (error) {
          console.error('Error checking existing evaluation:', error);
        }
      }
    };
    
    checkExistingBattle();
  }, [searchParams, domainSlug]); // Include searchParams and domainSlug in dependencies
  
  // Fetch questions only once when domainSlug is available
  useEffect(() => {
    if (questionsFetchedRef.current || questionsLoaded || !domainSlug) return;
    
    questionsFetchedRef.current = true;
    
    const fetchQuestions = async () => {
      try {
        const questionsResponse = await fetch(`/api/openrouter/questions?domain=${domainSlug}&count=1`);
        const questionsResult = await questionsResponse.json();
        if (questionsResponse.ok && questionsResult.data) {
          setQuestions(questionsResult.data);
          if (questionsResult.data.length > 0) {
            setTestCaseContext(questionsResult.data[0].text);
          }
          setQuestionsLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        questionsFetchedRef.current = false; // Reset on error to allow retry
      }
    };
    
    fetchQuestions();
  }, [domainSlug]); // Removed questionsLoaded from dependencies
  
  // Initialize LLM evaluation (extracted function to prevent duplicate submissions)
  const initializeLLMEvaluation = useCallback(async () => {
    if (llmEvaluationStartedRef.current || isLLMEvaluating || hasExistingEvaluationRef.current) {
      return;
    }
    
    modelsFetchedRef.current = true;
    // For LLM judge: select 2 random models ONCE and use them for all questions
    try {
      const modelsResponse = await fetch('/api/openrouter/models');
      const modelsResult = await modelsResponse.json();
      if (modelsResponse.ok && modelsResult.data) {
        const shuffled = [...modelsResult.data].sort(() => Math.random() - 0.5);
        const selected2 = shuffled.slice(0, 2);
        setAvailableModels(selected2);
        
        // Select a random model as judge (different from the 2 being evaluated)
        const judgeModels = modelsResult.data.filter((m: OpenRouterModel) => 
          !selected2.some((s: OpenRouterModel) => s.id === m.id)
        );
        let judgeId = '';
        if (judgeModels.length > 0) {
          const randomJudge = judgeModels[Math.floor(Math.random() * judgeModels.length)];
          judgeId = randomJudge.id;
          setJudgeModelId(randomJudge.id);
        } else if (modelsResult.data.length > 0) {
          // Fallback: use any model if we can't find a different one
          const randomJudge = modelsResult.data[Math.floor(Math.random() * modelsResult.data.length)];
          judgeId = randomJudge.id;
          setJudgeModelId(randomJudge.id);
        }
        
        // Create standings for the 2 models being evaluated
        const modelStandings: ModelStanding[] = selected2.map((model: OpenRouterModel, idx: number) => {
          const provider = model.provider || getProviderFromModelId(model.id);
          const logo = getOrganizationLogo(provider);
          return {
            modelId: model.id,
            model: {
              id: model.id,
              name: model.name,
              slug: model.id,
              provider: provider,
              logo: logo,
              description: '',
              type: 'api-only' as const,
              contextLength: 0,
              costPer1MTokens: 0,
              verified: true,
              releaseDate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            rank: idx + 1,
            score: 1000,
            battles: 0,
            change: 0,
          };
        });
        setStandings(modelStandings);
        
        // Start automatic LLM evaluation (only once)
        if (judgeId && !llmEvaluationStartedRef.current) {
          llmEvaluationStartedRef.current = true;
          startLLMEvaluation(selected2.map((m: OpenRouterModel) => m.id), judgeId);
        }
      }
    } catch (error) {
      console.error('Error fetching models for LLM judge:', error);
    }
  }, [isLLMEvaluating]);

  // Initialize: Fetch models based on judge type
  useEffect(() => {
    const initialize = async () => {
      // Only proceed if we have questions loaded
      if (!questionsLoaded) return;
      
      // Prevent multiple fetches
      if (modelsFetchedRef.current) return;
      
      // For human judge: use selected models (exactly 2)
      // For LLM judge: select 2 random models from OpenRouter
      if (judgeType === 'human' && selectedModelIds.length === 2) {
        modelsFetchedRef.current = true;
        // Fetch model details from OpenRouter
        try {
          const modelsResponse = await fetch('/api/openrouter/models');
          const modelsResult = await modelsResponse.json();
          if (modelsResponse.ok && modelsResult.data) {
            const filtered = modelsResult.data.filter((m: OpenRouterModel) => 
              selectedModelIds.includes(m.id)
            );
            setAvailableModels(filtered);
            
            // Create standings from selected models
            const modelStandings: ModelStanding[] = filtered.map((model: OpenRouterModel, idx: number) => {
              const provider = model.provider || getProviderFromModelId(model.id);
              const logo = getOrganizationLogo(provider);
              return {
                modelId: model.id,
                model: {
                  id: model.id,
                  name: model.name,
                  slug: model.id,
                  provider: provider,
                  logo: logo,
                  description: '',
                  type: 'api-only' as const,
                  contextLength: 0,
                  costPer1MTokens: 0,
                  verified: true,
                  releaseDate: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                rank: idx + 1,
                score: 1000,
                battles: 0,
                change: 0,
              };
            });
            setStandings(modelStandings);
            
            // Select first two models for battle (ensure they're different)
            if (modelStandings.length >= 2) {
              const modelA = modelStandings[0];
              const modelB = modelStandings[1];
              
              // Validate models are different
              if (modelA.modelId !== modelB.modelId) {
                setCurrentModelA(modelA);
                setCurrentModelB(modelB);
              } else if (modelStandings.length >= 2) {
                // If first two are same, find a different one
                const differentModel = modelStandings.find(m => m.modelId !== modelA.modelId);
                if (differentModel) {
                  setCurrentModelA(modelA);
                  setCurrentModelB(differentModel);
                } else {
                  console.error('Cannot find two different models for battle');
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      } else if (judgeType === 'llm') {
        // Prevent duplicate LLM evaluations
        if (llmEvaluationStartedRef.current || isLLMEvaluating) {
          return;
        }
        
        // Don't start new evaluation if we have an existing one (from back navigation)
        if (hasExistingEvaluationRef.current) {
          return;
        }
        
        // Check if there's an evaluationId in URL - if so, wait for check to complete
        const urlEvalId = searchParams.get('evaluationId');
        if (urlEvalId && urlEvalId !== 'null' && !urlEvalId.startsWith('eval-')) {
          // Wait a bit for evaluation check to complete
          setTimeout(() => {
            if (!hasExistingEvaluationRef.current && !llmEvaluationStartedRef.current) {
              // Evaluation check completed, no existing evaluation found, proceed with initialization
              initializeLLMEvaluation();
            }
          }, 200);
          return;
        }
        
        // No evaluationId in URL, proceed with new evaluation
        initializeLLMEvaluation();
      } else {
        // Fallback: use existing standings API
        const fetchStandings = async () => {
          try {
            const response = await fetch(`/api/arena/${domainSlug}/standings`);
            const result = await response.json();
            
            if (response.ok && result.data) {
              setStandings(result.data);
              
              if (result.data.length >= 2) {
                const shuffled = [...result.data].sort(() => Math.random() - 0.5);
                const modelA = shuffled[0];
                // Ensure ModelB is different from ModelA
                const modelB = shuffled.find(m => m.modelId !== modelA?.modelId) || shuffled[1];
                
                if (modelA && modelB && modelA.modelId !== modelB.modelId) {
                  setCurrentModelA(modelA);
                  setCurrentModelB(modelB);
                } else {
                  console.error('Cannot find two different models for battle');
                }
              }
            }
          } catch (error) {
            console.error('Error fetching standings:', error);
          }
        };
        fetchStandings();
      }
    };

    initialize();
  }, [domainSlug, judgeType, questionsLoaded, initializeLLMEvaluation, searchParams]); // Added initializeLLMEvaluation and searchParams
  
  // Fetch results when battle is complete and standings are ready (separate effect to avoid duplicate calls)
  useEffect(() => {
    if (battleComplete && standings.length > 0 && !resultsFetchedRef.current) {
      resultsFetchedRef.current = true;
      fetchBattleResults();
    }
  }, [battleComplete, standings.length]);

  // Update question when battle index changes
  useEffect(() => {
    if (questions.length > 0 && battleIndex <= questions.length) {
      setTestCaseContext(questions[battleIndex - 1].text);
    }
  }, [battleIndex, questions]);

  // Generate responses when question or models change (for human judge)
  useEffect(() => {
    if (judgeType === 'human' && currentModelA && currentModelB && testCaseContext) {
      generateResponses();
    }
  }, [battleIndex, currentModelA, currentModelB, testCaseContext, judgeType]);

  const generateResponses = async () => {
    if (!currentModelA || !currentModelB || !testCaseContext) return;
    
    try {
      // Generate responses using our API endpoint
      const [responseAResult, responseBResult] = await Promise.all([
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: currentModelA.modelId,
            prompt: testCaseContext,
          }),
        }).then(res => res.json()),
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: currentModelB.modelId,
            prompt: testCaseContext,
          }),
        }).then(res => res.json()),
      ]);

      // Check for errors in responses
      if (!responseAResult.success) {
        setResponseA(`Error: ${responseAResult.error || 'Failed to generate response'}`);
      } else {
        setResponseA(responseAResult.content || 'Error generating response');
      }
      
      if (!responseBResult.success) {
        setResponseB(`Error: ${responseBResult.error || 'Failed to generate response'}`);
      } else {
        setResponseB(responseBResult.content || 'Error generating response');
      }
    } catch (error: any) {
      console.error('Error generating responses:', error);
      const errorMsg = error.message || 'Failed to generate response';
      setResponseA(`Error: ${errorMsg}`);
      setResponseB(`Error: ${errorMsg}`);
    }
  };

  const startLLMEvaluation = async (modelIds: string[], judgeId: string) => {
    // Prevent duplicate evaluations
    if (llmEvaluationStartedRef.current && isLLMEvaluating) {
      console.log('LLM evaluation already in progress, skipping...');
      return;
    }
    
    // Validate that we have at least 2 different models
    if (!modelIds || modelIds.length < 2) {
      console.error('[LLM Evaluation] Error: Need at least 2 models for evaluation');
      setIsLLMEvaluating(false);
      alert('Error: Please select at least 2 different models for evaluation');
      return;
    }
    
    // Ensure models are different
    const uniqueModelIds = [...new Set(modelIds)];
    if (uniqueModelIds.length < 2) {
      console.error('[LLM Evaluation] Error: Models must be different');
      setIsLLMEvaluating(false);
      alert('Error: Please select 2 different models for evaluation');
      return;
    }
    
    setIsLLMEvaluating(true);
    llmEvaluationStartedRef.current = true;
    
    // With 2 models, we have 1 battle per question, using the SAME 2 models for all questions
    const totalBattles = Math.min(1, questions.length);
    setLlmProgress({ current: 0, total: totalBattles });
    
    // Use the first 2 unique models
    const modelAId = uniqueModelIds[0];
    const modelBId = uniqueModelIds[1];
    
    console.log(`[LLM Evaluation] Starting evaluation with models: ${modelAId} vs ${modelBId}, Judge: ${judgeId}, Questions: ${questions.length}, Battles: ${totalBattles}`);

    let completedBattles = 0;
    let createdEvaluationId = evaluationId;

    // For each question, evaluate the 2 models
    for (let qIdx = 0; qIdx < totalBattles; qIdx++) {
      const question = questions[qIdx].text;
      
      try {
        console.log(`Starting battle ${qIdx + 1}/${totalBattles}: Generating responses...`);
        
        // Generate responses using our API endpoint with timeout
        const generateWithTimeout = async (modelId: string, prompt: string, timeout: number = 60000) => {
          return Promise.race([
            fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                modelId,
                prompt,
              }),
            }).then(res => res.json()),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        const [respAResult, respBResult] = await Promise.all([
          generateWithTimeout(modelAId, question).catch(err => ({
            success: false,
            error: err.message || 'Failed to generate response A',
            content: '',
          })),
          generateWithTimeout(modelBId, question).catch(err => ({
            success: false,
            error: err.message || 'Failed to generate response B',
            content: '',
          })),
        ]);

        // Check for errors in responses
        if (!respAResult.success || !respBResult.success) {
          console.error('Error generating responses for LLM evaluation:', {
            respA: respAResult.error,
            respB: respBResult.error,
          });
          // Still save the battle with a Tie result if responses failed
          const battleResponse = await fetch('/api/battles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domainSlug,
              modelAId,
              modelBId,
              responseA: respAResult.content || 'Error: ' + (respAResult.error || 'Failed to generate'),
              responseB: respBResult.content || 'Error: ' + (respBResult.error || 'Failed to generate'),
              winner: 'Tie',
              testCaseTitle: question,
              evaluationId: createdEvaluationId || undefined,
            }),
          });

          if (battleResponse.ok) {
            const battleResult = await battleResponse.json();
            if (battleResult.evaluationId) {
              createdEvaluationId = battleResult.evaluationId;
              setEvaluationId(battleResult.evaluationId);
            }
          }

          completedBattles++;
          setLlmProgress({ current: completedBattles, total: totalBattles });
          continue;
        }

        const respA = respAResult.content || '';
        const respB = respBResult.content || '';

        console.log(`Responses generated. Evaluating with judge ${judgeId}...`);

        // Evaluate with LLM judge with timeout
        const evalResponse = await Promise.race([
          fetch('/api/battles/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domainSlug,
              question,
              modelAId,
              modelBId,
              responseA: respA,
              responseB: respB,
              judgeModelId: judgeId,
            }),
          }),
          new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error('Evaluation timeout')), 60000)
          )
        ]).catch(err => {
          console.error('Error calling evaluate API:', err);
          return new Response(JSON.stringify({ 
            success: false, 
            error: err.message || 'Evaluation failed',
            winner: 'Tie' 
          }), { status: 200 });
        });

        const evalResult = await evalResponse.json();
        const winner = evalResult.winner || 'Tie';

        console.log(`Evaluation complete. Winner: ${winner}. Saving battle...`);

        // Save battle to MongoDB
        const battleResponse = await fetch('/api/battles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domainSlug,
            modelAId,
            modelBId,
            responseA: respA,
            responseB: respB,
            winner,
            testCaseTitle: question,
            evaluationId: createdEvaluationId || undefined,
          }),
        });

        // Get evaluation ID from battle response (always update to ensure we have the latest)
        if (battleResponse.ok) {
          const battleResult = await battleResponse.json();
          if (battleResult.evaluationId) {
            createdEvaluationId = battleResult.evaluationId;
            setEvaluationId(battleResult.evaluationId);
            // Update URL with evaluationId
            const url = new URL(window.location.href);
            url.searchParams.set('evaluationId', battleResult.evaluationId);
            window.history.replaceState({}, '', url.toString());
          }
          // Set flag to indicate battle was completed (for homepage refresh)
          sessionStorage.setItem('battleCompleted', 'true');
        } else {
          console.error('Failed to save battle:', await battleResponse.text());
        }

        completedBattles++;
        setLlmProgress({ current: completedBattles, total: totalBattles });
        console.log(`Battle ${qIdx + 1}/${totalBattles} completed.`);

        // Update standings
        setStandings(prev => {
          const updated = [...prev];
          const modelAIdx = updated.findIndex(s => s.modelId === modelAId);
          const modelBIdx = updated.findIndex(s => s.modelId === modelBId);
          
          if (modelAIdx >= 0 && modelBIdx >= 0) {
            if (winner === 'A') {
              updated[modelAIdx].score = (updated[modelAIdx].score || 1000) + 10;
              updated[modelBIdx].score = (updated[modelBIdx].score || 1000) - 10;
            } else if (winner === 'B') {
              updated[modelAIdx].score = (updated[modelAIdx].score || 1000) - 10;
              updated[modelBIdx].score = (updated[modelBIdx].score || 1000) + 10;
            }
            updated[modelAIdx].battles = (updated[modelAIdx].battles || 0) + 1;
            updated[modelBIdx].battles = (updated[modelBIdx].battles || 0) + 1;
          }
          
          return updated.sort((a, b) => (b.score || 0) - (a.score || 0)).map((s, i) => ({ ...s, rank: i + 1 }));
        });
      } catch (error: any) {
        console.error('Error in LLM evaluation:', error);
        // Update progress even on error
        completedBattles++;
        setLlmProgress({ current: completedBattles, total: totalBattles });
        
        // Try to save a battle with error state
        try {
          const battleResponse = await fetch('/api/battles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domainSlug,
              modelAId: modelIds[0],
              modelBId: modelIds[1],
              responseA: `Error: ${error.message || 'Unknown error'}`,
              responseB: `Error: ${error.message || 'Unknown error'}`,
              winner: 'Tie',
              testCaseTitle: questions[qIdx]?.text || 'Error',
              evaluationId: createdEvaluationId || undefined,
            }),
          });

          if (battleResponse.ok) {
            const battleResult = await battleResponse.json();
            if (battleResult.evaluationId) {
              createdEvaluationId = battleResult.evaluationId;
              setEvaluationId(battleResult.evaluationId);
            }
          }
        } catch (saveError) {
          console.error('Failed to save error battle:', saveError);
        }
      }
    }

    console.log('LLM evaluation complete. Redirecting to results...');
    setIsLLMEvaluating(false);
    
    // Ensure flag is set for homepage refresh (in case it wasn't set in the loop)
    sessionStorage.setItem('battleCompleted', 'true');
    
    // Wait a bit for the evaluation to be fully saved and stats to be calculated
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to results with judge model ID in URL
    const finalEvaluationId = createdEvaluationId || evaluationId;
    if (finalEvaluationId) {
      const judgeParam = judgeId ? `&judgeModelId=${encodeURIComponent(judgeId)}` : '';
      window.location.href = `/results/${finalEvaluationId}?domain=${domainSlug}${judgeParam}`;
    } else if (evaluationId) {
      // Use evaluationId from state if createdEvaluationId is not set
      const judgeParam = judgeId ? `&judgeModelId=${encodeURIComponent(judgeId)}` : '';
      window.location.href = `/results/${evaluationId}?domain=${domainSlug}${judgeParam}`;
    } else {
      // Fallback: try to get evaluation ID from domain
      window.location.href = `/results?domain=${domainSlug}`;
    }
  };

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
        if (battleResult.evaluationId) {
          setEvaluationId(battleResult.evaluationId);
          // Update URL with evaluationId so reload shows results
          const url = new URL(window.location.href);
          url.searchParams.set('evaluationId', battleResult.evaluationId);
          window.history.replaceState({}, '', url.toString());
        }
        // Set flag to indicate battle was completed (for homepage refresh)
        sessionStorage.setItem('battleCompleted', 'true');
      }
    } catch (error) {
      console.error('Error saving battle:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update standings
    setStandings(prevStandings => {
      if (!prevStandings || prevStandings.length === 0) {
        return prevStandings;
      }
      
      const updated = [...prevStandings];
      const modelAIdx = updated.findIndex(s => s.modelId === currentModelA.modelId);
      const modelBIdx = updated.findIndex(s => s.modelId === currentModelB.modelId);
      
      if (modelAIdx >= 0 && modelBIdx >= 0) {
        if (selectedVote === 'A') {
          updated[modelAIdx].score = (updated[modelAIdx].score || 1000) + 10;
          updated[modelBIdx].score = (updated[modelBIdx].score || 1000) - 10;
        } else if (selectedVote === 'B') {
          updated[modelAIdx].score = (updated[modelAIdx].score || 1000) - 10;
          updated[modelBIdx].score = (updated[modelBIdx].score || 1000) + 10;
        }
        updated[modelAIdx].battles = (updated[modelAIdx].battles || 0) + 1;
        updated[modelBIdx].battles = (updated[modelBIdx].battles || 0) + 1;
      }
      
      return updated.sort((a, b) => (b.score || 0) - (a.score || 0)).map((s, i) => ({ ...s, rank: i + 1 }));
    });
    
    if (battleIndex < totalBattles) {
      setBattleIndex(prev => prev + 1);
      setSelectedVote(null);
      
      // Select new models for next battle
      if (standings.length >= 2) {
        const shuffled = [...standings].sort(() => Math.random() - 0.5);
        setCurrentModelA(shuffled[0] || null);
        setCurrentModelB(shuffled[1] || shuffled[0] || null);
      }
    } else {
      // Battle complete - fetch and show results
      setBattleComplete(true);
      if (!resultsFetchedRef.current) {
        resultsFetchedRef.current = true;
        await fetchBattleResults();
      }
    }
    
    setSubmitting(false);
  };

  const fetchBattleResults = async () => {
    setLoadingRankings(true);
    try {
      // Fetch all domain rankings from API first to get actual battle counts
      const rankingsResponse = await fetch(`/api/rankings/${domainSlug}`);
      let allRankingsData: ModelStanding[] = [];
      
      if (rankingsResponse.ok) {
        const rankingsResult = await rankingsResponse.json();
        if (rankingsResult.data) {
          // Transform to ModelStanding format
          allRankingsData = rankingsResult.data.map((r: any) => {
            const provider = r.model?.provider || 'Unknown';
            const logo = r.model?.logo || getOrganizationLogo(provider);
            return {
              modelId: r.modelId || r.model?.id,
              model: {
                id: r.modelId || r.model?.id,
                name: r.model?.name || 'Unknown',
                slug: r.model?.slug || '',
                provider: provider,
                logo: logo,
                description: r.model?.description || '',
                type: 'api-only' as const,
                contextLength: r.model?.contextLength || 0,
                costPer1MTokens: r.model?.costPer1MTokens || 0,
                verified: r.model?.verified || false,
                releaseDate: r.model?.releaseDate || new Date(),
                createdAt: r.model?.createdAt || new Date(),
                updatedAt: r.model?.updatedAt || new Date(),
              },
              rank: r.rank || 0,
              score: r.eloScore || r.score || 0,
              battles: r.totalBattles || r.battles || 0,
              change: r.change || 0,
            };
          });
          setAllRankings(allRankingsData);
        }
      }
      
      // Get rankings for models in this battle (from standings - these are the models evaluated)
      // But use actual battle counts from the database rankings
      const battleRankingsData = [...standings]
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((s, i) => {
          // Find the actual ranking data from database to get real battle count
          const dbRanking = allRankingsData.find(r => r.modelId === s.modelId);
          return {
            ...s,
            rank: i + 1,
            battles: dbRanking?.battles || s.battles || 0, // Use database battle count if available
          };
        });
      setBattleRankings(battleRankingsData);
    } catch (error) {
      console.error('Error fetching battle results:', error);
    } finally {
      setLoadingRankings(false);
    }
  };

  // Show LLM evaluation progress
  if (judgeType === 'llm' && isLLMEvaluating) {
    return (
      <Layout showSidebar={true} sidebarType="leaderboard" standings={standings}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <div className="p-8 text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                LLM Judge Evaluation in Progress
              </h2>
              <p className="text-gray-600 mb-6">
                Evaluating 2 models with {questions.length} questions using LLM judge...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                  style={{
                    width: `${(llmProgress.current / llmProgress.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {llmProgress.current} of {llmProgress.total} battles completed
              </p>
              {judgeModelId && (
                <p className="text-sm text-gray-500 mt-2">
                  Using {availableModels.find(m => m.id === judgeModelId)?.name || judgeModelId} as judge
                </p>
              )}
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      showSidebar={true}
      sidebarType="leaderboard"
      standings={standings}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Battle View - Only show when battle is not complete */}
        {!battleComplete && (
          <>
            {/* Top Bar: Battle X of Y | Domain */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
              <span className="text-base sm:text-lg font-semibold text-black">
                Battle {battleIndex} of {totalBattles}
              </span>
              <span className="hidden xs:inline text-gray-400">|</span>
              <span className="text-sm sm:text-base md:text-lg font-medium text-dark-gray capitalize">
                {domainSlug.split('-').join(' ')}
              </span>
                {judgeType && (
                  <>
                    <span className="hidden xs:inline text-gray-400">|</span>
                    <span className="text-sm text-gray-600">
                      {judgeType === 'human' ? '👤 Human Judge' : '🤖 LLM Judge'}
                    </span>
                  </>
                )}
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
                    {testCaseContext || 'Loading question...'}
              </p>
            </div>
          </div>
        </Card>

        {/* Responses: Response 1 | Response 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Response 1 */}
          <Card 
                className={`transition-all ${
              selectedVote === 'A' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-md'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : judgeType === 'human' ? 'cursor-pointer' : ''}`}
                onClick={() => !submitting && judgeType === 'human' && setSelectedVote('A')}
          >
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Response 1</h4>
            </div>
            <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {responseA || 'Generating response...'}
                  </p>
            </div>
          </Card>

          {/* Response 2 */}
          <Card 
                className={`transition-all ${
              selectedVote === 'B' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-md'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : judgeType === 'human' ? 'cursor-pointer' : ''}`}
                onClick={() => !submitting && judgeType === 'human' && setSelectedVote('B')}
          >
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Response 2</h4>
            </div>
            <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {responseB || 'Generating response...'}
                  </p>
            </div>
          </Card>
        </div>

            {/* Voting Panel - Only show for human judge */}
            {judgeType === 'human' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Which response is better?</h3>

            {/* Vote Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Button
                variant={selectedVote === 'A' ? 'primary' : 'outline'}
                size="lg"
                      onClick={() => !submitting && setSelectedVote('A')}
                      disabled={submitting}
                className="h-16"
              >
                <span className="text-lg">Response 1</span>
              </Button>
              <Button
                variant={selectedVote === 'Tie' ? 'primary' : 'outline'}
                size="lg"
                      onClick={() => !submitting && setSelectedVote('Tie')}
                      disabled={submitting}
                className="h-16"
              >
                <span className="text-lg">Tie</span>
              </Button>
              <Button
                variant={selectedVote === 'B' ? 'primary' : 'outline'}
                size="lg"
                      onClick={() => !submitting && setSelectedVote('B')}
                      disabled={submitting}
                className="h-16"
              >
                <span className="text-lg">Response 2</span>
              </Button>
            </div>

            {/* Action Buttons */}
                  <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                      disabled={!selectedVote || submitting}
                loading={submitting}
              >
                Submit & Next
              </Button>
            </div>
          </div>
        </Card>
            )}

        {/* Live Leaderboard (shown after 2+ battles) */}
        {battleIndex > 2 && (
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Live Leaderboard (after {battleIndex - 1} battles):
              </h3>
              <div className="flex flex-wrap gap-4">
                {standings.slice(0, 5).map((standing, idx) => {
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
          </>
        )}

        {/* Battle Complete - Results View */}
        {battleComplete && (
          <div className="space-y-8 mt-8">
            {/* Section 1: Battle-Specific Rankings */}
            <Card>
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Battle Results
                  </h2>
                  <p className="text-gray-600">
                    Rankings of models evaluated in this battle session
                  </p>
                </div>

                {loadingRankings ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Loading rankings...</p>
                  </div>
                ) : battleRankings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Battles
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {battleRankings.map((standing) => (
                          <tr key={standing.modelId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-lg font-bold text-primary-600">
                                #{standing.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={standing.model.logo}
                                  alt={standing.model.provider}
                                  size="md"
                                  shape="square"
                                  fallback={standing.model.provider.charAt(0)}
                                />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {standing.model.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {standing.model.provider}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-lg font-semibold text-gray-900">
                                {standing.score.toFixed(0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {standing.battles}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No rankings available
                  </div>
                )}
              </div>
            </Card>

            {/* Section 2: All Models Rankings */}
            <Card>
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Overall Rankings
                  </h2>
                  <p className="text-gray-600">
                    Complete rankings of all models in {domainSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} domain
                  </p>
                </div>

                {loadingRankings ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Loading rankings...</p>
                  </div>
                ) : allRankings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Battles
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allRankings.map((standing) => {
                          const isInBattle = battleRankings.some(br => br.modelId === standing.modelId);
                          return (
                            <tr 
                              key={standing.modelId} 
                              className={`hover:bg-gray-50 ${isInBattle ? 'bg-primary-50' : ''}`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-lg font-bold ${isInBattle ? 'text-primary-700' : 'text-gray-900'}`}>
                                  #{standing.rank}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    src={standing.model.logo}
                                    alt={standing.model.provider}
                                    size="md"
                                    shape="square"
                                    fallback={standing.model.provider.charAt(0)}
                                  />
                                  <div>
                                    <p className={`font-medium ${isInBattle ? 'text-primary-900' : 'text-gray-900'}`}>
                                      {standing.model.name}
                                      {isInBattle && (
                                        <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded">
                                          In This Battle
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {standing.model.provider}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-lg font-semibold ${isInBattle ? 'text-primary-700' : 'text-gray-900'}`}>
                                  {standing.score.toFixed(0)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">
                                  {standing.battles}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No rankings available
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="primary"
                onClick={() => {
                  // Reset all flags and state for new battle
                  setBattleComplete(false);
                  setBattleIndex(1);
                  setSelectedVote(null);
                  setEvaluationId(null);
                  evaluationCheckedRef.current = false;
                  hasExistingEvaluationRef.current = false;
                  llmEvaluationStartedRef.current = false;
                  modelsFetchedRef.current = false;
                  questionsFetchedRef.current = false;
                  resultsFetchedRef.current = false;
                  // Reset to start new battle
                  window.location.href = `/arena/${domainSlug}`;
                }}
              >
                Start New Battle
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (evaluationId) {
                    window.location.href = `/results/${evaluationId}?domain=${domainSlug}`;
                  } else {
                    window.location.href = `/rankings/${domainSlug}`;
                  }
                }}
              >
                View Full Results
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArenaBattlePage;
