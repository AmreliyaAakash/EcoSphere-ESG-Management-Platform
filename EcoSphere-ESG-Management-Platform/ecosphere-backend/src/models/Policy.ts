import mongoose, { Document, Schema } from 'mongoose';

export interface IPolicy extends Document {
  title: string;
  description: string;
  category: string;
  version: string;
  fileUrl: string;
  signatureRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicy>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  version: { type: String, required: true },
  fileUrl: { type: String, required: true },
  signatureRequired: { type: Boolean, default: false }
}, { timestamps: true });

export const Policy = mongoose.model<IPolicy>('Policy', policySchema);
