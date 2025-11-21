'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Model } from '@/types';

function CompareContent() {
  const searchParams = useSearchParams();
  const modelIds = useMemo(() => searchParams.get('models')?.split(',') || [], [searchParams]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMockModels = useCallback(async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock model data
    const mockModelsData: Record<string, Partial<Model>> = {
      'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'OpenAI', costPer1MTokens: 10.0, contextLength: 128000 },
      'claude-3-opus': { name: 'Claude 3 Opus', provider: 'Anthropic', costPer1MTokens: 15.0, contextLength: 200000 },
      'gemini-pro': { name: 'Gemini Pro', provider: 'Google', costPer1MTokens: 7.0, contextLength: 32000 },
      'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'OpenAI', costPer1MTokens: 0.5, contextLength: 16000 },
      'claude-3-sonnet': { name: 'Claude 3 Sonnet', provider: 'Anthropic', costPer1MTokens: 3.0, contextLength: 200000 },
    };
    
    const fetchedModels = modelIds.map(id => ({
      id,
      name: mockModelsData[id]?.name || id,
      slug: id,
      provider: mockModelsData[id]?.provider || 'Unknown',
      logo: '🤖',
      description: `${mockModelsData[id]?.name || id} model`,
      type: 'proprietary' as const,
      contextLength: mockModelsData[id]?.contextLength || 8000,
      costPer1MTokens: mockModelsData[id]?.costPer1MTokens || 0,
      verified: true,
      releaseDate: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    }));
    
    setModels(fetchedModels);
    setLoading(false);
  }, [modelIds]);

  useEffect(() => {
    fetchMockModels();
  }, [fetchMockModels]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading models...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Model Comparison</h1>
          <p className="text-lg text-gray-600">
            Comparing {models.length} {models.length === 1 ? 'model' : 'models'} side by side
          </p>
        </div>

        {models.length === 0 ? (
          <Card>
            <div className="p-6">
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No models selected for comparison</p>
                <Button variant="primary" className="mt-4" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Feature
                      </th>
                      {models.map(model => (
                        <th key={model.id} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {model.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Provider */}
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Provider</td>
                      {models.map(model => (
                        <td key={model.id} className="px-6 py-4 text-gray-700">{model.provider}</td>
                      ))}
                    </tr>
                    
                    {/* Cost */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Cost per 1M tokens</td>
                      {models.map(model => (
                        <td key={model.id} className="px-6 py-4 text-gray-700">
                          ${model.costPer1MTokens.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Context Length */}
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Context Length</td>
                      {models.map(model => (
                        <td key={model.id} className="px-6 py-4 text-gray-700">
                          {model.contextLength.toLocaleString()} tokens
                        </td>
                      ))}
                    </tr>
                    
                    {/* Type */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Type</td>
                      {models.map(model => (
                        <td key={model.id} className="px-6 py-4">
                          <Badge 
                            label={model.type} 
                            variant={model.type === 'open-source' ? 'success' : 'info'}
                          />
                        </td>
                      ))}
                    </tr>
                    
                    {/* Verified */}
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Verified</td>
                      {models.map(model => (
                        <td key={model.id} className="px-6 py-4">
                          {model.verified ? (
                            <Badge label="✓ Verified" variant="success" />
                          ) : (
                            <Badge label="Not verified" variant="default" />
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                ← Back to Rankings
              </Button>
              <Button variant="primary" onClick={() => window.location.href = '/arena'}>
                Test in Arena →
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default function ComparePage() {
  return (
    <React.Suspense fallback={
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    }>
      <CompareContent />
    </React.Suspense>
  );
}

