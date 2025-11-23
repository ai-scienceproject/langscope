import connectDB from '../connect';
import Battle from '../models/Battle';
import mongoose from 'mongoose';

export async function getBattlesByEvaluation(evaluationId: string) {
  await connectDB();
  return Battle.find({ evaluationId })
    .populate('modelAId')
    .populate('modelBId')
    .populate('testCaseId')
    .populate('domainId')
    .sort({ createdAt: -1 })
    .lean();
}

export async function getBattleById(id: string) {
  await connectDB();
  return Battle.findById(id)
    .populate('modelAId')
    .populate('modelBId')
    .populate('testCaseId')
    .populate('domainId')
    .populate('judgeVotes')
    .lean();
}

export async function getBattleHistory(modelId: string, domainId?: string) {
  await connectDB();
  const query: any = {
    $or: [
      { modelAId: new mongoose.Types.ObjectId(modelId) },
      { modelBId: new mongoose.Types.ObjectId(modelId) }
    ]
  };
  
  if (domainId) {
    query.domainId = new mongoose.Types.ObjectId(domainId);
  }
  
  return Battle.find(query)
    .populate('modelAId')
    .populate('modelBId')
    .populate('domainId')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export async function createBattle(data: {
  evaluationId: string;
  domainId: string;
  testCaseId: string;
  modelAId: string;
  modelBId: string;
  responseA: string;
  responseB: string;
  winner?: string;
  status?: string;
  judgeCount?: number;
}) {
  await connectDB();
  return Battle.create(data);
}

export async function updateBattleWinner(id: string, winner: 'MODEL_A' | 'MODEL_B' | 'TIE') {
  await connectDB();
  return Battle.findByIdAndUpdate(
    id,
    { winner, status: 'completed' },
    { new: true }
  ).lean();
}
