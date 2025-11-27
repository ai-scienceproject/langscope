import connectDB from '../connect';
import Evaluation from '../models/Evaluation';
import Battle from '../models/Battle';
import ModelRanking from '../models/ModelRanking';
import mongoose from 'mongoose';
import { getOrganizationLogo } from '@/lib/utils/modelIcons';

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
}

export async function getEvaluationById(id: string) {
  await connectDB();
  
  // Check if ID is a valid ObjectId
  if (!isValidObjectId(id)) {
    return null;
  }
  
  return Evaluation.findById(id)
    .populate('userId')
    .populate('domainId')
    .lean();
}

export async function getEvaluationStats(id: string) {
  await connectDB();
  
  // Check if ID is a valid ObjectId
  if (!isValidObjectId(id)) {
    return null;
  }
  
  const evaluationResult = await Evaluation.findById(id).populate('domainId').lean();
  if (!evaluationResult) {
    return null;
  }

  // Handle case where result might be an array
  const evaluation = Array.isArray(evaluationResult) ? evaluationResult[0] : evaluationResult;
  const evaluationData = evaluation as any;
  const domainId = evaluationData.domainId?._id?.toString() || evaluationData.domainId?.toString();

  // Get all battles for this evaluation
  const battles = await Battle.find({ evaluationId: id })
    .populate('modelAId')
    .populate('modelBId')
    .populate('testCaseId')
    .lean();

  // Get rankings for the domain
  const rankings = domainId ? await ModelRanking.find({ domainId })
    .populate({
      path: 'modelId',
      populate: {
        path: 'organizationId',
        model: 'Organization'
      }
    })
    .sort({ rank: 1 })
    .lean() : [];

  // Calculate win/loss matrix
  const winLossMatrix: Record<string, Record<string, { wins: number; losses: number }>> = {};
  
  battles.forEach((battle: any) => {
    if (!battle.modelAId || !battle.modelBId || !battle.winner) return;
    
    const modelAId = battle.modelAId._id?.toString() || battle.modelAId.toString();
    const modelBId = battle.modelBId._id?.toString() || battle.modelBId.toString();
    
    if (!winLossMatrix[modelAId]) {
      winLossMatrix[modelAId] = {};
    }
    if (!winLossMatrix[modelBId]) {
      winLossMatrix[modelBId] = {};
    }
    
    if (!winLossMatrix[modelAId][modelBId]) {
      winLossMatrix[modelAId][modelBId] = { wins: 0, losses: 0 };
    }
    if (!winLossMatrix[modelBId][modelAId]) {
      winLossMatrix[modelBId][modelAId] = { wins: 0, losses: 0 };
    }
    
    if (battle.winner === 'MODEL_A') {
      winLossMatrix[modelAId][modelBId].wins++;
      winLossMatrix[modelBId][modelAId].losses++;
    } else if (battle.winner === 'MODEL_B') {
      winLossMatrix[modelAId][modelBId].losses++;
      winLossMatrix[modelBId][modelAId].wins++;
    }
  });

  // Get unique model IDs from battles in this evaluation
  const evaluationModelIds = new Set<string>();
  battles.forEach((battle: any) => {
    if (battle.modelAId) {
      // Handle both populated and non-populated cases
      let modelAId: string | null = null;
      if (typeof battle.modelAId === 'object' && battle.modelAId._id) {
        modelAId = battle.modelAId._id.toString();
      } else if (typeof battle.modelAId === 'string') {
        modelAId = battle.modelAId;
      } else if (battle.modelAId) {
        modelAId = battle.modelAId.toString();
      }
      if (modelAId) {
        evaluationModelIds.add(modelAId);
      }
    }
    if (battle.modelBId) {
      // Handle both populated and non-populated cases
      let modelBId: string | null = null;
      if (typeof battle.modelBId === 'object' && battle.modelBId._id) {
        modelBId = battle.modelBId._id.toString();
      } else if (typeof battle.modelBId === 'string') {
        modelBId = battle.modelBId;
      } else if (battle.modelBId) {
        modelBId = battle.modelBId.toString();
      }
      if (modelBId) {
        evaluationModelIds.add(modelBId);
      }
    }
  });
  
  console.log(`[Evaluation Stats] Found ${battles.length} battles with ${evaluationModelIds.size} unique models`);
  if (battles.length > 0) {
    console.log(`[Evaluation Stats] Battle breakdown:`);
    battles.slice(0, 5).forEach((battle: any, idx: number) => {
      const modelAId = battle.modelAId?._id?.toString() || battle.modelAId?.toString() || 'unknown';
      const modelBId = battle.modelBId?._id?.toString() || battle.modelBId?.toString() || 'unknown';
      console.log(`  Battle ${idx + 1}: ModelA=${modelAId.substring(0, 8)}..., ModelB=${modelBId.substring(0, 8)}...`);
    });
  }

  // Transform all rankings
  const transformedRankings = rankings.map((r: any) => {
      const model = r.modelId || {};
      let organizationName = 'Unknown';
      
      // Try to get organization name from populated organizationId
      if (model.organizationId) {
        if (typeof model.organizationId === 'object' && model.organizationId.name) {
          organizationName = model.organizationId.name;
        } else if (typeof model.organizationId === 'string') {
          // If organizationId is just an ID string, we can't get the name without another query
          // But we can try to extract from slug for OpenRouter models
        }
      }
      
      // For OpenRouter models, extract provider from slug (e.g., "x-ai/grok-4.1-fast:free" -> "x-ai")
      const modelSlug = model.slug || '';
      if (organizationName === 'Unknown' && modelSlug.includes('/')) {
        const slugParts = modelSlug.split('/');
        if (slugParts.length > 0) {
          organizationName = slugParts[0];
        }
      }
      
      const modelName = model.name || 'Unknown Model';
      
      // Get organization logo
      const organizationLogo = getOrganizationLogo(organizationName);
      
      // Get model ID - ensure consistent format
      const modelId = model._id?.toString() || model.id?.toString() || '';
      
      return {
        rank: r.rank,
        previousRank: r.rank,
        model: {
          id: modelId,
          name: modelName,
          slug: modelSlug,
          provider: organizationName,
          logo: organizationLogo,
          description: model.description || '',
          type: 'api-only' as const,
          contextLength: 128000,
          costPer1MTokens: 0,
          verified: true,
          releaseDate: model.createdAt || new Date(),
          createdAt: model.createdAt || new Date(),
          updatedAt: model.updatedAt || new Date(),
        },
      score: r.eloScore,
      uncertainty: 15,
      battleCount: r.totalBattles,
      winRate: r.totalBattles > 0 ? (r.wins / r.totalBattles) * 100 : 0,
      };
    });

  // Filter rankings to only include models tested in this evaluation
  // Only include models that actually participated in battles
  const evaluationRankingsFromRankings = transformedRankings
    .filter((r: any) => {
      const modelId = r.model.id || '';
      return evaluationModelIds.has(modelId);
    });

  // Find models in battles that don't have rankings yet
  const rankingModelIds = new Set(transformedRankings.map((r: any) => r.model.id));
  const missingModelIds = Array.from(evaluationModelIds).filter(id => !rankingModelIds.has(id));
  
  // For models without rankings, fetch model info and create placeholder entries
  const Model = (await import('../models/Model')).default;
  const missingRankings = await Promise.all(
    missingModelIds.map(async (modelId: string) => {
      try {
        const modelResult = await Model.findById(modelId)
          .populate('organizationId')
          .lean();
        
        if (!modelResult) return null;
        
        // Handle case where result might be an array
        const model = Array.isArray(modelResult) ? modelResult[0] : modelResult;
        if (!model) return null;
        
        const organization = (model as any).organizationId || {};
        const organizationName = organization.name || 'Unknown';
        const modelSlug = model.slug || '';
        
        // Extract provider from slug if organization name is Unknown
        let providerName = organizationName;
        if (providerName === 'Unknown' && modelSlug.includes('/')) {
          const slugParts = modelSlug.split('/');
          if (slugParts.length > 0) {
            providerName = slugParts[0];
          }
        }
        
        const organizationLogo = getOrganizationLogo(providerName);
        
        // Count battles for this model in this evaluation
        const modelBattles = battles.filter((b: any) => {
          const battleModelAId = b.modelAId?._id?.toString() || b.modelAId?.toString() || '';
          const battleModelBId = b.modelBId?._id?.toString() || b.modelBId?.toString() || '';
          return battleModelAId === modelId || battleModelBId === modelId;
        });
        
        // Calculate wins/losses/ties from battles
        let wins = 0;
        let losses = 0;
        let ties = 0;
        modelBattles.forEach((battle: any) => {
          const battleModelAId = battle.modelAId?._id?.toString() || battle.modelAId?.toString() || '';
          const isModelA = battleModelAId === modelId;
          
          if (battle.winner === 'MODEL_A') {
            if (isModelA) wins++;
            else losses++;
          } else if (battle.winner === 'MODEL_B') {
            if (isModelA) losses++;
            else wins++;
          } else {
            ties++;
          }
        });
        
        const totalBattles = modelBattles.length;
        const eloScore = 1500; // Default ELO for models without rankings
        const modelData = model as any;
        
        return {
          rank: 999, // Will be re-ranked
          previousRank: 999,
          model: {
            id: modelId,
            name: modelData.name || 'Unknown Model',
            slug: modelSlug,
            provider: providerName,
            logo: organizationLogo,
            description: modelData.description || '',
            type: 'api-only' as const,
            contextLength: 128000,
            costPer1MTokens: 0,
            verified: true,
            releaseDate: modelData.createdAt || new Date(),
            createdAt: modelData.createdAt || new Date(),
            updatedAt: modelData.updatedAt || new Date(),
          },
          score: eloScore,
          uncertainty: 15,
          battleCount: totalBattles,
          winRate: totalBattles > 0 ? (wins / totalBattles) * 100 : 0,
          wins: wins,
          losses: losses,
          ties: ties,
        };
      } catch (error) {
        console.error(`Error fetching model ${modelId} for evaluation ranking:`, error);
        return null;
      }
    })
  );
  
  // Combine rankings from ModelRanking collection with missing models
  const allEvaluationRankings = [
    ...evaluationRankingsFromRankings,
    ...missingRankings.filter(r => r !== null)
  ]
    .sort((a: any, b: any) => b.score - a.score)
    .map((r: any, idx: number) => ({
      ...r,
      rank: idx + 1, // Re-rank within evaluation
    }));
  
  // Final verification: ensure evaluationRankings only contains models from battles
  // This is critical - filter out any models that weren't actually in battles
  const evaluationRankings = allEvaluationRankings.filter((r: any) => {
    const modelId = r.model.id || '';
    const isValid = evaluationModelIds.has(modelId);
    if (!isValid) {
      console.log(`[Evaluation Stats] Removing invalid model from evaluationRankings: ${modelId} (${r.model.name || 'Unknown'})`);
    }
    return isValid;
  });
  
  // Debug logging
  if (evaluationRankings.length !== evaluationModelIds.size && evaluationModelIds.size > 0) {
    console.log('[Evaluation Stats] Evaluation rankings count mismatch:');
    console.log(`- Expected ${evaluationModelIds.size} models, found ${evaluationRankings.length} in evaluationRankings`);
    const foundModelIds = new Set(evaluationRankings.map((r: any) => r.model.id));
    const stillMissing = Array.from(evaluationModelIds).filter(id => !foundModelIds.has(id));
    if (stillMissing.length > 0) {
      console.log('- Still missing model IDs:', stillMissing.slice(0, 5));
    }
  } else {
    console.log(`[Evaluation Stats] Successfully filtered evaluationRankings: ${evaluationRankings.length} models (expected: ${evaluationModelIds.size})`);
  }

  // Get the latest battle to identify the current battle's models
  const latestBattle = battles.length > 0 
    ? battles.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })[0]
    : null;
  
  // Extract model IDs from the latest battle
  const currentBattleModelIds = new Set<string>();
  if (latestBattle) {
    const modelAId = latestBattle.modelAId?._id?.toString() || latestBattle.modelAId?.toString() || '';
    const modelBId = latestBattle.modelBId?._id?.toString() || latestBattle.modelBId?.toString() || '';
    if (modelAId) currentBattleModelIds.add(modelAId);
    if (modelBId) currentBattleModelIds.add(modelBId);
  }
  
  // Filter evaluationRankings to only show models from the current/latest battle
  const currentBattleRankings = evaluationRankings.filter((r: any) => {
    const modelId = r.model.id || '';
    return currentBattleModelIds.has(modelId);
  }).sort((a: any, b: any) => b.score - a.score)
    .map((r: any, idx: number) => ({
      ...r,
      rank: idx + 1, // Re-rank within current battle
    }));

  return {
    evaluation: evaluationData,
    battles,
    rankings: transformedRankings,
    evaluationRankings,
    currentBattleRankings, // Rankings for only the current battle's models
    winLossMatrix,
    totalBattles: battles.length,
    completedBattles: battles.filter((b: any) => b.status === 'completed').length,
    modelsTested: evaluationModelIds.size,
  };
}

export async function createEvaluation(data: {
  userId?: string;
  domainId: string;
  status?: string;
  totalBattles?: number;
  completedBattles?: number;
}) {
  await connectDB();
  return Evaluation.create(data);
}
