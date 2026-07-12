import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeBadge extends Document {
  employeeId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  awardedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const employeeBadgeSchema = new Schema<IEmployeeBadge>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true, index: true },
  awardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const EmployeeBadge = mongoose.model<IEmployeeBadge>('EmployeeBadge', employeeBadgeSchema);
