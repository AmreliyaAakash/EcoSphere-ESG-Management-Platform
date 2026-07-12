import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  unlockRule: {
    type: 'XP' | 'CHALLENGES_COMPLETED';
    threshold: number;
  };
  iconUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  unlockRule: {
    type: { type: String, enum: ['XP', 'CHALLENGES_COMPLETED'], required: true },
    threshold: { type: Number, required: true }
  },
  iconUrl: { type: String, required: true }
}, { timestamps: true });

export const Badge = mongoose.model<IBadge>('Badge', badgeSchema);
