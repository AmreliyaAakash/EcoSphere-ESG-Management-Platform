import mongoose, { Document, Schema } from 'mongoose';

export interface IChallengeParticipation extends Document {
  challengeId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  progress: number;
  proofUrl?: string;
  approval: string;
  xpAwarded: number;
  createdAt: Date;
  updatedAt: Date;
}

const challengeParticipationSchema = new Schema<IChallengeParticipation>({
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  progress: { type: Number, default: 0 },
  proofUrl: { type: String },
  approval: { type: String, default: 'PENDING', index: true },
  xpAwarded: { type: Number, default: 0 }
}, { timestamps: true });

export const ChallengeParticipation = mongoose.model<IChallengeParticipation>('ChallengeParticipation', challengeParticipationSchema);
