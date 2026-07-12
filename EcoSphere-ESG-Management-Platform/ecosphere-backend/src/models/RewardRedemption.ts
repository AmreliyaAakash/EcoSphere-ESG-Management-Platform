import mongoose, { Document, Schema } from 'mongoose';

export interface IRewardRedemption extends Document {
  employeeId: mongoose.Types.ObjectId;
  rewardId: mongoose.Types.ObjectId;
  pointsSpent: number;
  redeemedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rewardRedemptionSchema = new Schema<IRewardRedemption>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  rewardId: { type: Schema.Types.ObjectId, ref: 'Reward', required: true, index: true },
  pointsSpent: { type: Number, required: true },
  redeemedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const RewardRedemption = mongoose.model<IRewardRedemption>('RewardRedemption', rewardRedemptionSchema);
