import mongoose, { Schema, Document, Types } from 'mongoose';
import { BattleWinner } from './Battle';

export interface IJudgeVote extends Document {
  battleId: Types.ObjectId;
  judgeId?: Types.ObjectId;
  judgeName?: string;
  vote: BattleWinner;
  reasoning?: string;
  criteria: Record<string, any>;
  confidence?: number;
  createdAt: Date;
}

const JudgeVoteSchema = new Schema<IJudgeVote>(
  {
    battleId: {
      type: Schema.Types.ObjectId,
      ref: 'Battle',
      required: true,
    },
    judgeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    judgeName: {
      type: String,
    },
    vote: {
      type: String,
      required: true,
      enum: Object.values(BattleWinner),
    },
    reasoning: {
      type: String,
    },
    criteria: {
      type: Schema.Types.Mixed,
      required: true,
    },
    confidence: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'judge_votes',
  }
);

JudgeVoteSchema.index({ battleId: 1 });

export default mongoose.models.JudgeVote || mongoose.model<IJudgeVote>('JudgeVote', JudgeVoteSchema);

