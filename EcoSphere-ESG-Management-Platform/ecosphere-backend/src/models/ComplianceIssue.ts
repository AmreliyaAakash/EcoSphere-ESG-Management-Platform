import mongoose, { Document, Schema } from 'mongoose';

export interface IComplianceIssue extends Document {
  auditId: mongoose.Types.ObjectId;
  severity: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  dueDate: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'OVERDUE' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const complianceIssueSchema = new Schema<IComplianceIssue>({
  auditId: { type: Schema.Types.ObjectId, ref: 'Audit', required: true, index: true },
  severity: { type: String, required: true },
  description: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  dueDate: { type: Date, required: true, index: true },
  status: { 
    type: String, 
    enum: ['OPEN', 'IN_PROGRESS', 'OVERDUE', 'RESOLVED'], 
    default: 'OPEN',
    index: true
  }
}, { timestamps: true });

export const ComplianceIssue = mongoose.model<IComplianceIssue>('ComplianceIssue', complianceIssueSchema);
