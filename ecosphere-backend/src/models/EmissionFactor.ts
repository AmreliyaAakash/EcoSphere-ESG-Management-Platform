import mongoose, { Document, Schema } from 'mongoose';

export interface IEmissionFactor extends Document {
  activityType: string;
  unit: string;
  co2ePerUnit: number;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const emissionFactorSchema = new Schema<IEmissionFactor>({
  activityType: { type: String, required: true },
  unit: { type: String, required: true },
  co2ePerUnit: { type: Number, required: true },
  source: { type: String, required: true }
}, { timestamps: true });

export const EmissionFactor = mongoose.model<IEmissionFactor>('EmissionFactor', emissionFactorSchema);
