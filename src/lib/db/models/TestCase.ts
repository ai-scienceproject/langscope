import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITestCase extends Document {
  domainId: Types.ObjectId;
  title: string;
  prompt: string;
  expectedCriteria: Record<string, any>;
  difficulty?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>(
  {
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    expectedCriteria: {
      type: Schema.Types.Mixed,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'test_cases',
  }
);

TestCaseSchema.index({ domainId: 1 });
TestCaseSchema.index({ isActive: 1 });

export default mongoose.models.TestCase || mongoose.model<ITestCase>('TestCase', TestCaseSchema);

