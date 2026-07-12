import mongoose, { Document, Schema } from 'mongoose';

export interface IReward extends Document {
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const rewardSchema = new Schema<IReward>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  status: { type: String, default: 'AVAILABLE', index: true }
}, { timestamps: true });

export const Reward = mongoose.model<IReward>('Reward', rewardSchema);
