import mongoose, { Document, Schema } from 'mongoose';

export interface IESGConfig extends Document {
  envWeight: number;
  socialWeight: number;
  govWeight: number;
  autoEmissionCalc: boolean;
  evidenceRequired: boolean;
  badgeAutoAward: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const esgConfigSchema = new Schema<IESGConfig>({
  envWeight: { type: Number, default: 40 },
  socialWeight: { type: Number, default: 30 },
  govWeight: { type: Number, default: 30 },
  autoEmissionCalc: { type: Boolean, default: true },
  evidenceRequired: { type: Boolean, default: true },
  badgeAutoAward: { type: Boolean, default: false }
}, { timestamps: true });

export const ESGConfig = mongoose.model<IESGConfig>('ESGConfig', esgConfigSchema);
