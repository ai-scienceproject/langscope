'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';

interface JudgeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJudge: (judgeType: 'human' | 'llm', selectedModels?: string[]) => void;
  domainSlug: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

const JudgeSelectionModal: React.FC<JudgeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectJudge,
}) => {
  const [judgeType, setJudgeType] = useState<'human' | 'llm' | null>(null);
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen && judgeType === 'human') {
      fetchOpenRouterModels();
    }
  }, [isOpen, judgeType]);

  const fetchOpenRouterModels = async () => {
    setLoadingModels(true);
    try {
      const response = await fetch('/api/openrouter/models');
      const result = await response.json();
      if (response.ok && result.data) {
        setAvailableModels(result.data);
      } else {
        console.error('Failed to fetch OpenRouter models:', result.error);
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      } else if (prev.length < 2) {
        return [...prev, modelId];
      }
      return prev;
    });
  };

  // Extract unique providers from models
  const providers = useMemo(() => {
    const providerSet = new Set<string>();
    availableModels.forEach((model) => {
      // Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
      const parts = model.id.split('/');
      if (parts.length > 1) {
        providerSet.add(parts[0]);
      } else {
        providerSet.add('other');
      }
    });
    return Array.from(providerSet).sort();
  }, [availableModels]);

  // Filter models based on search query and provider
  const filteredModels = useMemo(() => {
    let filtered = availableModels;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query) ||
          (model.description && model.description.toLowerCase().includes(query))
      );
    }

    // Filter by provider
    if (providerFilter !== 'all') {
      filtered = filtered.filter((model) => {
        const parts = model.id.split('/');
        const provider = parts.length > 1 ? parts[0] : 'other';
        return provider === providerFilter;
      });
    }

    return filtered;
  }, [availableModels, searchQuery, providerFilter]);

  const handleContinue = () => {
    if (judgeType === 'human' && selectedModels.length !== 2) {
      alert('Please select exactly 2 models');
      return;
    }
    if (judgeType === 'llm') {
      onSelectJudge('llm');
    } else {
      onSelectJudge('human', selectedModels);
    }
    // Reset state
    setJudgeType(null);
    setSelectedModels([]);
    setSearchQuery('');
    setProviderFilter('all');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={judgeType === 'human' ? 'Select Models' : judgeType === 'llm' ? 'LLM Judge' : 'Select Judge Type'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Judge Type Selection */}
        {!judgeType && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Choose how you want to evaluate the battle:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all p-6 ${
                  judgeType === 'human'
                    ? 'ring-2 ring-primary-600 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setJudgeType('human')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👤</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Human Judge
                  </h3>
                  <p className="text-sm text-gray-600">
                    You will manually evaluate responses and select winners
                  </p>
                </div>
              </Card>

              <Card
                className={`cursor-pointer transition-all p-6 ${
                  judgeType === 'llm'
                    ? 'ring-2 ring-primary-600 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setJudgeType('llm')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    LLM Judge
                  </h3>
                  <p className="text-sm text-gray-600">
                    An AI model will automatically evaluate responses
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Model Selection for Human Judge */}
        {judgeType === 'human' && (
          <div className="space-y-4">
            <div>
              {selectedModels.length > 0 && (
                <p className="text-sm text-primary-600 mb-4">
                  {selectedModels.length} of 2 models selected
                </p>
              )}
            </div>

            {loadingModels ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Loading models...</p>
              </div>
            ) : availableModels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No models available. Please try again later.
              </div>
            ) : (
              <>
                {/* Search and Filter Section */}
                <div className="space-y-3">
                  <SearchBar
                    placeholder="Search models by name or ID..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    size="sm"
                  />
                  
                  {/* Provider Filter */}
                  {providers.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600 font-medium">Filter by provider:</span>
                      <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="all">All Providers</option>
                        {providers.map((provider) => (
                          <option key={provider} value={provider}>
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Results count */}
                  <p className="text-xs text-gray-500">
                    Showing {filteredModels.length} of {availableModels.length} models
                  </p>
                </div>

                {/* Model List */}
                <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4">
                  {filteredModels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No models match your search criteria. Try adjusting your filters.
                    </div>
                  ) : (
                    filteredModels.map((model) => {
                  const isSelected = selectedModels.includes(model.id);
                  const isDisabled = !isSelected && selectedModels.length >= 2;
                  return (
                    <div
                      key={model.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                      onClick={() => !isDisabled && handleModelToggle(model.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {model.name}
                            </h4>
                            {isSelected && (
                              <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                          {model.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {model.description}
                            </p>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (!isDisabled) {
                              handleModelToggle(model.id);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                  })
                  )}
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button variant="ghost" onClick={() => setJudgeType(null)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={selectedModels.length !== 2}
              >
                {selectedModels.length === 2 
                  ? 'Start Battle with 2 Models'
                  : `Select ${2 - selectedModels.length} more model${2 - selectedModels.length === 1 ? '' : 's'}`
                }
              </Button>
            </div>
          </div>
        )}

        {/* LLM Judge Confirmation */}
        {judgeType === 'llm' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p>
                  <strong>LLM Judge Mode:</strong> The system will automatically:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Select 2 random models to evaluate</li>
                  <li>Select 1 random question from OpenRouter</li>
                  <li>Use a random LLM as judge to evaluate all answers</li>
                  <li>Show results after all evaluations are complete</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button variant="ghost" onClick={() => setJudgeType(null)}>
                Back
              </Button>
              <Button variant="primary" onClick={handleContinue}>
                Start LLM Judge Battle
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JudgeSelectionModal;

