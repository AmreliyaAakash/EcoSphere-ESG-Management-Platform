import mongoose, { Document, Schema } from 'mongoose';

export interface IEnvironmentalGoal extends Document {
  metric: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  departmentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const environmentalGoalSchema = new Schema<IEnvironmentalGoal>({
  metric: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  deadline: { type: Date, required: true, index: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true }
}, { timestamps: true });

export const EnvironmentalGoal = mongoose.model<IEnvironmentalGoal>('EnvironmentalGoal', environmentalGoalSchema);
