import mongoose, { Document, Schema } from 'mongoose';

export interface IAudit extends Document {
  scope: string;
  auditorId: mongoose.Types.ObjectId;
  date: Date;
  findings: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditSchema = new Schema<IAudit>({
  scope: { type: String, required: true },
  auditorId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  date: { type: Date, required: true, index: true },
  findings: { type: String, required: true }
}, { timestamps: true });

export const Audit = mongoose.model<IAudit>('Audit', auditSchema);
