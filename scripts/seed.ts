import mongoose from 'mongoose';
import connectDB from '../src/lib/db/connect';
import Domain from '../src/lib/db/models/Domain';
import Model from '../src/lib/db/models/Model';
import Organization from '../src/lib/db/models/Organization';
import ModelRanking from '../src/lib/db/models/ModelRanking';
import TestCase from '../src/lib/db/models/TestCase';
import Evaluation from '../src/lib/db/models/Evaluation';
import Battle, { BattleWinner } from '../src/lib/db/models/Battle';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await Battle.deleteMany({});
    await Evaluation.deleteMany({});
    await Domain.deleteMany({});
    await Model.deleteMany({});
    await Organization.deleteMany({});
    await ModelRanking.deleteMany({});
    await TestCase.deleteMany({});
    console.log('Cleared existing data');

    // Create Organizations
    console.log('Creating organizations...');
    const openai = await Organization.create({
      name: 'OpenAI',
    });
    const anthropic = await Organization.create({
      name: 'Anthropic',
    });
    const google = await Organization.create({
      name: 'Google',
    });
    const meta = await Organization.create({
      name: 'Meta',
    });
    const mistral = await Organization.create({
      name: 'Mistral AI',
    });
    console.log('Created organizations');

    // Create Domains
    console.log('Creating domains...');
    const domainsData = [
      {
        name: 'Code Generation',
        slug: 'code-generation',
        description: 'Generate, debug, and optimize code across multiple programming languages',
        icon: '💻',
        isActive: true,
      },
      {
        name: 'Mathematical Reasoning',
        slug: 'mathematical-reasoning',
        description: 'Solve complex mathematical problems and explain step-by-step solutions',
        icon: '🔢',
        isActive: true,
      },
      {
        name: 'Creative Writing',
        slug: 'creative-writing',
        description: 'Generate creative content including stories, poems, and scripts',
        icon: '✍️',
        isActive: true,
      },
      {
        name: 'Data Analysis',
        slug: 'data-analysis',
        description: 'Analyze datasets, create visualizations, and derive insights',
        icon: '📊',
        isActive: true,
      },
      {
        name: 'Language Translation',
        slug: 'language-translation',
        description: 'Translate text accurately across multiple languages',
        icon: '🌍',
        isActive: true,
      },
      {
        name: 'Question Answering',
        slug: 'question-answering',
        description: 'Answer factual questions with accurate and relevant information',
        icon: '❓',
        isActive: true,
      },
      {
        name: 'Medical Assistance',
        slug: 'medical-assistance',
        description: 'Healthcare chatbots and medical information in regional languages',
        icon: '🏥',
        isActive: true,
      },
      {
        name: 'Legal Document Analysis',
        slug: 'legal-analysis',
        description: 'Analyze legal documents and provide insights',
        icon: '⚖️',
        isActive: true,
      },
      {
        name: 'Finance',
        slug: 'finance',
        description: 'Financial analysis, forecasting, and market insights',
        icon: '💰',
        isActive: true,
      },
      {
        name: 'Educational Content',
        slug: 'education',
        description: 'Create and explain educational content for students',
        icon: '📚',
        isActive: true,
      },
      {
        name: 'Customer Support',
        slug: 'customer-support',
        description: 'Automated customer service and support conversations',
        icon: '💬',
        isActive: true,
      },
      {
        name: 'Content Moderation',
        slug: 'content-moderation',
        description: 'Detect inappropriate content and enforce community guidelines',
        icon: '🛡️',
        isActive: true,
      },
    ];
    const domains = await Domain.insertMany(domainsData);
    console.log('Created domains');

    // Create Models
    console.log('Creating models...');
    const modelsData = [
      {
        name: 'GPT-4',
        slug: 'gpt-4',
        organizationId: openai._id,
        description: 'OpenAI\'s most capable model with advanced reasoning',
        version: '4.0',
        strengths: [
          'Excellent reasoning and problem-solving capabilities',
          'Strong performance across diverse tasks',
          'Advanced code generation and debugging',
          'Comprehensive knowledge base',
        ],
        weaknesses: [
          'Higher latency compared to smaller models',
          'More expensive per token',
          'Occasional hallucinations in complex scenarios',
        ],
        pricing: {
          inputCostPer1MTokens: 30.0,
          outputCostPer1MTokens: 60.0,
        },
        isActive: true,
      },
      {
        name: 'GPT-4 Turbo',
        slug: 'gpt-4-turbo',
        organizationId: openai._id,
        description: 'Faster and more efficient version of GPT-4',
        version: '4-turbo',
        strengths: [
          'Faster response times than GPT-4',
          'Lower cost while maintaining quality',
          'Better context window handling',
          'Improved instruction following',
        ],
        weaknesses: [
          'Slightly less nuanced than GPT-4',
          'May struggle with very complex reasoning',
        ],
        pricing: {
          inputCostPer1MTokens: 10.0,
          outputCostPer1MTokens: 30.0,
        },
        isActive: true,
      },
      {
        name: 'GPT-3.5 Turbo',
        slug: 'gpt-3-5-turbo',
        organizationId: openai._id,
        description: 'Fast and efficient model for general tasks',
        version: '3.5-turbo',
        strengths: [
          'Very fast response times',
          'Cost-effective for high-volume use',
          'Good general-purpose performance',
          'Wide API availability',
        ],
        weaknesses: [
          'Less capable than GPT-4 models',
          'Limited reasoning depth',
          'May miss nuanced instructions',
        ],
        pricing: {
          inputCostPer1MTokens: 0.5,
          outputCostPer1MTokens: 1.5,
        },
        isActive: true,
      },
      {
        name: 'Claude 3 Opus',
        slug: 'claude-3-opus',
        organizationId: anthropic._id,
        description: 'Anthropic\'s most powerful model',
        version: '3-opus',
        strengths: [
          'Superior long-form content generation',
          'Excellent safety and ethical considerations',
          'Strong mathematical reasoning',
          'Outstanding creative writing capabilities',
        ],
        weaknesses: [
          'Higher cost than other Claude models',
          'Slower response times',
          'Limited availability in some regions',
        ],
        pricing: {
          inputCostPer1MTokens: 15.0,
          outputCostPer1MTokens: 75.0,
        },
        isActive: true,
      },
      {
        name: 'Claude 3 Sonnet',
        slug: 'claude-3-sonnet',
        organizationId: anthropic._id,
        description: 'Balanced performance and speed',
        version: '3-sonnet',
        strengths: [
          'Good balance of speed and capability',
          'Strong instruction following',
          'Reliable performance across tasks',
          'Better pricing than Opus',
        ],
        weaknesses: [
          'Not as powerful as Opus',
          'May struggle with very complex tasks',
        ],
        pricing: {
          inputCostPer1MTokens: 3.0,
          outputCostPer1MTokens: 15.0,
        },
        isActive: true,
      },
      {
        name: 'Claude 3 Haiku',
        slug: 'claude-3-haiku',
        organizationId: anthropic._id,
        description: 'Fast and efficient model',
        version: '3-haiku',
        strengths: [
          'Very fast response times',
          'Cost-effective for simple tasks',
          'Good for high-volume applications',
          'Low latency',
        ],
        weaknesses: [
          'Limited capability for complex tasks',
          'May lack depth in responses',
          'Not suitable for advanced reasoning',
        ],
        pricing: {
          inputCostPer1MTokens: 0.25,
          outputCostPer1MTokens: 1.25,
        },
        isActive: true,
      },
      {
        name: 'Gemini Pro',
        slug: 'gemini-pro',
        organizationId: google._id,
        description: 'Google\'s advanced multimodal model',
        version: '1.0-pro',
        strengths: [
          'Multimodal capabilities (text, images, audio)',
          'Strong performance on Google services',
          'Good code generation',
          'Competitive pricing',
        ],
        weaknesses: [
          'May have limitations in some domains',
          'Less established than GPT-4',
          'Variable performance across tasks',
        ],
        pricing: {
          inputCostPer1MTokens: 0.5,
          outputCostPer1MTokens: 1.5,
        },
        isActive: true,
      },
      {
        name: 'Gemini Ultra',
        slug: 'gemini-ultra',
        organizationId: google._id,
        description: 'Google\'s most capable model',
        version: '1.0-ultra',
        strengths: [
          'Top-tier multimodal performance',
          'Excellent reasoning capabilities',
          'Strong integration with Google ecosystem',
          'Advanced code understanding',
        ],
        weaknesses: [
          'Higher cost',
          'Limited availability',
          'Newer model with less testing',
        ],
        pricing: {
          inputCostPer1MTokens: 7.0,
          outputCostPer1MTokens: 21.0,
        },
        isActive: true,
      },
      {
        name: 'Llama 3 70B',
        slug: 'llama-3-70b',
        organizationId: meta._id,
        description: 'Meta\'s open-source large language model',
        version: '3-70b',
        strengths: [
          'Open-source and free to use',
          'Good performance for its size',
          'Customizable and fine-tunable',
          'No API costs for self-hosting',
        ],
        weaknesses: [
          'Requires significant computational resources',
          'May need fine-tuning for specific tasks',
          'Less polished than commercial models',
        ],
        pricing: {
          inputCostPer1MTokens: 0.0,
          outputCostPer1MTokens: 0.0,
        },
        isActive: true,
      },
      {
        name: 'Llama 3 8B',
        slug: 'llama-3-8b',
        organizationId: meta._id,
        description: 'Meta\'s efficient open-source model',
        version: '3-8b',
        strengths: [
          'Lightweight and fast',
          'Can run on consumer hardware',
          'Open-source and free',
          'Good for simple tasks',
        ],
        weaknesses: [
          'Limited capability compared to larger models',
          'May struggle with complex reasoning',
          'Requires optimization for production',
        ],
        pricing: {
          inputCostPer1MTokens: 0.0,
          outputCostPer1MTokens: 0.0,
        },
        isActive: true,
      },
      {
        name: 'Mistral Large',
        slug: 'mistral-large',
        organizationId: mistral._id,
        description: 'Mistral AI\'s most capable model',
        version: 'large',
        strengths: [
          'Strong multilingual capabilities',
          'Good code generation',
          'Competitive pricing',
          'Fast inference',
        ],
        weaknesses: [
          'Less established than major providers',
          'May have limitations in some domains',
          'Smaller community support',
        ],
        pricing: {
          inputCostPer1MTokens: 2.0,
          outputCostPer1MTokens: 6.0,
        },
        isActive: true,
      },
      {
        name: 'Mistral Medium',
        slug: 'mistral-medium',
        organizationId: mistral._id,
        description: 'Balanced performance model',
        version: 'medium',
        strengths: [
          'Good balance of cost and performance',
          'Fast response times',
          'Multilingual support',
          'Efficient token usage',
        ],
        weaknesses: [
          'Not as powerful as Large variant',
          'Limited advanced reasoning',
        ],
        pricing: {
          inputCostPer1MTokens: 0.6,
          outputCostPer1MTokens: 1.8,
        },
        isActive: true,
      },
    ];
    const models = await Model.insertMany(modelsData);
    console.log('Created models');

    // Create Model Rankings for Code Generation domain
    console.log('Creating model rankings...');
    const codeGenDomain = domains.find((d: any) => d.slug === 'code-generation');
    if (codeGenDomain) {
      const codeGenRankings = [
        {
          domainId: codeGenDomain._id,
          modelId: models.find((m: any) => m.slug === 'gpt-4')!._id,
          rank: 1,
          eloScore: 1850,
          wins: 245,
          losses: 45,
          ties: 10,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
        {
          domainId: codeGenDomain._id,
          modelId: models.find((m: any) => m.slug === 'claude-3-opus')!._id,
          rank: 2,
          eloScore: 1820,
          wins: 230,
          losses: 55,
          ties: 15,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
        {
          domainId: codeGenDomain._id,
          modelId: models.find((m: any) => m.slug === 'gpt-4-turbo')!._id,
          rank: 3,
          eloScore: 1790,
          wins: 220,
          losses: 65,
          ties: 15,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
        {
          domainId: codeGenDomain._id,
          modelId: models.find((m: any) => m.slug === 'gemini-ultra')!._id,
          rank: 4,
          eloScore: 1760,
          wins: 210,
          losses: 75,
          ties: 15,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
        {
          domainId: codeGenDomain._id,
          modelId: models.find((m: any) => m.slug === 'claude-3-sonnet')!._id,
          rank: 5,
          eloScore: 1730,
          wins: 200,
          losses: 85,
          ties: 15,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
      ];
      await ModelRanking.insertMany(codeGenRankings);
    }

    // Create rankings for Mathematical Reasoning
    const mathDomain = domains.find((d: any) => d.slug === 'mathematical-reasoning');
    if (mathDomain) {
      const mathRankings = [
        {
          domainId: mathDomain._id,
          modelId: models.find((m: any) => m.slug === 'claude-3-opus')!._id,
          rank: 1,
          eloScore: 1880,
          wins: 255,
          losses: 35,
          ties: 10,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
        {
          domainId: mathDomain._id,
          modelId: models.find((m: any) => m.slug === 'gpt-4')!._id,
          rank: 2,
          eloScore: 1850,
          wins: 240,
          losses: 50,
          ties: 10,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
        {
          domainId: mathDomain._id,
          modelId: models.find((m: any) => m.slug === 'gemini-ultra')!._id,
          rank: 3,
          eloScore: 1820,
          wins: 225,
          losses: 65,
          ties: 10,
          totalBattles: 300,
          lastBattleAt: new Date(),
        },
      ];
      await ModelRanking.insertMany(mathRankings);
    }
    
    // Create Model Rankings for Customer Support domain
    const customerSupportDomain = domains.find((d: any) => d.slug === 'customer-support');
    if (customerSupportDomain) {
      const customerSupportRankings = [
        {
          domainId: customerSupportDomain._id,
          modelId: models.find((m: any) => m.slug === 'gpt-4')!._id,
          rank: 1,
          eloScore: 1820,
          wins: 220,
          losses: 50,
          ties: 10,
          totalBattles: 280,
          lastBattleAt: new Date(),
        },
        {
          domainId: customerSupportDomain._id,
          modelId: models.find((m: any) => m.slug === 'claude-3-opus')!._id,
          rank: 2,
          eloScore: 1790,
          wins: 205,
          losses: 60,
          ties: 10,
          totalBattles: 275,
          lastBattleAt: new Date(),
        },
        {
          domainId: customerSupportDomain._id,
          modelId: models.find((m: any) => m.slug === 'gpt-4-turbo')!._id,
          rank: 3,
          eloScore: 1760,
          wins: 190,
          losses: 70,
          ties: 10,
          totalBattles: 270,
          lastBattleAt: new Date(),
        },
        {
          domainId: customerSupportDomain._id,
          modelId: models.find((m: any) => m.slug === 'claude-3-sonnet')!._id,
          rank: 4,
          eloScore: 1730,
          wins: 175,
          losses: 80,
          ties: 10,
          totalBattles: 265,
          lastBattleAt: new Date(),
        },
        {
          domainId: customerSupportDomain._id,
          modelId: models.find((m: any) => m.slug === 'gemini-pro')!._id,
          rank: 5,
          eloScore: 1700,
          wins: 160,
          losses: 90,
          ties: 10,
          totalBattles: 260,
          lastBattleAt: new Date(),
        },
      ];
      await ModelRanking.insertMany(customerSupportRankings);
    }
    
    // Create Model Rankings for Content Moderation domain
    const contentModDomain = domains.find((d: any) => d.slug === 'content-moderation');
    if (contentModDomain) {
      const contentModRankings = [
        {
          domainId: contentModDomain._id,
          modelId: models.find((m: any) => m.slug === 'claude-3-opus')!._id,
          rank: 1,
          eloScore: 1780,
          wins: 180,
          losses: 30,
          ties: 10,
          totalBattles: 220,
          lastBattleAt: new Date(),
        },
        {
          domainId: contentModDomain._id,
          modelId: models.find((m: any) => m.slug === 'gpt-4')!._id,
          rank: 2,
          eloScore: 1750,
          wins: 165,
          losses: 35,
          ties: 10,
          totalBattles: 210,
          lastBattleAt: new Date(),
        },
        {
          domainId: contentModDomain._id,
          modelId: models.find((m: any) => m.slug === 'gpt-4-turbo')!._id,
          rank: 3,
          eloScore: 1720,
          wins: 150,
          losses: 40,
          ties: 10,
          totalBattles: 200,
          lastBattleAt: new Date(),
        },
        {
          domainId: contentModDomain._id,
          modelId: models.find((m: any) => m.slug === 'claude-3-sonnet')!._id,
          rank: 4,
          eloScore: 1680,
          wins: 140,
          losses: 45,
          ties: 15,
          totalBattles: 200,
          lastBattleAt: new Date(),
        },
      ];
      await ModelRanking.insertMany(contentModRankings);
    }

    // Create Test Cases
    console.log('Creating test cases...');
    if (codeGenDomain) {
      const codeGenTestCases = [
        {
          domainId: codeGenDomain._id,
          title: 'Implement a binary search tree',
          prompt: 'Implement a binary search tree class in Python with insert, search, and delete methods.',
          expectedCriteria: {
            correctness: 'The implementation should correctly handle all operations',
            efficiency: 'Operations should be O(log n) average case',
            codeQuality: 'Code should be clean and well-documented',
          },
          difficulty: 'medium',
          tags: ['python', 'data-structures', 'algorithms'],
          isActive: true,
        },
        {
          domainId: codeGenDomain._id,
          title: 'Create a REST API endpoint',
          prompt: 'Create a REST API endpoint in Node.js/Express that handles user authentication with JWT tokens.',
          expectedCriteria: {
            security: 'Proper authentication and authorization',
            errorHandling: 'Comprehensive error handling',
            documentation: 'Clear API documentation',
          },
          difficulty: 'hard',
          tags: ['nodejs', 'express', 'api', 'authentication'],
          isActive: true,
        },
      ];
      await TestCase.insertMany(codeGenTestCases);
    }

    if (mathDomain) {
      const mathTestCases = [
        {
          domainId: mathDomain._id,
          title: 'Solve quadratic equation',
          prompt: 'Solve the quadratic equation 2x² + 5x - 3 = 0 and explain each step.',
          expectedCriteria: {
            accuracy: 'Correct solution',
            explanation: 'Clear step-by-step explanation',
            method: 'Proper use of quadratic formula',
          },
          difficulty: 'easy',
          tags: ['algebra', 'quadratic'],
          isActive: true,
        },
        {
          domainId: mathDomain._id,
          title: 'Calculate derivative',
          prompt: 'Find the derivative of f(x) = x³ + 2x² - 5x + 1 and explain the process.',
          expectedCriteria: {
            accuracy: 'Correct derivative',
            explanation: 'Clear explanation of derivative rules',
            steps: 'Show all intermediate steps',
          },
          difficulty: 'medium',
          tags: ['calculus', 'derivatives'],
          isActive: true,
        },
      ];
      await TestCase.insertMany(mathTestCases);
    }
    console.log('Created test cases');

    // Create Evaluations and Battles
    console.log('Creating evaluations and battles...');
    const allTestCases = await TestCase.find({}).lean();
    
    // Create evaluations for each domain
    const evaluations = [];
    for (const domain of domains) {
      const evaluation = await Evaluation.create({
        domainId: domain._id,
        status: 'completed',
        totalBattles: 0,
        completedBattles: 0,
      });
      evaluations.push(evaluation);
    }

    // Create battles for models in each domain
    const battlePromises = [];
    const winners = [BattleWinner.MODEL_A, BattleWinner.MODEL_B, BattleWinner.TIE];
    
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      const evaluation = evaluations[i];
      const domainTestCases = allTestCases.filter((tc: any) => 
        tc.domainId.toString() === domain._id.toString()
      );
      
           // Get all models that have rankings for this domain
           const domainRankings = await ModelRanking.find({ domainId: domain._id }).lean();
           const domainModelIds = domainRankings.map((r: any) => r.modelId.toString());
           const domainModels = models.filter((m: any) => 
             domainModelIds.includes(m._id.toString())
           );
           
           // If no rankings exist for this domain, skip creating battles
           if (domainModels.length === 0) {
             continue;
           }

      if (domainModels.length < 2 || domainTestCases.length === 0) {
        continue;
      }

      // Create battles between different model pairs
      for (let j = 0; j < domainModels.length; j++) {
        for (let k = j + 1; k < domainModels.length; k++) {
          const modelA = domainModels[j];
          const modelB = domainModels[k];
          
          // Create 5-10 battles per model pair
          const numBattles = Math.floor(Math.random() * 6) + 5;
          
          for (let b = 0; b < numBattles; b++) {
            const testCase = domainTestCases[Math.floor(Math.random() * domainTestCases.length)];
            const winner = winners[Math.floor(Math.random() * winners.length)];
            
            // Generate dummy responses
            const responseA = `Response from ${modelA.name} for test case: ${testCase.title}`;
            const responseB = `Response from ${modelB.name} for test case: ${testCase.title}`;
            
            // Create battle with random date in the past 30 days
            const battleDate = new Date();
            battleDate.setDate(battleDate.getDate() - Math.floor(Math.random() * 30));
            
            battlePromises.push(
              Battle.create({
                evaluationId: evaluation._id,
                domainId: domain._id,
                testCaseId: testCase._id,
                modelAId: modelA._id,
                modelBId: modelB._id,
                responseA,
                responseB,
                winner,
                judgeCount: Math.floor(Math.random() * 10) + 5,
                status: 'completed',
                createdAt: battleDate,
                updatedAt: battleDate,
              })
            );
          }
        }
      }
    }

    // Execute all battle creation promises
    await Promise.all(battlePromises);
    
    // Update evaluation counts
    for (const evaluation of evaluations) {
      const battleCount = await Battle.countDocuments({ evaluationId: evaluation._id });
      await Evaluation.findByIdAndUpdate(evaluation._id, {
        totalBattles: battleCount,
        completedBattles: battleCount,
      });
    }
    
    console.log('Created evaluations and battles');

    console.log('\n✅ Seed data created successfully!');
    console.log(`\nCreated:`);
    console.log(`- ${(await Organization.countDocuments())} organizations`);
    console.log(`- ${(await Domain.countDocuments())} domains`);
    console.log(`- ${(await Model.countDocuments())} models`);
    console.log(`- ${(await ModelRanking.countDocuments())} model rankings`);
    console.log(`- ${(await TestCase.countDocuments())} test cases`);
    console.log(`- ${(await Evaluation.countDocuments())} evaluations`);
    console.log(`- ${(await Battle.countDocuments())} battles`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
