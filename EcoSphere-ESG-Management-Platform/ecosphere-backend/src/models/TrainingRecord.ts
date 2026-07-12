import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainingRecord extends Document {
  employeeId: mongoose.Types.ObjectId;
  courseName: string;
  completionDate?: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const trainingRecordSchema = new Schema<ITrainingRecord>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  courseName: { type: String, required: true },
  completionDate: { type: Date },
  status: { type: String, required: true, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED', index: true },
  progress: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export const TrainingRecord = mongoose.model<ITrainingRecord>('TrainingRecord', trainingRecordSchema);
