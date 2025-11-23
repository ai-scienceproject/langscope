import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvaluation extends Document {
  userId?: Types.ObjectId;
  domainId: Types.ObjectId;
  status: string;
  totalBattles: number;
  completedBattles: number;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema = new Schema<IEvaluation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending',
    },
    totalBattles: {
      type: Number,
      default: 0,
    },
    completedBattles: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'evaluations',
  }
);

EvaluationSchema.index({ userId: 1 });
EvaluationSchema.index({ domainId: 1 });
EvaluationSchema.index({ status: 1 });

export default mongoose.models.Evaluation || mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);

