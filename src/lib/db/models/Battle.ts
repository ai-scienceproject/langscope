import mongoose, { Schema, Document, Types } from 'mongoose';

export enum BattleWinner {
  MODEL_A = 'MODEL_A',
  MODEL_B = 'MODEL_B',
  TIE = 'TIE',
}

export interface IBattle extends Document {
  evaluationId: Types.ObjectId;
  domainId: Types.ObjectId;
  testCaseId: Types.ObjectId;
  modelAId: Types.ObjectId;
  modelBId: Types.ObjectId;
  responseA: string;
  responseB: string;
  winner?: BattleWinner;
  judgeCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const BattleSchema = new Schema<IBattle>(
  {
    evaluationId: {
      type: Schema.Types.ObjectId,
      ref: 'Evaluation',
      required: true,
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    testCaseId: {
      type: Schema.Types.ObjectId,
      ref: 'TestCase',
      required: true,
    },
    modelAId: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
      required: true,
    },
    modelBId: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
      required: true,
    },
    responseA: {
      type: String,
      required: true,
    },
    responseB: {
      type: String,
      required: true,
    },
    winner: {
      type: String,
      enum: Object.values(BattleWinner),
    },
    judgeCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'completed', 'failed'],
    },
  },
  {
    timestamps: true,
    collection: 'battles',
  }
);

BattleSchema.index({ evaluationId: 1 });
BattleSchema.index({ domainId: 1 });
BattleSchema.index({ modelAId: 1, modelBId: 1 });

export default mongoose.models.Battle || mongoose.model<IBattle>('Battle', BattleSchema);

