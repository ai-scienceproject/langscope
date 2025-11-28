import { NextRequest, NextResponse } from 'next/server';
import { createBattle } from '@/lib/db/services/battleService';
import { createEvaluation } from '@/lib/db/services/evaluationService';
import { getDomainBySlug } from '@/lib/db/services/domainService';
import { getModelById, getModelBySlug, createModel } from '@/lib/db/services/modelService';
import { updateRanking, getModelRanking } from '@/lib/db/services/rankingService';
import { BattleWinner } from '@/lib/db/models/Battle';
import TestCase from '@/lib/db/models/TestCase';
import ModelRanking from '@/lib/db/models/ModelRanking';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';
import Organization from '@/lib/db/models/Organization';

// ELO rating system constants
const K_FACTOR = 32; // Standard K-factor for ELO calculations
const INITIAL_ELO = 1500;

// Calculate expected score (probability of winning)
function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Calculate new ELO rating
function calculateNewElo(currentElo: number, expectedScore: number, actualScore: number): number {
  return Math.round(currentElo + K_FACTOR * (actualScore - expectedScore));
}

// Update model rankings after a battle
async function updateModelRankingsAfterBattle(
  domainId: string,
  modelAId: string,
  modelBId: string,
  winner: BattleWinner | undefined
) {
  try {
    await connectDB();
    
    // Get current rankings for both models
    const rankingA = await getModelRanking(domainId, modelAId);
    const rankingB = await getModelRanking(domainId, modelBId);
    
    // Get current ELO scores (default to 1500 if no ranking exists)
    const eloA = (rankingA as any)?.eloScore || INITIAL_ELO;
    const eloB = (rankingB as any)?.eloScore || INITIAL_ELO;
    
    // Calculate expected scores
    const expectedA = calculateExpectedScore(eloA, eloB);
    const expectedB = calculateExpectedScore(eloB, eloA);
    
    // Determine actual scores based on winner
    let actualScoreA = 0.5; // Tie
    let actualScoreB = 0.5; // Tie
    
    if (winner === BattleWinner.MODEL_A) {
      actualScoreA = 1.0; // Win
      actualScoreB = 0.0; // Loss
    } else if (winner === BattleWinner.MODEL_B) {
      actualScoreA = 0.0; // Loss
      actualScoreB = 1.0; // Win
    }
    
    // Calculate new ELO scores
    const newEloA = calculateNewElo(eloA, expectedA, actualScoreA);
    const newEloB = calculateNewElo(eloB, expectedB, actualScoreB);
    
    // Get current stats
    const currentWinsA = (rankingA as any)?.wins || 0;
    const currentLossesA = (rankingA as any)?.losses || 0;
    const currentTiesA = (rankingA as any)?.ties || 0;
    const currentBattlesA = (rankingA as any)?.totalBattles || 0;
    
    const currentWinsB = (rankingB as any)?.wins || 0;
    const currentLossesB = (rankingB as any)?.losses || 0;
    const currentTiesB = (rankingB as any)?.ties || 0;
    const currentBattlesB = (rankingB as any)?.totalBattles || 0;
    
    // Update stats for Model A
    let newWinsA = currentWinsA;
    let newLossesA = currentLossesA;
    let newTiesA = currentTiesA;
    
    if (winner === BattleWinner.MODEL_A) {
      newWinsA = currentWinsA + 1;
    } else if (winner === BattleWinner.MODEL_B) {
      newLossesA = currentLossesA + 1;
    } else {
      newTiesA = currentTiesA + 1;
    }
    
    // Update stats for Model B
    let newWinsB = currentWinsB;
    let newLossesB = currentLossesB;
    let newTiesB = currentTiesB;
    
    if (winner === BattleWinner.MODEL_B) {
      newWinsB = currentWinsB + 1;
    } else if (winner === BattleWinner.MODEL_A) {
      newLossesB = currentLossesB + 1;
    } else {
      newTiesB = currentTiesB + 1;
    }
    
    // Update Model A ranking
    await updateRanking(domainId, modelAId, {
      eloScore: newEloA,
      wins: newWinsA,
      losses: newLossesA,
      ties: newTiesA,
      totalBattles: currentBattlesA + 1,
      lastBattleAt: new Date(),
    });
    
    // Update Model B ranking
    await updateRanking(domainId, modelBId, {
      eloScore: newEloB,
      wins: newWinsB,
      losses: newLossesB,
      ties: newTiesB,
      totalBattles: currentBattlesB + 1,
      lastBattleAt: new Date(),
    });
    
    // Recalculate ranks for all models in this domain
    await recalculateRanks(domainId);
    
  } catch (error) {
    console.error('Error updating model rankings:', error);
    // Don't throw - battle is already saved, ranking update can fail silently
  }
}

