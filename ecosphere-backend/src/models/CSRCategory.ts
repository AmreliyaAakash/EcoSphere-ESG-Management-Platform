import mongoose, { Document, Schema } from 'mongoose';

export interface ICSRCategory extends Document {
  name: string;
  type: string; // e.g., 'CSR_ACTIVITY'
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const csrCategorySchema = new Schema<ICSRCategory>({
  name: { type: String, required: true },
  type: { type: String, default: 'CSR_ACTIVITY' },
  status: { type: String, default: 'ACTIVE', index: true }
}, { timestamps: true });

export const CSRCategory = mongoose.model<ICSRCategory>('CSRCategory', csrCategorySchema);
