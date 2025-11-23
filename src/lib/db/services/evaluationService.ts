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
    .populate('modelId')
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

  return {
    evaluation: evaluationData,
    battles,
    rankings: rankings.map((r: any) => {
      const model = r.modelId || {};
      const organization = model.organizationId || {};
      const organizationName = organization.name || 'Unknown';
      const modelName = model.name || 'Unknown Model';
      const modelSlug = model.slug || '';
      
      // Get organization logo
      const organizationLogo = getOrganizationLogo(organizationName);
      
      return {
        rank: r.rank,
        previousRank: r.rank,
        model: {
          id: model._id?.toString() || model.id?.toString() || '',
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
    }),
    winLossMatrix,
    totalBattles: battles.length,
    completedBattles: battles.filter((b: any) => b.status === 'completed').length,
    modelsTested: new Set(battles.flatMap((b: any) => [
      b.modelAId._id.toString(),
      b.modelBId._id.toString()
    ])).size,
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