// Get or create a model from OpenRouter model ID
async function getOrCreateModelFromOpenRouterId(openRouterId: string) {
  await connectDB();
  
  // Check if it's already a MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(openRouterId) && openRouterId.length === 24) {
    const model = await getModelById(openRouterId);
    if (model) return model;
  }
  
  // Try to find by slug (OpenRouter ID used as slug)
  const existingModel = await getModelBySlug(openRouterId.toLowerCase());
  if (existingModel) {
    return existingModel;
  }
  
  // Extract provider name from OpenRouter ID (e.g., "x-ai/grok-4.1-fast:free" -> "x-ai")
  const providerName = openRouterId.split('/')[0] || 'OpenRouter';
  const modelName = openRouterId.split('/').pop()?.split(':')[0] || openRouterId;
  
  // Find or create organization
  let organization = await Organization.findOne({ name: providerName }).lean();
  if (!organization) {
    organization = await Organization.create({ name: providerName });
  }
  const organizationId = (organization as any)._id?.toString() || (organization as any).id?.toString();
  
  // Create new model
  const newModel = await createModel({
    name: modelName,
    slug: openRouterId.toLowerCase(),
    organizationId: organizationId,
    description: `OpenRouter model: ${openRouterId}`,
    isActive: true,
  });
  
  return newModel;
}

