import mongoose, { Document, Schema } from 'mongoose';

export interface IPolicyAcknowledgement extends Document {
  employeeId: mongoose.Types.ObjectId;
  policyId: mongoose.Types.ObjectId;
  acknowledgedAt: Date;
  signedFileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const policyAcknowledgementSchema = new Schema<IPolicyAcknowledgement>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  policyId: { type: Schema.Types.ObjectId, ref: 'Policy', required: true, index: true },
  acknowledgedAt: { type: Date, default: Date.now },
  signedFileUrl: { type: String }
}, { timestamps: true });

export const PolicyAcknowledgement = mongoose.model<IPolicyAcknowledgement>('PolicyAcknowledgement', policyAcknowledgementSchema);
