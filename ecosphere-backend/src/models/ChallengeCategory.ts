import mongoose, { Document, Schema } from 'mongoose';

export interface IChallengeCategory extends Document {
  name: string;
  type: string; // e.g., 'CHALLENGE'
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const challengeCategorySchema = new Schema<IChallengeCategory>({
  name: { type: String, required: true },
  type: { type: String, default: 'CHALLENGE' },
  status: { type: String, default: 'ACTIVE', index: true }
}, { timestamps: true });

export const ChallengeCategory = mongoose.model<IChallengeCategory>('ChallengeCategory', challengeCategorySchema);
