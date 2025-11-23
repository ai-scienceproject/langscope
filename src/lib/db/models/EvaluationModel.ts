import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvaluationModel extends Document {
  evaluationId: Types.ObjectId;
  modelId: Types.ObjectId;
}

const EvaluationModelSchema = new Schema<IEvaluationModel>(
  {
    evaluationId: {
      type: Schema.Types.ObjectId,
      ref: 'Evaluation',
      required: true,
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
      required: true,
    },
  },
  {
    timestamps: false,
    collection: 'evaluation_models',
  }
);

EvaluationModelSchema.index({ evaluationId: 1, modelId: 1 }, { unique: true });

export default mongoose.models.EvaluationModel || mongoose.model<IEvaluationModel>('EvaluationModel', EvaluationModelSchema);

