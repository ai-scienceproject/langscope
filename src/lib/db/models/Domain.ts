import mongoose, { Schema, Document } from 'mongoose';

export interface IDomain extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new Schema<IDomain>(
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
    description: {
      type: String,
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'domains',
  }
);

// slug index is automatically created by unique: true
DomainSchema.index({ isActive: 1 });

export default mongoose.models.Domain || mongoose.model<IDomain>('Domain', DomainSchema);

