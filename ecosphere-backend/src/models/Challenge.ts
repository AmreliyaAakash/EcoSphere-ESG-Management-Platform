import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  xp: number;
  difficulty: string;
  evidenceRequired: boolean;
  deadline: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>({
  title: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ChallengeCategory', required: true, index: true },
  description: { type: String, required: true },
  xp: { type: Number, required: true },
  difficulty: { type: String, required: true },
  evidenceRequired: { type: Boolean, default: false },
  deadline: { type: Date, required: true, index: true },
  status: { type: String, default: 'ACTIVE', index: true }
}, { timestamps: true });

export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);