// Recalculate ranks for all models in a domain based on ELO scores
async function recalculateRanks(domainId: string) {
  try {
    await connectDB();
    
    // Get all rankings for this domain, sorted by ELO score (descending)
    const rankings = await ModelRanking.find({ domainId: new mongoose.Types.ObjectId(domainId) })
      .sort({ eloScore: -1 })
      .lean();
    
    // Update ranks based on sorted order
    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i];
      // modelId is stored as ObjectId in the schema
      const modelIdObj = (ranking as any).modelId;
      const modelId = modelIdObj?.toString() || (modelIdObj?._id?.toString());
      
      if (modelId) {
        await ModelRanking.findOneAndUpdate(
          { 
            domainId: new mongoose.Types.ObjectId(domainId), 
            modelId: new mongoose.Types.ObjectId(modelId) 
          },
          { rank: i + 1 },
          { new: true }
        );
      }
    }
  } catch (error) {
    console.error('Error recalculating ranks:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      domainSlug,
      modelAId,
      modelBId,
      responseA,
      responseB,
      winner, // 'A', 'B', or 'Tie'
      testCaseTitle,
      evaluationId, // Optional - if not provided, will create/find one
    } = body;

    // Get domain
    const domainResult = await getDomainBySlug(domainSlug);
    if (!domainResult) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }
    const domain = Array.isArray(domainResult) ? domainResult[0] : domainResult;
    const domainId = (domain as any)._id?.toString() || (domain as any).id?.toString();

    // Get models by ID (handle both MongoDB ObjectIds and OpenRouter model IDs)
    let modelA, modelB;
    if (modelAId) {
      // Check if it's a MongoDB ObjectId or OpenRouter ID
      if (mongoose.Types.ObjectId.isValid(modelAId) && modelAId.length === 24) {
        modelA = await getModelById(modelAId);
      } else {
        // It's an OpenRouter model ID, get or create the model
        modelA = await getOrCreateModelFromOpenRouterId(modelAId);
      }
    }
    if (modelBId) {
      // Check if it's a MongoDB ObjectId or OpenRouter ID
      if (mongoose.Types.ObjectId.isValid(modelBId) && modelBId.length === 24) {
        modelB = await getModelById(modelBId);
      } else {
        // It's an OpenRouter model ID, get or create the model
        modelB = await getOrCreateModelFromOpenRouterId(modelBId);
      }
    }
    
    if (!modelA || !modelB) {
      return NextResponse.json({ error: 'Model not found or could not be created' }, { status: 404 });
    }
    
    const modelAIdStr = (modelA as any)._id?.toString() || (modelA as any).id?.toString();
    const modelBIdStr = (modelB as any)._id?.toString() || (modelB as any).id?.toString();

    // Validate that ModelA and ModelB are different
    if (modelAIdStr === modelBIdStr) {
      return NextResponse.json(
        { error: 'ModelA and ModelB must be different models' },
        { status: 400 }
      );
    }

    // Get or create evaluation
    const EvaluationModel = (await import('@/lib/db/models/Evaluation')).default;
    let evalId = evaluationId;
    
    // Check if evaluationId is provided and is a valid MongoDB ObjectId
    if (evalId && !evalId.startsWith('eval-') && mongoose.Types.ObjectId.isValid(evalId)) {
      // Try to find existing evaluation
      const existingEval = await EvaluationModel.findById(evalId);
      if (existingEval) {
        // Use existing evaluation
        evalId = (existingEval as any)._id.toString();
      } else {
        // Invalid ID, create new one
        evalId = null;
      }
    } else {
      // Check if there's an existing in-progress evaluation for this domain
      const existingEval = await EvaluationModel.findOne({
        domainId: new mongoose.Types.ObjectId(domainId),
        status: 'in-progress',
      }).sort({ createdAt: -1 }); // Get the most recent one
      
      if (existingEval) {
        evalId = (existingEval as any)._id.toString();
      } else {
        // Create a new evaluation for this domain
        const evaluation = await createEvaluation({
          domainId: domainId,
          status: 'in-progress',
          totalBattles: 0,
          completedBattles: 0,
        });
        evalId = (evaluation as any)._id.toString();
      }
    }

    // Get a test case for this domain (or create a dummy one)
    let testCase = await TestCase.findOne({ domainId: new mongoose.Types.ObjectId(domainId) }).lean();
    if (!testCase) {
      // Create a minimal test case if none exists
      const newTestCase = await TestCase.create({
        domainId: new mongoose.Types.ObjectId(domainId),
        title: testCaseTitle || 'Arena Battle Test Case',
        prompt: testCaseTitle || 'Compare the two responses',
        expectedCriteria: {},
        difficulty: 'medium',
        tags: [],
        isActive: true,
      });
      testCase = newTestCase.toObject();
    }
    const testCaseId = (testCase as any)._id?.toString() || (testCase as any).id?.toString();

    // Convert winner format
    let battleWinner: BattleWinner | undefined;
    if (winner === 'A') {
      battleWinner = BattleWinner.MODEL_A;
    } else if (winner === 'B') {
      battleWinner = BattleWinner.MODEL_B;
    } else if (winner === 'Tie') {
      battleWinner = BattleWinner.TIE;
    }

    // Create battle with winner
    const battle = await createBattle({
      evaluationId: evalId,
      domainId: domainId,
      testCaseId: testCaseId,
      modelAId: modelAIdStr,
      modelBId: modelBIdStr,
      responseA: responseA || 'Response A',
      responseB: responseB || 'Response B',
      winner: battleWinner,
      status: 'completed',
      judgeCount: 1,
    });

    // Update evaluation battle counts
    const BattleModel = (await import('@/lib/db/models/Battle')).default;
    
    const evaluation = await EvaluationModel.findById(evalId);
    if (evaluation) {
      const totalBattles = await BattleModel.countDocuments({ evaluationId: evalId });
      const completedBattles = await BattleModel.countDocuments({ 
        evaluationId: evalId,
        status: 'completed'
      });
      
      await EvaluationModel.findByIdAndUpdate(evalId, {
        totalBattles,
        completedBattles,
      });
    }

    // Update ModelRanking for both models (wins, losses, ties, ELO scores, battle history)
    await updateModelRankingsAfterBattle(
      domainId,
      modelAIdStr,
      modelBIdStr,
      battleWinner
    );

    return NextResponse.json({
      success: true,
      battleId: (battle as any)._id.toString(),
      evaluationId: evalId,
    });
  } catch (error: any) {
    console.error('Error creating battle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create battle' },
      { status: 500 }
    );
  }
}

