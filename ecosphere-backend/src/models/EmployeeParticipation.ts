import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeParticipation extends Document {
  employeeId: mongoose.Types.ObjectId;
  activityId: mongoose.Types.ObjectId;
  proofUrl?: string;
  approvalStatus: string;
  pointsEarned: number;
  completionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const employeeParticipationSchema = new Schema<IEmployeeParticipation>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  activityId: { type: Schema.Types.ObjectId, ref: 'CSRActivity', required: true, index: true },
  proofUrl: { type: String },
  approvalStatus: { type: String, default: 'PENDING', index: true },
  pointsEarned: { type: Number, default: 0 },
  completionDate: { type: Date, required: true }
}, { timestamps: true });

export const EmployeeParticipation = mongoose.model<IEmployeeParticipation>('EmployeeParticipation', employeeParticipationSchema);
