'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-5xl font-bold mb-4">About Langscope</h1>
            <p className="text-xl text-primary-100">
              Battle-tested LLM rankings with data integrity verification
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mission */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Langscope is a transparent, community-driven platform for evaluating Large Language Models (LLMs) 
              across multiple domains. We believe that AI evaluation should be fair, verifiable, and accessible to everyone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By combining battle-based evaluation with secure data verification, we ensure that every ranking 
              is backed by real performance data and cannot be manipulated.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Battle Arena</h3>
                  <p className="text-gray-700">
                    Two anonymous models compete by responding to the same prompt. Users vote for the better response.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Elo Ranking System</h3>
                  <p className="text-gray-700">
                    Battle results update model rankings using the Elo rating system, the same system used in chess.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Verification</h3>
                  <p className="text-gray-700">
                    All evaluation results are hashed and stored securely in the database to ensure data integrity and tamper-proof records.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Domain-Specific Evaluation</h3>
                <p className="text-gray-700 text-sm">
                  Test models on specialized tasks like code generation, math reasoning, and creative writing.
                </p>
              </div>
              
              <div>
                <div className="text-3xl mb-2">⚔️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Battle-Based Testing</h3>
                <p className="text-gray-700 text-sm">
                  Head-to-head comparisons reveal which models truly perform better.
                </p>
              </div>
              
              <div>
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Verified</h3>
                <p className="text-gray-700 text-sm">
                  Cryptographic hashes ensure rankings cannot be manipulated or deleted.
                </p>
              </div>
              
              <div>
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparent Rankings</h3>
                <p className="text-gray-700 text-sm">
                  All evaluation data and methodology are publicly available.
                </p>
              </div>
              
              <div>
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 mb-2">Community-Driven</h3>
                <p className="text-gray-700 text-sm">
                  Anyone can participate in evaluations and contribute to rankings.
                </p>
              </div>
              
              <div>
                <div className="text-3xl mb-2">🏢</div>
                <h3 className="font-semibold text-gray-900 mb-2">Enterprise Ready</h3>
                <p className="text-gray-700 text-sm">
                  Custom evaluations, private test suites, and team management features.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Langscope is built with modern web technologies and decentralized infrastructure:
            </p>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-primary-600">●</span>
                <span><strong>Frontend:</strong> React, Next.js, TypeScript, Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary-600">●</span>
                <span><strong>Backend:</strong> Next.js API Routes, MongoDB, Mongoose</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary-600">●</span>
                <span><strong>Database:</strong> MongoDB with Mongoose ODM, secure data hashing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary-600">●</span>
                <span><strong>Authentication:</strong> JWT-based secure authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

