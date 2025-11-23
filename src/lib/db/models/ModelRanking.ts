import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IModelRanking extends Document {
  domainId: Types.ObjectId;
  modelId: Types.ObjectId;
  rank: number;
  eloScore: number;
  wins: number;
  losses: number;
  ties: number;
  totalBattles: number;
  lastBattleAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ModelRankingSchema = new Schema<IModelRanking>(
  {
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    eloScore: {
      type: Number,
      required: true,
      default: 1500,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    ties: {
      type: Number,
      default: 0,
    },
    totalBattles: {
      type: Number,
      default: 0,
    },
    lastBattleAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'model_rankings',
  }
);

ModelRankingSchema.index({ domainId: 1, modelId: 1 }, { unique: true });
ModelRankingSchema.index({ domainId: 1, rank: 1 });

export default mongoose.models.ModelRanking || mongoose.model<IModelRanking>('ModelRanking', ModelRankingSchema);

