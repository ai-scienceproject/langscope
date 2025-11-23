import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IModel extends Document {
  name: string;
  slug: string;
  organizationId: Types.ObjectId;
  description?: string;
  version?: string;
  strengths?: string[];
  weaknesses?: string[];
  pricing?: {
    inputCostPer1MTokens: number;
    outputCostPer1MTokens: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ModelSchema = new Schema<IModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    description: {
      type: String,
    },
    version: {
      type: String,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    pricing: {
      inputCostPer1MTokens: {
        type: Number,
        default: 0,
      },
      outputCostPer1MTokens: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'models',
  }
);

// slug index is automatically created by unique: true
ModelSchema.index({ organizationId: 1 });

export default mongoose.models.Model || mongoose.model<IModel>('Model', ModelSchema);

