import mongoose, { Document, Schema } from 'mongoose';

export interface ICSRActivity extends Document {
  title: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  date: Date;
  departmentId: mongoose.Types.ObjectId;
  evidenceRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const csrActivitySchema = new Schema<ICSRActivity>({
  title: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'CSRCategory', required: true, index: true },
  description: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  evidenceRequired: { type: Boolean, default: false }
}, { timestamps: true });

export const CSRActivity = mongoose.model<ICSRActivity>('CSRActivity', csrActivitySchema);
