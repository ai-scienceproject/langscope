import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVerificationRecord extends Document {
  recordType: string;
  recordId: Types.ObjectId;
  dataHash: string;
  metadata?: Record<string, any>;
  verifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRecordSchema = new Schema<IVerificationRecord>(
  {
    recordType: {
      type: String,
      required: true,
    },
    recordId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    dataHash: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'verification_records',
  }
);

VerificationRecordSchema.index({ recordType: 1, recordId: 1 });
VerificationRecordSchema.index({ dataHash: 1 });

export default mongoose.models.VerificationRecord || mongoose.model<IVerificationRecord>('VerificationRecord', VerificationRecordSchema);

