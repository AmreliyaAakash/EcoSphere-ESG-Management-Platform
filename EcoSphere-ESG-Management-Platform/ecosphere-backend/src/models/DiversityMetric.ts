import mongoose, { Document, Schema } from 'mongoose';

export interface IDiversityMetric extends Document {
  type: 'GENDER' | 'DEPARTMENT' | 'ETHNICITY';
  category: string;
  value: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

const diversityMetricSchema = new Schema<IDiversityMetric>({
  type: { type: String, required: true, enum: ['GENDER', 'DEPARTMENT', 'ETHNICITY'], index: true },
  category: { type: String, required: true },
  value: { type: Number, required: true },
  label: { type: String, required: true }
}, { timestamps: true });

export const DiversityMetric = mongoose.model<IDiversityMetric>('DiversityMetric', diversityMetricSchema);
