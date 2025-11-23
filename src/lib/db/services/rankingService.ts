import connectDB from '../connect';
import ModelRanking from '../models/ModelRanking';
import Model from '../models/Model';
import Organization from '../models/Organization';

export async function getRankingsByDomain(domainId: string) {
  await connectDB();
  return ModelRanking.find({ domainId })
    .populate({
      path: 'modelId',
      model: Model,
      populate: {
        path: 'organizationId',
        model: Organization
      }
    })
    .sort({ rank: 1 })
    .lean();
}

export async function getModelRanking(domainId: string, modelId: string) {
  await connectDB();
  if (!domainId || domainId === '') {
    // If no domainId provided, return null (can't get ranking without domain)
    return null;
  }
  return ModelRanking.findOne({ domainId, modelId })
    .populate({
      path: 'modelId',
      model: Model,
      populate: {
        path: 'organizationId',
        model: Organization
      }
    })
    .lean();
}

export async function updateRanking(domainId: string, modelId: string, data: {
  rank?: number;
  eloScore?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  totalBattles?: number;
  lastBattleAt?: Date;
}) {
  await connectDB();
  return ModelRanking.findOneAndUpdate(
    { domainId, modelId },
    data,
    { upsert: true, new: true }
  ).lean();
}

